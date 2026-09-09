/**
 * 管理相关路由
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { randomUUID, randomInt } = require('crypto');
const XLSX = require('xlsx');
const { config } = require('../config');
const { logger } = require('../logger');
const {
  readUsersDB, writeUsersDB,
  readApplicationsDB, writeApplicationsDB,
  readCasesDB, writeCasesDB,
  readServicesConfig, writeServicesConfig,
  readReviewsDB, writeReviewsDB,
  readAccountRequestsDB, writeAccountRequestsDB
} = require('../storage');
const { authRequired, roleRequired } = require('../middleware/auth');
const { sanitizeBody, requireFields, validateQuery } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

// 所有管理路由都需要认证
router.use(authRequired);

/**
 * 获取仪表板统计数据
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const [applications, users, cases] = await Promise.all([
    readApplicationsDB(),
    readUsersDB(),
    readCasesDB()
  ]);

  let filteredApplications = applications;

  // 根据角色过滤数据
  if (req.user.role === 'dsl_admin') {
    filteredApplications = applications.filter(app => app.serviceId === '13');
  } else if (req.user.role === 'study_admin') {
    filteredApplications = applications.filter(app => app.serviceId === '9');
  }

  const stats = {
    totalOrders: filteredApplications.length,
    pendingOrders: filteredApplications.filter(app => app.status === '待处理').length,
    processingOrders: filteredApplications.filter(app => app.status === '处理中').length,
    completedOrders: filteredApplications.filter(app => app.status === '已完成').length,
    totalUsers: users.length,
    totalCases: cases.length,
    recentOrders: filteredApplications
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 10)
  };

  res.json({
    success: true,
    stats
  });
}));

/**
 * 获取申请列表
 */
router.get('/applications', validateQuery({
  page: { type: 'number', min: 1 },
  limit: { type: 'number', min: 1, max: 100 },
  status: { type: 'string' },
  serviceId: { type: 'string' }
}), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, serviceId } = req.query;

  let applications = await readApplicationsDB();

  // 根据角色过滤
  if (req.user.role === 'dsl_admin') {
    applications = applications.filter(app => app.serviceId === '13');
  } else if (req.user.role === 'study_admin') {
    applications = applications.filter(app => app.serviceId === '9');
  }

  // 状态筛选
  if (status) {
    applications = applications.filter(app => app.status === status);
  }

  // 服务ID筛选
  if (serviceId) {
    applications = applications.filter(app => app.serviceId === serviceId);
  }

  // 排序
  applications.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  // 分页
  const total = applications.length;
  const start = (page - 1) * limit;
  const paginated = applications.slice(start, start + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

/**
 * 更新申请状态
 */
router.post('/applications/:id', sanitizeBody, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  const applications = await readApplicationsDB();
  const appIndex = applications.findIndex(app => app.id === id);

  if (appIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '申请不存在'
    });
  }

  const app = applications[appIndex];

  // 权限检查
  if (req.user.role === 'dsl_admin' && app.serviceId !== '13') {
    return res.status(403).json({
      success: false,
      message: '无权操作此申请'
    });
  }

  if (req.user.role === 'study_admin' && app.serviceId !== '9') {
    return res.status(403).json({
      success: false,
      message: '无权操作此申请'
    });
  }

  applications[appIndex] = {
    ...app,
    status: status || app.status,
    remark: remark !== undefined ? remark : app.remark,
    updateTime: new Date().toISOString()
  };

  await writeApplicationsDB(applications);

  logger.info('Application updated', {
    applicationId: id,
    status,
    adminId: req.user.id
  });

  res.json({
    success: true,
    data: applications[appIndex]
  });
}));

/**
 * 导出申请为 Excel
 */
