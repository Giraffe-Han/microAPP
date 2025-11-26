<template>
  <div class="mine-page page-container">
    <van-nav-bar title="个人中心" fixed placeholder />

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-header" @click="$router.push('/login')">
        <van-image
          round
          width="60"
          height="60"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
        <div class="user-info">
          <h2 class="user-name">点击登录</h2>
          <p class="user-phone">手机号未绑定</p>
        </div>
        <van-icon name="arrow" size="16" color="#fff" />
      </div>

      <!-- 统计数据 -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">总申请</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">处理中</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="我的申请"
          icon="records"
          is-link
          @click="$router.push('/applications')"
        />
        <van-cell
          title="案例展示"
          icon="video-o"
          is-link
          @click="$router.push('/cases')"
        />
        <van-cell
          title="个人信息"
          icon="contact"
          is-link
          @click="showToast('功能开发中')"
        />
        <van-cell
          title="实名认证"
          icon="shield-o"
          is-link
          label="未认证"
          @click="showToast('功能开发中')"
        />
      </van-cell-group>
    </div>

    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="服务指南"
          icon="guide-o"
          is-link
          @click="showGuide"
        />
        <van-cell
          title="常见问题"
          icon="question-o"
          is-link
          @click="showFAQ"
        />
        <van-cell
          title="联系客服"
          icon="service-o"
          is-link
          @click="showContact"
        />
        <van-cell
          title="关于我们"
          icon="info-o"
          is-link
          @click="showAbout"
        />
      </van-cell-group>
    </div>

    <div class="menu-section">
      <van-cell-group inset>
        <van-cell
          title="设置"
          icon="setting-o"
          is-link
          @click="showToast('功能开发中')"
        />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { showDialog, showToast } from 'vant'

const showGuide = () => {
  showDialog({
    title: '服务指南',
    message: '1. 选择所需服务\n2. 填写申请表单\n3. 提交申请\n4. 等待客服联系\n5. 确认服务详情\n6. 服务执行'
  })
}

const showFAQ = () => {
  showDialog({
    title: '常见问题',
    message: 'Q: 申请后多久联系？\nA: 2小时内会有客服联系您\n\nQ: 如何修改申请？\nA: 请联系客服进行修改'
  })
}

const showContact = () => {
  showDialog({
    title: '联系客服',
    message: '客服电话：400-123-4567\n工作时间：工作日 9:00-18:00'
  })
}

const showAbout = () => {
  showDialog({
    title: '关于我们',
    message: '低空综合服务平台\n版本：v1.0.0\n\n专注于提供专业、高效、安全的低空服务'
  })
}
</script>

<style scoped>
.mine-page {
  background: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 16px;
  padding: 24px 20px;
  border-radius: 16px;
  color: #fff;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  cursor: pointer;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 6px;
}

.user-phone {
  font-size: 14px;
  opacity: 0.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.8;
}

.menu-section {
  margin: 16px 0;
}
</style>

