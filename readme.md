# 低空综合服务平台 (Low Altitude Comprehensive Service Platform)

本项目旨在为低空经济提供综合性的服务对接平台，包含 H5 移动端前端和 Node.js 后端服务。通过用户填报表单递交申请，后续人工联系用户进行业务对接。

## 🚀 快速启动

### 1. 环境准备
- **Node.js**: 版本 >= 16.0
- **npm**: 版本 >= 8.0

### 2. 启动后端服务 (Server)
后端服务基于 Express，提供 API 接口和文件上传功能。

```bash
cd server
npm install
# 开发环境启动
node index.js
# 或使用 pm2
# pm2 start index.js --name "low-altitude-server"
```
后端默认端口: `3000`

### 3. 启动前端 H5 (Client)
前端基于 Vue 3 + Vite + Vant 4。

```bash
cd h5-platform
npm install
npm run dev
```
前端访问地址: `http://localhost:5173`

---

## 📱 功能特性

### 核心业务
- **无人机物流服务**: 支持货物类型、重量、起止地点表单提交。
- **政务巡检服务**: 支持巡检类型、区域、时间预约。
- **无人机托管服务**: 机型、数量、托管时长管理。
- **无人机吊运服务**: 物品吊运需求对接。
- **案例展示**: 视频/图片混合轮播展示，支持后台上传。

### 用户功能
- **服务大厅**: 快捷服务入口、精选案例、平台优势展示。
- **全部服务**: 14项服务网格展示与搜索。
- **我的申请**: 申请记录状态跟踪（待处理/处理中/已完成）。
- **个人中心**: 用户信息管理、实名认证入口。
- **登录注册**: 手机号验证码登录流程。

### 后台管理
- **案例管理**: 支持管理员上传/编辑/删除案例。
- **申请管理**: 查看并处理用户提交的服务申请。

---

## 📂 项目结构

```
.
├── h5-platform/        # 前端项目 (Vue3 + Vite)
│   ├── src/
│   │   ├── views/      # 页面组件
│   │   ├── router/     # 路由配置
│   │   └── styles/     # 全局样式
│   └── vite.config.js  # Vite 配置 (含代理设置)
├── server/             # 后端项目 (Express)
│   ├── public/         # 静态资源 (uploads)
│   ├── data.json       # 数据存储 (JSON DB)
│   └── index.js        # 服务入口
├── docs/               # 项目文档与需求文件
└── README.md           # 本说明文件
```

## 🛠 技术栈

- **前端**: Vue 3, Vite, Vant 4, Axios, Pinia, Vue Router
- **后端**: Node.js, Express, Multer (文件上传)
- **部署**: Linux (Ubuntu), PM2, Nginx (可选)

## 📄 更多文档

详细的需求说明、一期工程大纲等文件请查看 `docs/` 目录。
