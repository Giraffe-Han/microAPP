# 自定义TabBar使用说明

## ✅ 已完成

### 1. 创建自定义TabBar组件
**文件路径**：`components/TabBar.vue`

- ✅ 完全自定义样式
- ✅ 黑色激活状态（#000000）
- ✅ 灰色未激活状态（#969799）
- ✅ 与H5版本保持一致
- ✅ 不受pages.json配置限制

### 2. 移除pages.json中的原生tabBar配置
- ✅ 已删除原生tabBar配置
- ✅ 现在可以完全控制Tab样式

---

## 📝 如何在页面中使用

### 方法1：在每个Tab页面中单独引入（推荐）

#### 示例：修改 `pages/home/index.vue`

在template最后、`</view>`结束标签之前添加：

```vue
<template>
  <view class="home-page">
    <!-- 原有页面内容 -->
    ...
    
    <!-- 添加自定义TabBar -->
    <TabBar :current="0" />
  </view>
</template>

<script setup>
// 在script顶部导入
import TabBar from '@/components/TabBar.vue'

// 原有代码...
</script>

<style>
/* 添加底部padding，避免内容被TabBar遮挡 */
.home-page {
  padding-bottom: 60px; /* 50px TabBar高度 + 10px 间距 */
}
</style>
```

#### current参数说明

| 页面 | current值 | 说明 |
|------|----------|------|
| pages/home/index | 0 | 服务大厅 |
| pages/services/index | 1 | 全部服务 |
| pages/applications/index | 2 | 我的申请 |
| pages/mine/index | 3 | 个人中心 |

---

### 方法2：创建全局Layout组件（可选）

#### 步骤1：创建Layout组件

**文件**：`components/Layout.vue`

```vue
<template>
  <view class="layout">
    <view class="layout-content">
      <slot></slot>
    </view>
    <TabBar :current="current" />
  </view>
</template>

<script setup>
import TabBar from './TabBar.vue'

defineProps({
  current: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  position: relative;
}

.layout-content {
  padding-bottom: 60px; /* 为TabBar留出空间 */
}
</style>
```

#### 步骤2：在页面中使用Layout

```vue
<template>
  <Layout :current="0">
    <!-- 页面内容 -->
    <view class="home-page">
      ...
    </view>
  </Layout>
</template>

<script setup>
import Layout from '@/components/Layout.vue'
</script>
```

---

## 🚀 快速实施步骤

### 第1步：修改4个Tab页面

需要修改以下4个文件：

1. **pages/home/index.vue** - current="0"
2. **pages/services/index.vue** - current="1"
3. **pages/applications/index.vue** - current="2"
4. **pages/mine/index.vue** - current="3"

### 第2步：在每个页面添加TabBar

#### 示例代码（通用模板）

```vue
<template>
  <view class="page-container">
    <!-- 原有页面内容 -->
    
    <!-- 在最后添加 -->
    <TabBar :current="X" />
  </view>
</template>

<script setup>
import TabBar from '@/components/TabBar.vue'

// 原有代码...
</script>

<style>
.page-container {
  padding-bottom: 60px;
}
</style>
```

### 第3步：重新编译

1. 保存所有修改的文件
2. 在微信开发者工具中点击"编译"
3. 查看效果

---

## 🎨 自定义TabBar优势

### 相比原生tabBar的优点：

✅ **完全控制样式**
- 可以任意修改颜色
- 可以添加动画效果
- 可以自定义图标

✅ **不受平台限制**
- 不需要清除缓存
- 立即生效
- 跨平台一致

✅ **更灵活**
- 可以添加角标
- 可以动态显示/隐藏
- 可以添加点击事件

✅ **与H5版本完全一致**
- 黑色激活状态
- 相同的交互体验

---

## 📊 颜色配置

当前TabBar颜色配置（在 `components/TabBar.vue` 中）：

```css
/* 未激活状态 */
.icon {
  color: #969799; /* 灰色 */
}

.tabbar-text {
  color: #969799; /* 灰色 */
}

/* 激活状态 */
.tabbar-item.active .icon {
  color: #000000; /* 黑色 ✅ */
}

.tabbar-item.active .tabbar-text {
  color: #000000; /* 黑色 ✅ */
}
```

### 修改颜色

如果需要修改为其他颜色（如紫色），只需修改以下两处：

```css
.tabbar-item.active .icon {
  color: #667eea; /* 改为紫色 */
}

.tabbar-item.active .tabbar-text {
  color: #667eea; /* 改为紫色 */
}
```

---

## 🔧 高级自定义

### 添加角标提示

```vue
<template>
  <view class="tabbar-item">
    <view class="tabbar-icon">
      <text class="icon"></text>
      <!-- 添加角标 -->
      <view v-if="badge" class="badge">{{ badge }}</view>
    </view>
    <text class="tabbar-text">文本</text>
  </view>
</template>

<style>
.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff0000;
  color: #ffffff;
  border-radius: 10px;
  padding: 2px 5px;
  font-size: 10px;
}
</style>
```

### 添加点击动画

```vue
<style>
.tabbar-item:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
</style>
```

### 动态显示/隐藏TabBar

```vue
<template>
  <TabBar v-if="showTabBar" :current="0" />
</template>

<script setup>
const showTabBar = ref(true)

// 根据需要控制显示/隐藏
const hideTabBar = () => {
  showTabBar.value = false
}
</script>
```

---

## 🐛 常见问题

### Q1: TabBar被页面内容遮挡？
**A:** 给页面容器添加底部padding：
```css
.page-container {
  padding-bottom: 60px;
}
```

### Q2: 切换页面时TabBar消失？
**A:** 确保每个Tab页面都引入了TabBar组件，并设置正确的current值。

### Q3: 图标不显示？
**A:** 
- 检查字体文件是否正确加载
- 或者使用图片替代图标：
```vue
<image class="icon-image" :src="item.icon" mode="aspectFit" />
```

### Q4: 想要使用图片图标而不是字体图标？
**A:** 修改 `components/TabBar.vue`：
```vue
<template>
  <view class="tabbar-icon">
    <image 
      class="icon-image" 
      :src="current === index ? item.selectedIcon : item.icon" 
      mode="aspectFit"
    />
  </view>
</template>

<script>
data() {
  return {
    tabList: [
      {
        text: '服务大厅',
        icon: '/static/icons/home.png',
        selectedIcon: '/static/icons/home-active.png',
        pagePath: '/pages/home/index'
      }
    ]
  }
}
</script>

<style>
.icon-image {
  width: 24px;
  height: 24px;
}
</style>
```

---

## ✅ 优势总结

### 相比修改pages.json：

| 对比项 | pages.json配置 | 自定义TabBar组件 |
|--------|---------------|-----------------|
| 样式控制 | ❌ 受限 | ✅ 完全自定义 |
| 颜色修改 | ❌ 需要清缓存 | ✅ 立即生效 |
| 动画效果 | ❌ 不支持 | ✅ 支持 |
| 跨平台一致 | ⚠️ 可能有差异 | ✅ 完全一致 |
| 调试方便 | ❌ 需要重启工具 | ✅ 热更新 |
| 角标提示 | ⚠️ 有限支持 | ✅ 完全自定义 |

---

## 📚 参考资料

- uni-app自定义TabBar：https://uniapp.dcloud.net.cn/collocation/pages.html#customtabbar
- Vue3组件通信：https://cn.vuejs.org/guide/components/props.html

---

**现在您可以完全控制TabBar的样式，不再受pages.json配置限制！** 🎉

只需在4个Tab页面中引入`TabBar`组件即可使用。


