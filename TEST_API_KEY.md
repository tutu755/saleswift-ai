# 测试您的 API Key 是否有效

## 🧪 快速测试方法

在浏览器控制台运行以下代码：

```javascript
// 测试 API Key
const apiKey = "AIzaSyB_g8AqQOj00jJ5AN9Y8398seKAIMeddwI";
const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

fetch(testUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: "Say hello" }]
    }]
  })
})
.then(res => res.json())
.then(data => console.log('✅ API Key 有效!', data))
.catch(err => console.error('❌ API Key 无效:', err));
```

## 🔍 如果测试失败

您的 API Key 可能存在以下问题：

### 1. API Key 未启用 Gemini API

**解决方案：**
1. 访问：https://aistudio.google.com/app/apikey
2. 删除旧的 API Key
3. 重新创建一个新的 API Key
4. 确保项目已启用 "Generative Language API"

### 2. 使用错误的 API Key

**可能原因：**
- 这个 Key 是从网上复制的示例
- Key 已过期或被撤销
- Key 是为其他服务创建的（如 Google Maps）

**解决方案：**
必须使用您自己 Google 账号创建的 Key

### 3. API Key 有使用限制

**解决方案：**
1. 访问 Google Cloud Console
2. 进入 API & Services > Credentials
3. 找到您的 API Key
4. 点击编辑
5. 确认没有过多的限制（如 IP 限制、Referer 限制等）

## ✅ 正确的创建步骤

1. **访问 Google AI Studio**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **登录您的 Google 账号**
   - 必须使用您自己的账号
   - 不能使用别人的 Key

3. **点击 "Get API key" 或 "Create API key"**

4. **选择项目**
   - 选择现有项目
   - 或创建新项目

5. **复制生成的 Key**
   - 格式：AIzaSy...
   - 长度约 39 个字符

6. **更新 .env 文件**
   ```
   VITE_GEMINI_API_KEY=您的新Key
   ```

7. **重启服务器**
   ```
   npm run dev
   ```

## 🆓 免费备选方案

如果您暂时无法获取有效的 API Key，我可以帮您集成**免费的 Web Speech API**：

### 优点
- ✅ 完全免费
- ✅ 无需 API Key
- ✅ 立即可用
- ✅ 实时转录

### 缺点
- ❌ 只支持 Chrome/Edge
- ❌ 准确度略低

需要的话，我可以立即帮您实现！

## 📞 下一步

请选择：

**选项 A：** 我去重新创建一个新的 API Key
- 访问：https://aistudio.google.com/app/apikey
- 创建新 Key
- 更新 .env 文件
- 重启服务器

**选项 B：** 使用免费的 Web Speech API
- 我帮您集成到代码中
- 立即可用
- 无需任何配置

请告诉我您的选择！
