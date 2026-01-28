# 语音录制功能指南

## 功能说明

现在应用已经实现了真实的语音录制和转录功能，使用浏览器原生的 `MediaRecorder` API。

## 已实现的页面

### ✅ 完全实现
- **RolePlayPage** - 角色扮演页面（已有完整实现）
- **NewInteractionPage** - 新建互动页面（已更新）
- **SchedulePage** - 日程计划页面（已更新）

### 🔄 部分实现
- **CustomerManagementPage** - 客户管理页面（语音搜索）
- **HistoryPage** - 历史记录页面（语音搜索）

## 技术实现

### useAudioRecorder Hook

位置：`/hooks/useAudioRecorder.ts`

这是一个通用的音频录制 Hook，提供以下功能：

```typescript
const { 
  isRecording,      // 当前是否正在录音
  startRecording,   // 开始录音
  stopRecording,    // 停止录音并返回音频 Blob
  error             // 错误信息
} = useAudioRecorder();
```

### 工作流程

1. **用户点击录音按钮** → 调用 `startRecording()`
2. **请求麦克风权限** → 使用 `navigator.mediaDevices.getUserMedia()`
3. **开始录制** → `MediaRecorder` 收集音频数据
4. **用户停止录音** → 调用 `stopRecording()`
5. **返回音频 Blob** → 转换为 Base64
6. **发送到 Gemini API** → 调用 `transcribeAudio()` 转录
7. **显示文本结果** → 插入到输入框或处理结果

## 音频格式

- **编码格式**: `audio/webm;codecs=opus`
- **采样率**: 44100 Hz
- **特性**: 
  - 回声消除 (Echo Cancellation)
  - 噪音抑制 (Noise Suppression)

## 使用示例

### 1. 新建互动页面

```typescript
// 导入 Hook
import { useAudioRecorder, blobToBase64 } from '../hooks/useAudioRecorder';
import { transcribeAudio } from '../services/geminiService';

// 使用 Hook
const { isRecording, startRecording, stopRecording } = useAudioRecorder();

// 处理录音
const handleRecording = async () => {
  if (isRecording) {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const base64data = await blobToBase64(audioBlob);
      const text = await transcribeAudio(base64data, 'audio/webm;codecs=opus');
      setInput(text); // 设置转录的文本
    }
  } else {
    await startRecording();
  }
};
```

### 2. 日程计划页面

```typescript
// 录音后解析日程信息
const handleVoiceInput = async () => {
  if (isRecording) {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const base64data = await blobToBase64(audioBlob);
      const text = await transcribeAudio(base64data, 'audio/webm;codecs=opus');
      const scheduleData = await parseScheduleVoice(text);
      // 创建日程...
    }
  } else {
    await startRecording();
  }
};
```

## 浏览器兼容性

| 浏览器 | 支持情况 | 最低版本 |
|--------|---------|---------|
| Chrome | ✅ 完全支持 | 47+ |
| Firefox | ✅ 完全支持 | 25+ |
| Safari | ✅ 完全支持 | 14+ |
| Edge | ✅ 完全支持 | 79+ |
| Mobile Chrome | ✅ 完全支持 | 53+ |
| Mobile Safari | ✅ 完全支持 | 14.5+ |

## 权限要求

### 麦克风权限

首次使用时，浏览器会提示请求麦克风权限。用户必须允许才能使用录音功能。

### HTTPS 要求

⚠️ **重要**: `getUserMedia` API 只能在以下环境中使用：
- HTTPS 连接
- `localhost` (开发环境)

在 HTTP 环境下录音功能将不可用。

## 错误处理

常见错误及解决方案：

### 1. NotAllowedError
**原因**: 用户拒绝了麦克风权限  
**解决**: 引导用户在浏览器设置中允许麦克风访问

### 2. NotFoundError
**原因**: 没有找到可用的麦克风设备  
**解决**: 检查设备是否连接麦克风

### 3. NotReadableError
**原因**: 麦克风被其他应用占用  
**解决**: 关闭其他正在使用麦克风的应用

### 4. API Key Error
**原因**: 没有配置 Gemini API Key  
**解决**: 设置环境变量 `VITE_GEMINI_API_KEY`

## 性能优化建议

### 1. 限制录音时长
```typescript
// 设置最大录音时长（例如 5 分钟）
const MAX_RECORDING_TIME = 5 * 60 * 1000;

setTimeout(async () => {
  if (isRecording) {
    await stopRecording();
  }
}, MAX_RECORDING_TIME);
```

### 2. 显示录音时长
```typescript
const [recordingDuration, setRecordingDuration] = useState(0);

useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isRecording) {
    interval = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  } else {
    setRecordingDuration(0);
  }
  return () => clearInterval(interval);
}, [isRecording]);
```

### 3. 添加音频波形可视化
可以使用 Web Audio API 添加实时音频波形显示，提升用户体验。

## 未来改进

### 短期
- [ ] 添加录音时长显示
- [ ] 添加音频波形可视化
- [ ] 支持暂停/恢复录音
- [ ] 本地缓存录音文件

### 中期
- [ ] 支持多语言转录
- [ ] 实时流式转录（边说边转）
- [ ] 离线转录支持（使用 Web Speech API）
- [ ] 音频质量选择（低/中/高）

### 长期
- [ ] 语音指令控制（"保存"、"取消"等）
- [ ] 说话人识别
- [ ] 情感分析
- [ ] 关键词自动提取

## 测试

### 手动测试清单

- [ ] 测试首次请求麦克风权限
- [ ] 测试拒绝权限后的错误提示
- [ ] 测试不同长度的录音（5秒、30秒、2分钟）
- [ ] 测试录音中途取消
- [ ] 测试网络断开时的表现
- [ ] 测试没有 API Key 时的错误提示
- [ ] 测试移动端录音功能

### 自动化测试

由于涉及浏览器 API，建议使用 E2E 测试框架（如 Playwright）进行测试。

## 相关资源

- [MDN: MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Google Gemini API 文档](https://ai.google.dev/docs)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 常见问题 FAQ

### Q: 录音文件会存储在哪里？
A: 录音文件不会永久存储。音频数据在内存中处理，转录后即释放。

### Q: 转录准确度如何？
A: 取决于 Gemini API 的性能。中文识别准确度通常在 90-95%。

### Q: 支持离线使用吗？
A: 目前不支持。转录需要调用 Gemini API，必须联网。

### Q: 可以录制多长时间？
A: 技术上没有限制，但建议控制在 5 分钟以内，避免处理时间过长。

### Q: 费用如何？
A: Gemini API 的音频转录按使用量计费。详见 Google AI Studio 定价。