router.get('/applications/export', asyncHandler(async (req, res) => {
  let applications = await readApplicationsDB();

  // 根据角色过滤
  if (req.user.role === 'dsl_admin') {
    applications = applications.filter(app => app.serviceId === '13');
  } else if (req.user.role === 'study_admin') {
    applications = applications.filter(app => app.serviceId === '9');
  }

  // 准备导出数据
  const exportData = applications.map(app => ({
    '申请ID': app.id,
    '服务名称': app.serviceName,
    '联系人': app.contactName,
    '联系电话': app.contactPhone,
    '状态': app.status,
    '申请时间': app.createTime,
    '备注': app.remark || ''
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(workbook, worksheet, '申请列表');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', `attachment; filename=applications_${Date.now()}.xlsx`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  logger.info('Applications exported', {
    count: applications.length,
    adminId: req.user.id
  });

  res.send(buffer);
}));

/**
 * 获取用户列表
 */
router.get('/users', roleRequired(['admin']), asyncHandler(async (req, res) => {
  const users = await readUsersDB();
  const keyword = String(req.query.keyword || '').trim().toLowerCase();

  // 清理敏感信息
  const safeUsers = users.map(u => {
    const { password, passwordHash, refreshToken, refreshTokenExpiresAt, wxSessionKey, ...safe } = u;
    return safe;
  });

  // 账号找回场景下按手机号/姓名/用户名检索
  const filtered = keyword
    ? safeUsers.filter(u => [u.phone, u.name, u.username]
      .some(field => String(field || '').toLowerCase().includes(keyword)))
    : safeUsers;

  res.json({
    success: true,
    data: filtered
  });
}));

/**
 * 更新用户角色
 */
router.post('/users/:id/role', sanitizeBody, requireFields('role'), roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const allowedRoles = ['user', 'admin', 'dsl_admin', 'study_admin'];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `无效的角色。允许的角色: ${allowedRoles.join(', ')}`
    });
  }

  const users = await readUsersDB();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  // 防止修改超级管理员角色
  if (users[userIndex].phone === config.admin.superAdminPhone && role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '无法修改超级管理员角色'
    });
  }

  const oldRole = users[userIndex].role;
  users[userIndex].role = role;

  await writeUsersDB(users);

  logger.info('User role updated', {
    userId: id,
    oldRole,
    newRole: role,
    adminId: req.user.id
  });

  res.json({
    success: true,
    message: '角色更新成功'
  });
}));

// 临时密码字符集，剔除易混淆字符，便于管理员口述/转录给用户
const TEMP_PASSWORD_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateTempPassword(length = 10) {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += TEMP_PASSWORD_CHARS[randomInt(TEMP_PASSWORD_CHARS.length)];
  }
  return password;
}

/**
 * 判断是否可以操作目标账号
 * 超级管理员账号仅允许其本人操作
 */
function assertOperable(target, requester) {
  if (target.phone !== config.admin.superAdminPhone) return null;
  if (requester && requester.phone === config.admin.superAdminPhone) return null;
  return '超级管理员账号仅可由本人操作';
}

/**
 * 更新用户信息（账号找回：管理员协助修正手机号、姓名、用户名）
 */
router.put('/users/:id', sanitizeBody, roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, username, avatar } = req.body;

  const users = await readUsersDB();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const target = users[userIndex];
  const requester = users.find(u => u.id === req.user.id);

  const forbidden = assertOperable(target, requester);
  if (forbidden) {
    return res.status(403).json({ success: false, message: forbidden });
  }

  const updates = {};

  if (phone !== undefined) {
    const nextPhone = String(phone).trim();
    if (nextPhone && !/^1[3-9]\d{9}$/.test(nextPhone)) {
      return res.status(400).json({ success: false, message: '手机号格式不正确' });
    }
    if (nextPhone && users.some(u => u.id !== id && u.phone === nextPhone)) {
      return res.status(400).json({ success: false, message: '该手机号已被其他账号使用' });
    }
    updates.phone = nextPhone;
  }

  if (username !== undefined) {
    const nextUsername = String(username).trim();
    if (nextUsername && users.some(u => u.id !== id && u.username === nextUsername)) {
      return res.status(400).json({ success: false, message: '该用户名已被其他账号使用' });
    }
    updates.username = nextUsername;
  }

  if (name !== undefined) updates.name = String(name).trim();
  if (avatar !== undefined) updates.avatar = avatar;

  users[userIndex] = { ...target, ...updates };
  await writeUsersDB(users);

  logger.info('Admin updated user profile', {
    userId: id,
    fields: Object.keys(updates),
    adminId: req.user.id
  });

  const { password, passwordHash, refreshToken, refreshTokenExpiresAt, wxSessionKey, ...safe } = users[userIndex];

  res.json({
    success: true,
    message: '用户信息已更新',
    data: safe
  });
}));

/**
 * 重置用户密码（账号找回核心操作）
 * 不传 password 时生成临时密码，明文仅在本次响应中返回一次
 */
