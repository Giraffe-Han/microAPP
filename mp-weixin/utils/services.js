const services = [
  {
    id: '1',
    name: '无人机物流服务',
    slogan: '快速配送 · 安全可靠 · 覆盖全城',
    icon: '🚚',
    color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    mainColor: '#1677ff',
    intro:
      '无人机物流服务利用先进的无人机技术，为城市和偏远地区提供快速、高效的物资配送服务。',
    projects: [
      { name: '城市配送', icon: '购物' },
      { name: '紧急物资', icon: '警示' },
      { name: '医疗运输', icon: '医疗' },
      { name: '特殊货物', icon: '礼物' }
    ],
    advantages: ['2小时快速响应', '全程GPS跟踪', '专业团队操作', '全程保险覆盖']
  },
  {
    id: '2',
    name: '政务服务',
    slogan: '智能巡检 · 降本增效 · 精准监测',
    icon: '🏛️',
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#722ed1',
    intro: '专业提供政务服务，包括环保监测、安全巡查、设施检查等，助力智慧城市建设。',
    projects: [
      { name: '环保监测', icon: '环保' },
      { name: '安全巡查', icon: '安保' },
      { name: '设施检查', icon: '巡检' },
      { name: '交通监控', icon: '交通' }
    ],
    advantages: ['高清数据采集', '实时监控反馈', 'AI智能分析', '专业报告输出']
  },
  {
    id: '3',
    name: '无人机托管服务',
    slogan: '专业托管 · 安全放心 · 省心省力',
    icon: '📦',
    color: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    mainColor: '#52c41a',
    intro: '提供专业的无人机托管服务，包括保养维护、安全存储、代飞服务等一站式解决方案。',
    projects: [
      { name: '专业维护', icon: '维护' },
      { name: '安全存储', icon: '存储' },
      { name: '代飞服务', icon: '代飞' },
      { name: '保险服务', icon: '保险' }
    ],
    advantages: ['专业维保团队', '安全存储环境', '灵活服务套餐', '完善保险保障']
  },
  {
    id: '4',
    name: '无人机吊运服务',
    slogan: '高空作业 · 精准操控 · 安全高效',
    icon: '🏗️',
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#faad14',
    intro: '提供专业的无人机吊运服务，适用于高空作业、建筑施工、设备安装等场景。',
    projects: [
      { name: '高空吊运', icon: '吊运' },
      { name: '设备安装', icon: '安装' },
      { name: '建筑施工', icon: '施工' },
      { name: '特殊作业', icon: '作业' }
    ],
    advantages: ['专业吊运设备', '精准操控技术', '严格安全规范', '经验丰富团队']
  },
  {
    id: '5',
    name: '无人机表演服务',
    slogan: '震撼视觉 · 创意编排 · 精彩呈现',
    icon: '🎆',
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#eb2f96',
    intro:
      '提供专业的无人机表演服务，包括无人机编队飞行、灯光秀、创意表演等，为各类活动增添精彩亮点。',
    projects: [
      { name: '编队飞行', icon: '编队' },
      { name: '灯光秀', icon: '灯光' },
      { name: '创意表演', icon: '创意' },
      { name: '活动定制', icon: '定制' }
    ],
    advantages: ['创意编排', '震撼效果', '安全可控', '定制化服务']
  },
  {
    id: '6',
    name: '飞手培训服务',
    slogan: '专业培训 · 证书认证 · 实操教学',
    icon: '🎓',
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#faad14',
    intro:
      '提供专业的飞手培训服务，包括CAAC执照培训、技能提升、行业应用培训等，助力无人机人才培养。',
    projects: [
      { name: 'CAAC执照', icon: '执照' },
      { name: '技能培训', icon: '技能' },
      { name: '实操教学', icon: '实操' },
      { name: '行业应用', icon: '行业' }
    ],
    advantages: ['资质齐全', '经验丰富', '通过率高', '就业推荐']
  },
  {
    id: '7',
    name: '无人机租赁服务',
    slogan: '灵活租赁 · 多种机型 · 专业服务',
    icon: '🔄',
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#13c2c2',
    intro: '提供专业的无人机租赁服务，多种机型可选，灵活租赁方式，满足不同场景的使用需求。',
    projects: [
      { name: '设备租赁', icon: '租赁' },
      { name: '配件租赁', icon: '配件' },
      { name: '短期租赁', icon: '短期' },
      { name: '长期租赁', icon: '长期' }
    ],
    advantages: ['机型丰富', '价格优惠', '灵活租期', '技术支持']
  },
  {
    id: '8',
    name: '无人机外卖配送',
    slogan: '即时配送 · 快速送达 · 安全可靠',
    icon: '🍱',
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#f5222d',
    intro:
      '提供专业的无人机外卖配送服务，实现城市即时配送，快速安全，为用户带来全新的外卖体验。',
    projects: [
      { name: '即时配送', icon: '配送' },
      { name: '在线下单', icon: '下单' },
      { name: '实时追踪', icon: '追踪' },
      { name: '安全送达', icon: '安全' }
    ],
    advantages: ['30分钟送达', '全程保温保鲜', 'GPS实时跟踪', '无接触配送']
  },
  {
    id: '9',
    name: '低空研学服务',
    slogan: '科普教育 · 实践体验 · 创新培养',
    icon: '📘',
    color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    mainColor: '#722ed1',
    intro:
      '提供专业的低空研学服务，面向青少年开展无人机科普教育、飞行体验、创新实践等活动，激发科技兴趣，培养创新能力。',
    projects: [
      { name: '科普讲座', icon: '讲座' },
      { name: '飞行体验', icon: '体验' },
      { name: '组装实践', icon: '实践' },
      { name: '竞赛培训', icon: '竞赛' }
    ],
    advantages: ['专业导师团队', '安全场地保障', '完整课程体系', '实践动手能力']
  },
  {
    id: '10',
    name: '无人机二手交易',
    slogan: '诚信交易 · 专业检测 · 以旧换新',
    icon: '♻️',
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#fa8c16',
    intro:
      '提供专业的无人机二手交易平台，支持设备买卖、以旧换新、专业检测等服务，让闲置设备发挥价值。',
    projects: [
      { name: '设备买卖', icon: '买卖' },
      { name: '以旧换新', icon: '换新' },
      { name: '专业检测', icon: '检测' },
      { name: '质量保障', icon: '质保' }
    ],
    advantages: ['专业估值评测', '交易安全保障', '质保售后服务', '置换优惠政策']
  },
  {
    id: '11',
    name: '无人机金融服务',
    slogan: '设备保险 · 飞行护航 · 专业理赔',
    icon: '💼',
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#1677ff',
    intro:
      '提供专业的无人机金融保险服务，涵盖设备险、责任险、飞手险等多种保险产品，为您的飞行保驾护航。',
    projects: [
      { name: '设备保险', icon: '设备' },
      { name: '责任保险', icon: '责任' },
      { name: '飞手保险', icon: '飞手' },
      { name: '快速理赔', icon: '理赔' }
    ],
    advantages: ['全面保障覆盖', '快速理赔服务', '专业风险评估', '优惠保费政策']
  },
  {
    id: '12',
    name: '无人机维修服务',
    slogan: '专业维修 · 原厂配件 · 焕然一新',
    icon: '🛠️',
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#2f54eb',
    intro:
      '提供全方位的无人机维修与保养服务，拥有官方授权的专业技术团队和原厂配件库，解决各类硬件故障与软件问题，延长设备使用寿命。',
    projects: [
      { name: '故障维修', icon: '维修' },
      { name: '定期保养', icon: '保养' },
      { name: '配件更换', icon: '配件' },
      { name: '系统升级', icon: '升级' }
    ],
    advantages: ['官方授权认证', '原厂正品配件', '资深技师团队', '维修质保承诺']
  }
]

const trainingShowcase = [
  {
    title: '实训场地',
    desc: '3000㎡ 综合实训场地，覆盖起降、编队、特种作业等多种科目，真实环境快速积累飞行经验。',
    image: '/images/training/practice-field.svg'
  },
  {
    title: '模拟教室',
    desc: '搭载无人机模拟系统与XR教学屏，提前演练复杂空域任务，理论与实操一体化。',
    image: '/images/training/simulator-lab.svg'
  },
  {
    title: '取证辅导',
    desc: '教务团队提供报考、练考、面签全流程指导，结合历年考点精讲，确保稳健通过CAAC考试。',
    image: '/images/training/certification-support.svg'
  }
]

const getServiceById = (id) => services.find((item) => item.id === String(id))

module.exports = {
  services,
  getServiceById,
  trainingShowcase
}

