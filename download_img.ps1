
# 目标目录
$targetDir = "D:\低空\开发\低空综合服务平台\img"

# 创建目录
New-Item -ItemType Directory -Force -Path "$targetDir\videos"
New-Item -ItemType Directory -Force -Path "$targetDir\images"

# 定义下载函数
function Save-File {
    param ($url, $output)
    Write-Host "正在下载 $output ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
        Write-Host "成功: $output" -ForegroundColor Green
    } catch {
        Write-Host "下载失败: $url" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# 1. 首页背景视频
Save-File "https://www-cdn.djiits.com/reactor/assets/_next/static/videos/36107ff2-dde1-45ae-945a-c369efcd58b7.mp4?w=1386&h=800" "$targetDir\videos\home-bg.mp4"

# 2. Banner 图片
Save-File "https://wenzhoumall-prod.oss-cn-shanghai.aliyuncs.com/test/shop/20250930/0fa02eb2dc8b4a6382784fedc0b44dc0.jpg?Expires=3337231191&OSSAccessKeyId=LTAI5tSbLByCMG16D3eoErCU&Signature=Zk8QXbZAJhw08908Er3iuy9dKg0%3D" "$targetDir\images\banner-delivery.jpg"
Save-File "https://www-cdn.djiits.com/dps/3e196dbfade1b1734dbbb335dde5de12.jpg?w=1184&h=592" "$targetDir\images\banner-dji.jpg"
Save-File "https://images.unsplash.com/photo-1506947411487-a56738267384?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" "$targetDir\images\banner-city.jpg"

# 3. 推荐卡片背景
Save-File "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" "$targetDir\images\card-case.jpg"
Save-File "https://www-cdn.djiits.com/dps/71685a7a83e4c70907f3c504f6806561.jpg" "$targetDir\images\card-service.jpg"

Write-Host "所有资源下载任务结束！"