router.post('/users/:id/reset-password', sanitizeBody, roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const users = await readUsersDB();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const target = users[userIndex];
  const requester = users.find(u => u.id === req.user.id);

  const forbidden = assertOperable(target, requester);
  if (forbidden) {
    return res.status(403).json({ success: false, message: forbidden });
  }

  const isCustom = password !== undefined && String(password).trim() !== '';
  const newPassword = isCustom ? String(password).trim() : generateTempPassword();

  if (isCustom && newPassword.length < 6) {
    return res.status(400).json({ success: false, message: '密码长度不能少于6位' });
  }

  users[userIndex] = {
    ...target,
    password: '',
    passwordHash: await bcrypt.hash(newPassword, 10),
    // 重置后强制目标账号在各端重新登录
    refreshToken: '',
    refreshTokenExpiresAt: null,
    passwordResetAt: new Date().toISOString(),
    passwordResetBy: req.user.id,
    // 强制用户下次登录后设置自己的新密码
    mustChangePassword: true
  };

  await writeUsersDB(users);

  logger.info('Admin reset user password', {
    userId: id,
    custom: isCustom,
    adminId: req.user.id
  });

  res.json({
    success: true,
    message: '密码已重置，用户需重新登录并设置自己的新密码',
    // 明文密码不落库、不写日志，仅此处返回一次
    password: newPassword
  });
}));

/**
 * 注销用户账号（后台人工注销）
 * 一期采用人工核实后由管理员执行：删除账号登录凭证与个人资料。
 * 超级管理员账号不允许被注销，避免平台失去管理入口。
 */
router.delete('/users/:id', sanitizeBody, roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const users = await readUsersDB();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }

  const target = users[userIndex];

  // 超级管理员账号禁止注销
  if (target.phone === config.admin.superAdminPhone) {
    return res.status(403).json({
      success: false,
      message: '超级管理员账号不可注销'
    });
  }

  // 不允许注销自己，防止误操作导致当前管理员失联
  if (target.id === req.user.id) {
    return res.status(403).json({
      success: false,
      message: '不可注销当前登录的管理员账号'
    });
  }

  const cancelled = {
    phone: target.phone || '',
    username: target.username || '',
    name: target.name || ''
  };

  users.splice(userIndex, 1);
  await writeUsersDB(users);

  logger.info('Admin cancelled user account', {
    userId: id,
    adminId: req.user.id,
    cancelled
  });

  res.json({
    success: true,
    message: '账号已注销，该用户的登录凭证与个人资料已删除'
  });
}));

/**
 * 获取服务配置
 */
router.get('/services/config', asyncHandler(async (req, res) => {
  const config = await readServicesConfig();

  // 研学管理员只能看到服务9
  if (req.user.role === 'study_admin') {
    return res.json({
      success: true,
      data: { '9': config['9'] }
    });
  }

  // DSL管理员只能看到服务13
  if (req.user.role === 'dsl_admin') {
    return res.json({
      success: true,
      data: { '13': config['13'] }
    });
  }

  res.json({
    success: true,
    data: config
  });
}));

/**
 * 更新服务配置
 */
router.post('/services/config', sanitizeBody, asyncHandler(async (req, res) => {
  const servicesConfig = await readServicesConfig();
  const newConfig = req.body;

  // 研学管理员只能修改服务9
  if (req.user.role === 'study_admin') {
    if (newConfig['9']) {
      servicesConfig['9'] = { ...servicesConfig['9'], ...newConfig['9'] };
    } else {
      return res.status(403).json({
        success: false,
        message: '无权修改此服务配置'
      });
    }
  }
  // DSL管理员只能修改服务13
  else if (req.user.role === 'dsl_admin') {
    if (newConfig['13']) {
      servicesConfig['13'] = { ...servicesConfig['13'], ...newConfig['13'] };
    } else {
      return res.status(403).json({
        success: false,
        message: '无权修改此服务配置'
      });
    }
  }
  // 超级管理员可以修改所有配置
  else if (req.user.role === 'admin') {
    Object.assign(servicesConfig, newConfig);
  } else {
    return res.status(403).json({
      success: false,
      message: '无权修改服务配置'
    });
  }

  await writeServicesConfig(servicesConfig);

  logger.info('Services config updated', {
    adminId: req.user.id,
    roles: req.user.role
  });

  res.json({
    success: true,
    message: '配置更新成功'
  });
}));

