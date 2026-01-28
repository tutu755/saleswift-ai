# SaleSwift AI - 销售副驾驶

<div align="center">

一个智能销售助手应用，利用 AI 技术帮助销售人员提升业绩、管理客户关系和优化销售流程。

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tutu755/saleswift-ai)

</div>

## ✨ 功能特性

- 📊 **销售控制面板** - 实时查看销售管线和关键指标
- 🎤 **智能互动记录** - 语音/文本记录销售对话，AI 自动分析
- 👥 **客户管理** - 完整的客户信息管理和跟进记录
- 📅 **日程计划** - 智能日程管理和提醒
- 🎭 **角色扮演训练** - AI 模拟客户对话，提升销售技巧
- 📈 **成长曲线** - 追踪个人销售表现和成长趋势
- 📜 **历史记录** - 完整的互动历史和洞察分析

## 🚀 快速开始

### 本地运行

**前置要求：** Node.js 18+ 

1. **克隆仓库**
   ```bash
   git clone https://github.com/tutu755/saleswift-ai.git
   cd saleswift-ai
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**（可选）
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加您的 Gemini API Key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **打开浏览器**
   ```
   http://localhost:3000
   ```

### 部署到 Netlify

#### 方法 1：一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tutu755/saleswift-ai)

#### 方法 2：通过 Git 连接

1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 在 [Netlify](https://app.netlify.com/) 中导入仓库
3. 配置环境变量：
   - Key: `VITE_GEMINI_API_KEY`
   - Value: 您的 Gemini API Key
4. 点击 Deploy

详细部署说明请查看 [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)

## 🔑 获取 API Key

1. 访问 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制到 `.env` 文件或 Netlify 环境变量

## 📚 文档

- [配置指南](./SETUP.md) - 详细的本地开发配置
- [Netlify 部署指南](./NETLIFY_DEPLOY.md) - 部署到 Netlify 的完整说明

## 🛠 技术栈

- **前端框架**: React 19
- **构建工具**: Vite 6
- **路由**: React Router 7
- **样式**: Tailwind CSS
- **图表**: Recharts 3
- **图标**: Lucide React
- **AI**: Google Gemini API

## ⚠️ 重要提示

- 没有配置 API Key 时，基础功能（客户管理、查看记录）仍可正常使用
- AI 功能（语音识别、智能分析、角色扮演）需要 API Key
- **安全警告**: 在客户端使用 API Key 存在安全风险，生产环境建议使用后端代理

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

Made with ❤️ by [tutu755](https://github.com/tutu755)
