# API Key 配置指南

## 🚨 当前问题

如果您看到 "API key not valid" 错误，说明：
1. 您的 `.env` 文件中没有配置 API Key
2. 或者配置的不是有效的 Gemini API Key

## ✅ 正确的 API Key 格式

**有效的 Gemini API Key 格式：**
```
AIzaSyABcDeFgHiJkLmNoPqRsTuVwXyZ1234567
```

**特征：**
- ✅ 以 `AIzaSy` 开头
- ✅ 长度约 39 个字符
- ✅ 包含大小写字母、数字、下划线、短横线

**无效的格式：**
- ❌ `gen-lang-client-0807093189` （这不是 Gemini API Key）
- ❌ 空字符串
- ❌ 其他随机字符串

## 📋 两种解决方案

---

### 方案 A：获取 Gemini API Key（推荐）

#### 优点
- ✅ 转录准确度高（90-95%）
- ✅ 支持复杂的 AI 分析
- ✅ 可以使用所有功能
- ✅ 支持所有浏览器

#### 步骤

1. **访问 Google AI Studio**
   ```
   https://aistudio.google.com/app/apikey
   ```

2. **登录 Google 账号**

3. **创建 API Key**
   - 点击 "Create API Key" 按钮
   - 选择或创建一个 Google Cloud 项目
   - 复制生成的 API Key

4. **配置到 `.env` 文件**
   ```bash
   VITE_GEMINI_API_KEY=AIzaSy你的真实API_Key
   ```

5. **重启开发服务器**
   ```bash
   npm run dev
   ```

#### 费用说明
- 前 50 次请求/天：**免费**
- 超出后按量计费，价格极低
- 详见：https://ai.google.dev/pricing

---

### 方案 B：使用免费的 Web Speech API

#### 优点
- ✅ **完全免费**
- ✅ **无需 API Key**
- ✅ 实时转录（边说边显示）
- ✅ 零配置

#### 缺点
- ❌ 只支持 Chrome、Edge 浏览器
- ❌ 需要网络连接（虽然免费）
- ❌ 准确度略低于 Gemini

#### 使用方法

我已经创建了 `useSpeechRecognition` Hook，可以直接使用：

```typescript
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

const {
  isListening,
  transcript,
  startListening,
  stopListening,
  isSupported
} = useSpeechRecognition();

// 开始录音
startListening();

// 停止录音，transcript 包含识别的文字
stopListening();
console.log(transcript);
```

---

## 🎯 我的建议

### 如果您想要最佳体验：
**使用方案 A（Gemini API）**
- 花 5 分钟获取免费的 API Key
- 享受高质量的语音识别和 AI 分析

### 如果您只是快速测试：
**使用方案 B（Web Speech API）**
- 无需配置
- 立即可用
- 但只能在 Chrome/Edge 上工作

---

## 🔧 快速测试：检查您的 API Key 是否有效

在浏览器控制台运行：

```javascript
// 检查环境变量
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);

// 有效的 Key 应该：
// 1. 以 AIzaSy 开头
// 2. 长度约 39 个字符
```

---

## ❓ 常见问题

### Q: 我没有 Google 账号怎么办？
A: 可以免费注册一个 Google 账号，或者使用方案 B（Web Speech API）。

### Q: API Key 会泄露吗？
A: 在客户端使用确实有风险。建议：
1. 设置 API Key 的使用限制（在 Google Cloud Console）
2. 监控使用量
3. 生产环境应该使用后端 API 代理

### Q: 我可以同时使用两种方案吗？
A: 可以！可以设置为：有 API Key 时用 Gemini，没有时自动降级到 Web Speech API。

### Q: Web Speech API 支持哪些语言？
A: 支持多种语言，包括：
- 中文（zh-CN）
- 英文（en-US）
- 日文（ja-JP）
- 韩文（ko-KR）
等等

---

## 📞 需要帮助？

如果您仍然遇到问题，请告诉我：
1. 您选择使用哪个方案？
2. 遇到了什么具体错误？
3. 浏览器控制台的完整错误信息

我会继续帮您解决！