/**
 * 获取研学展示数据
 */
router.get('/study/showcase', asyncHandler(async (req, res) => {
  const config = await readServicesConfig();
  const showcase = config['9']?.studyShowcase || [];

  res.json({
    success: true,
    data: showcase
  });
}));

/**
 * 更新研学展示数据
 */
router.post('/study/showcase', sanitizeBody, asyncHandler(async (req, res) => {
  const { showcase } = req.body;

  if (!Array.isArray(showcase)) {
    return res.status(400).json({
      success: false,
      message: '展示数据必须是数组'
    });
  }

  const servicesConfig = await readServicesConfig();

  if (!servicesConfig['9']) {
    servicesConfig['9'] = {};
  }

  servicesConfig['9'].studyShowcase = showcase;

  await writeServicesConfig(servicesConfig);

  logger.info('Study showcase updated', {
    count: showcase.length,
    adminId: req.user.id
  });

  res.json({
    success: true,
    message: '研学展示更新成功'
  });
}));

/**
 * 获取所有评价（管理员）
 */
router.get('/reviews', asyncHandler(async (req, res) => {
  const { section, status, page = 1, limit = 20 } = req.query;

  let reviews = await readReviewsDB();

  if (section) {
    reviews = reviews.filter(r => r.section === section);
  }
  if (status) {
    reviews = reviews.filter(r => r.status === status);
  }

  reviews.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));

  const total = reviews.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = reviews.slice(start, start + parseInt(limit));

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
}));

/**
 * 审核评价（通过/拒绝）
 */
router.post('/reviews/:id', sanitizeBody, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: '状态必须为 approved 或 rejected'
    });
  }

  const reviews = await readReviewsDB();
  const index = reviews.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '评价不存在'
    });
  }

  reviews[index] = {
    ...reviews[index],
    status,
    reviewTime: new Date().toISOString()
  };

  await writeReviewsDB(reviews);

  logger.info('Review updated', {
    reviewId: id,
    status,
    adminId: req.user.id
  });

  res.json({
    success: true,
    data: reviews[index]
  });
}));

/**
 * 删除评价
 */
router.delete('/reviews/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reviews = await readReviewsDB();
  const index = reviews.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '评价不存在'
    });
  }

  reviews.splice(index, 1);
  await writeReviewsDB(reviews);

  logger.info('Review deleted', {
    reviewId: id,
    adminId: req.user.id
  });

  res.json({
    success: true,
    message: '评价已删除'
  });
}));

/**
 * 账号找回 / 注销 申请管理（后台人工处理）
 * 前端仅提交申请，管理员在此查看并标记处理结果（核实后配合用户管理的重置密码 / 注销操作）。
 */
const ACCOUNT_REQUEST_TYPES = { recovery: '账号找回', cancellation: '账号注销' };
const ACCOUNT_REQUEST_STATUS = ['pending', 'processed', 'rejected'];

// 列表（可按 type / status 过滤，最新在前）
router.get('/account-requests', roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  let list = await readAccountRequestsDB();
  if (type && ACCOUNT_REQUEST_TYPES[type]) list = list.filter(r => r.type === type);
  if (status && ACCOUNT_REQUEST_STATUS.includes(status)) list = list.filter(r => r.status === status);
  list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: list });
}));

// 更新处理状态 / 备注
router.put('/account-requests/:id', sanitizeBody, roleRequired(['admin']), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body || {};
  if (status && !ACCOUNT_REQUEST_STATUS.includes(status)) {
    return res.status(400).json({ success: false, message: '状态不正确' });
  }
  const requests = await readAccountRequestsDB();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: '申请不存在' });
  }
  const target = requests[idx];
  const nextStatus = status || target.status;
  requests[idx] = {
    ...target,
    status: nextStatus,
    remark: remark !== undefined ? String(remark) : target.remark,
    handledAt: nextStatus === 'pending' ? null : new Date().toISOString(),
    handledBy: nextStatus === 'pending' ? null : req.user.id
  };
  await writeAccountRequestsDB(requests);

  logger.info('Account request updated', { id, status: nextStatus, adminId: req.user.id });
  res.json({ success: true, message: '已更新', data: requests[idx] });
}));

module.exports = router;
