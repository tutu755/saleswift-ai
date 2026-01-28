# Netlify 部署指南

## 配置环境变量

在 Netlify 部署此应用时，需要配置 API key 作为环境变量：

### 步骤：

1. 登录 Netlify 控制台
2. 进入您的站点设置
3. 导航到：**Site settings** → **Environment variables**
4. 添加新的环境变量：
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: 您的 Gemini API Key

### 获取 API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制 API Key 到 Netlify 环境变量中

### 重要安全提示 ⚠️

**注意：在客户端代码中暴露 API Key 存在安全风险！**

对于生产环境，建议：

1. **使用后端 API 代理**：创建一个后端服务来调用 Gemini API，不要在前端直接使用 API key
2. **设置 API Key 限制**：在 Google Cloud Console 中限制 API key 的使用范围
3. **监控使用量**：定期检查 API 使用情况，防止滥用

### 演示模式（无 API Key）

如果不配置 `VITE_GEMINI_API_KEY`，应用仍然可以运行，但 AI 功能将不可用：
- ✅ 可以使用：查看控制面板、管理客户、查看历史记录
- ❌ 不可用：语音识别、智能分析、AI 角色扮演

## 本地测试生产构建

在部署到 Netlify 之前，可以在本地测试生产构建：

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署流程

### 方法 1：通过 Git 自动部署（推荐）

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 Netlify 中连接您的仓库
3. 配置环境变量（可选）
4. Netlify 会自动构建和部署

### 方法 2：手动部署

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 部署
netlify deploy --prod
```

## 部署后验证

部署完成后，访问您的站点并检查：

1. ✅ 页面正常加载，无空白页面
2. ✅ 控制台无错误（按 F12 查看）
3. ✅ 路由正常工作（导航到不同页面）
4. ✅ 如果配置了 API key，测试 AI 功能

## 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台错误。通常是因为：
- 缺少环境变量
- 路由配置问题（需要 `netlify.toml` 中的重定向规则）

### Q: API 功能不工作？
A: 确认：
- Netlify 环境变量已正确设置
- 变量名为 `VITE_GEMINI_API_KEY`（注意 `VITE_` 前缀）
- 重新触发部署以应用环境变量

### Q: 如何更新 API Key？
A: 
1. 在 Netlify 环境变量中更新值
2. 触发重新部署（或推送新的提交）

## 监控和维护

- 定期检查 Google AI Studio 中的 API 使用情况
- 设置 API 使用配额警报
- 监控 Netlify 的构建和部署日志
