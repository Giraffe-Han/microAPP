// 兼容旧课程未标记场馆、以及使用场馆中文名称的配置。
const locationNames = {
  niushan: '牛山低空科创园',
  zhennan: '浙南低空飞行服务中心'
}

export const getStudyPackageLocation = (pkg) => {
  const location = pkg?.location || 'niushan'
  return Object.keys(locationNames).find(key => locationNames[key] === location) || location
}

export const getStudyLocationName = (key) => locationNames[key] || '低空研学'

// 展示说明依据课程名称匹配，不绑定套餐价格或标识，兼容后台调整内容。
const activities = {
  '低空展厅参观+沉浸式VR体验': { icon: 'eye-o', label: '沉浸探索', desc: '走进低空展厅，通过参观与VR体验感受低空科技。' },
  '低空课堂': { icon: 'notes-o', label: '科普课堂', desc: '在低空科普课堂中，认识无人机与飞行相关知识。' },
  '积木无人机拼搭': { icon: 'apps-o', label: '动手拼搭', desc: '用积木拼搭无人机，在动手实践中探索结构与组合。' },
  '无人机调试飞行': { icon: 'aim', label: '飞行实践', desc: '体验无人机调试与飞行，将拼搭探索延伸到飞行实践。' },
  '无人机拼搭（组装成品可带走）': { icon: 'apps-o', label: '组装体验', desc: '亲手拼搭组装无人机，组装成品可带走。' },
  '无人机试飞': { icon: 'aim', label: '试飞体验', desc: '体验无人机试飞，感受从动手组装到飞行的过程。' }
}

export const getStudyActivity = (name) => activities[name] || { icon: 'star-o', label: '研学体验', desc: '' }

export const getStudyPackageFeature = (items = []) => {
  if (items.some(item => typeof item === 'string' && item.includes('组装成品可带走'))) {
    return { icon: 'gift-o', title: '亲手组装 · 成品可带走', desc: '把动手组装的成果带回家，留下这次研学的记忆。' }
  }
  if (items.includes('积木无人机拼搭') && items.includes('无人机调试飞行')) {
    return { icon: 'apps-o', title: '积木拼搭 · 调试飞行', desc: '从创意拼搭到调试飞行，体验动手探索的乐趣。' }
  }
  return null
}

export const getStudyGallery = (location) => {
  const gallery = Array.isArray(location?.gallery) ? location.gallery : []
  return gallery.map(item => typeof item === 'string' ? { image: item } : item)
    .filter(item => item && typeof item.image === 'string' && item.image)
}

export const getStudyImageUrl = (url) => {
  if (typeof url !== 'string' || !url) return ''
  if (url.startsWith('http') || url.startsWith('/') || url.startsWith('data:')) return url
  return `/${url}`
}
