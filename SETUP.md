# SaleSwift AI 配置指南

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量（可选）：
创建 `.env` 文件，并添加您的 Gemini API Key：
```
GEMINI_API_KEY=your_api_key_here
# 或者使用 VITE_ 前缀（推荐用于 Netlify 等平台）
VITE_GEMINI_API_KEY=your_api_key_here
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中打开：
```
http://localhost:3000
```

## 获取 Gemini API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录您的 Google 账号
3. 创建新的 API Key
4. 将 API Key 复制到 `.env` 文件中

## 注意事项

- 没有配置 API Key 时，AI 功能（如语音识别、智能分析、角色扮演）将无法使用
- 基础功能（如查看记录、客户管理）不需要 API Key 也能正常工作
- 请妥善保管您的 API Key，不要提交到版本控制系统

## 常见问题

### 页面显示空白？
1. 确保已安装依赖：`npm install`
2. 检查浏览器控制台是否有错误信息
3. 确认开发服务器正常运行

### API 调用失败？
1. 检查 `.env` 文件是否正确配置
2. 确认 API Key 有效
3. 检查网络连接

## 部署到 Netlify

详细的部署说明请查看 [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)

快速步骤：
1. 在 Netlify 中导入您的 Git 仓库
2. 在环境变量中添加 `VITE_GEMINI_API_KEY`
3. 部署会自动开始

## 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 6
- **路由**: React Router 7
- **图表**: Recharts 3
- **图标**: Lucide React
- **AI**: Google Gemini API
