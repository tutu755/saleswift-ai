
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Upload,
  FileAudio,
  X,
  UserCheck,
  UserPlus,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User,
  ChevronLeft,
  Search
} from 'lucide-react';
import { analyzeSalesInteraction, parseCustomerVoiceInput, transcribeAudio } from '../services/geminiService';
import { Interaction, Customer } from '../types';
import { useAudioRecorder, blobToBase64 } from '../hooks/useAudioRecorder';

interface Props {
  onSave: (interaction: Interaction) => void;
  customers: Customer[];
  onAddCustomer: (customer: Customer) => Customer;
}

const NewInteractionPage: React.FC<Props> = ({ onSave, customers, onAddCustomer }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // 弹窗状态
  const [pendingResult, setPendingResult] = useState<Interaction | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // 新客户快捷建档表单
  const [newCustomerData, setNewCustomerData] = useState({ name: '', company: '', role: '', industry: '' });
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  const [selectedFile, setSelectedFile] = useState<{ file: File, base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // 使用录音 Hook
  const { isRecording, startRecording, stopRecording, error: recordError } = useAudioRecorder();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('请上传有效的音频文件。');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedFile({ file, base64 });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const audioPayload = selectedFile ? { data: selectedFile.base64, mimeType: selectedFile.file.type } : undefined;
      const aiResult = await analyzeSalesInteraction(input, audioPayload);
      
      if (aiResult) {
        // 构建初始 Interaction 对象
        const interactionId = 'int-' + Date.now();
        const enrichedResult: Interaction = {
          ...aiResult,
          id: interactionId,
          date: new Date().toISOString(),
          rawInput: input || (selectedFile ? `语音记录: ${selectedFile.file.name}` : ""),
        };

        const aiName = enrichedResult.customerProfile?.name;
        const aiCompany = enrichedResult.customerProfile?.company;

        // --- 核心逻辑：自动关联比对 ---
        
        // 1. 如果用户手动预选了客户
        if (selectedCustomerId) {
          const targetCust = customers.find(c => c.id === selectedCustomerId);
          if (targetCust) {
            enrichedResult.customerProfile.name = targetCust.name;
            enrichedResult.customerProfile.company = targetCust.company;
          }
          finalizeSave(enrichedResult, selectedCustomerId);
          return;
        }

        // 2. 如果没选，尝试在数据库中自动比对匹配
        const autoMatch = customers.find(c => 
          (c.name === aiName && c.company === aiCompany) || // 完全匹配
          (c.name === aiName && !aiCompany) // 姓名匹配且AI没提取到公司
        );

        if (autoMatch) {
          finalizeSave(enrichedResult, autoMatch.id);
          return;
        }

        // 3. 没找到自动匹配，弹出管理窗口
        setPendingResult(enrichedResult);
        setNewCustomerData({
          name: (aiName === "未知客户" ? "" : aiName) || "",
          company: aiCompany || "",
          role: enrichedResult.customerProfile?.role || "",
          industry: enrichedResult.customerProfile?.industry || ""
        });
        setShowLinkModal(true);
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.error(err);
      setError('分析失败。请检查网络或 API 设置。');
      setIsAnalyzing(false);
    }
  };

  const finalizeSave = (result: Interaction, customerId: string) => {
    const fullResult = { ...result, customerId };
    onSave(fullResult);
    // 强制等待一小段时间或确保 ID 存在后再跳转
    if (fullResult.id) {
      navigate(`/interaction/${fullResult.id}`);
    } else {
      setError("数据保存异常，ID丢失。");
    }
  };

  const handleModalLinkExisting = (id: string) => {
    if (pendingResult) {
      const targetCust = customers.find(c => c.id === id);
      const updatedResult = { ...pendingResult };
      if (targetCust) {
        updatedResult.customerProfile.name = targetCust.name;
        updatedResult.customerProfile.company = targetCust.company;
      }
      finalizeSave(updatedResult, id);
    }
  };

  // 处理实时录音转文字（用于主要互动记录）
  const handleMainRecording = async () => {
    if (isRecording) {
      // 停止录音并转录
      setIsVoiceProcessing(true);
      try {
        const audioBlob = await stopRecording();
        if (audioBlob) {
          const base64data = await blobToBase64(audioBlob);
          const transcribedText = await transcribeAudio(base64data, 'audio/webm;codecs=opus');
          setInput(prev => prev ? `${prev}\n${transcribedText}` : transcribedText);
        }
      } catch (err) {
        setError('语音转录失败，请重试');
        console.error('转录失败:', err);
      } finally {
        setIsVoiceProcessing(false);
      }
    } else {
      // 开始录音
      try {
        await startRecording();
      } catch (err) {
        setError('无法访问麦克风，请检查权限');
      }
    }
  };

  // 快速语音输入客户信息
  const startQuickVoiceInput = async () => {
    setIsVoiceProcessing(true);
    try {
      await startRecording();
      // 等待用户说话（可以设置一个定时器或让用户手动停止）
      setTimeout(async () => {
        const audioBlob = await stopRecording();
        if (audioBlob) {
          const base64data = await blobToBase64(audioBlob);
          const transcribedText = await transcribeAudio(base64data, 'audio/webm;codecs=opus');
          const result = await parseCustomerVoiceInput(transcribedText);
          if (result) {
            setNewCustomerData(prev => ({
              ...prev,
              name: result.name || prev.name,
              company: result.company || prev.company,
              role: result.role || prev.role,
              industry: result.industry || prev.industry
            }));
            const fields = [];
            if (result.name) fields.push('name');
            if (result.company) fields.push('company');
            setHighlightedFields(fields);
            setTimeout(() => setHighlightedFields([]), 2000);
          }
        }
      }, 3000); // 3秒后自动停止
    } catch (err) {
      console.error('语音输入失败:', err);
      setError('语音输入失败');
    } finally {
      setIsVoiceProcessing(false);
    }
  };

  const handleConfirmCreateAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name || !newCustomerData.company || !pendingResult) return;
    
    // 1. 创建新客户档案
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      ...newCustomerData,
      tags: ['互动中新建'],
      createdAt: new Date().toISOString()
    };
    const savedCustomer = onAddCustomer(newCust);
    
    // 2. 更新互动快照中的客户信息并关联
    const updatedResult = { ...pendingResult };
    updatedResult.customerProfile.name = savedCustomer.name;
    updatedResult.customerProfile.company = savedCustomer.company;
    
    finalizeSave(updatedResult, savedCustomer.id);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">新建销售互动</h2>
        <p className="text-gray-500 mt-2">AI 会自动为您分析客户需求，并关联对应的客户档案。</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="p-8">
          <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm">关联客户档案 (可选)</h4>
                <p className="text-[10px] text-blue-600">预选客户可确保 100% 关联准确率</p>
              </div>
            </div>
            <select 
              className="px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium min-w-[280px]"
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- AI 自动匹配 / 手动关联 --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.company}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button 
              onClick={handleMainRecording}
              disabled={isAnalyzing || isVoiceProcessing}
              className={`flex items-center justify-center gap-3 py-6 rounded-2xl border-2 transition-all ${
                isRecording ? 'border-red-200 bg-red-50 text-red-600 animate-pulse' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
              } ${isAnalyzing || isVoiceProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <X size={24} /> : <Mic size={24} />}
              <span className="font-bold text-lg">
                {isRecording ? '点击停止录音' : isVoiceProcessing ? '正在转录...' : '语音录入纪要'}
              </span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-3 py-6 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              <Upload size={24} />
              <span className="font-bold text-lg">上传录音附件</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
          </div>

          {selectedFile && (
            <div className="mb-6 p-4 bg-gray-900 text-white rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <FileAudio size={24} className="text-blue-400" />
                <span className="font-bold text-sm truncate max-w-[200px]">{selectedFile.file.name}</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
          )}

          <textarea
            className="w-full h-48 p-6 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none text-gray-700 placeholder:text-gray-300"
            placeholder="粘贴通话纪要、销售笔记... AI 将为您自动提取商机情报。"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAnalyzing}
          />
        </div>

        <div className="px-8 py-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {isAnalyzing ? (
              <><Loader2 className="animate-spin text-blue-600" size={18} /><span>正在深度解析并关联客户...</span></>
            ) : error ? (
              <><AlertCircle className="text-red-500" size={18} /><span className="text-red-500">{error}</span></>
            ) : (
              <><Sparkles className="text-amber-500" size={18} /><span>准备就绪</span></>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={(!input.trim() && !selectedFile) || isAnalyzing}
            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? '分析中...' : '生成复盘报告'}
          </button>
        </div>
      </div>

      {/* 联动管理弹窗 */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {!showCreateForm ? (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">匹配客户档案</h3>
                  <p className="text-gray-500 mt-2">AI 提取到了信息，但库中未找到完全一致的客户。请选择已有档案或创建新档案。</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                      <LinkIcon size={14} /> 搜索并选择已有客户
                    </p>
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {customers.map(c => (
                        <button 
                          key={c.id}
                          onClick={() => handleModalLinkExisting(c.id)}
                          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all text-left"
                        >
                          <div>
                            <p className="font-bold text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.company}</p>
                          </div>
                          <CheckCircle2 className="text-gray-200 group-hover:text-blue-500" size={20} />
                        </button>
                      ))}
                      {customers.length === 0 && <p className="text-sm text-gray-400 italic py-4 text-center">档案库为空</p>}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowLinkModal(false)}
                      className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => setShowCreateForm(true)}
                      className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                    >
                      <UserPlus size={20} />
                      存为新客户
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-gray-900">新客户快速建档</h3>
                  <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-gray-600">
                    <ChevronLeft size={24} />
                  </button>
                </div>

                <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl text-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 mb-1">
                      <Sparkles size={16} className="text-blue-200" />
                      智能补全
                    </h4>
                    <p className="text-xs opacity-80">点击右侧按钮，通过语音快速完善资料</p>
                  </div>
                  <button 
                    onClick={startQuickVoiceInput}
                    disabled={recording || isVoiceProcessing}
                    className={`p-3 rounded-full transition-all ${
                      recording ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {isVoiceProcessing ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
                  </button>
                </div>

                <form onSubmit={handleConfirmCreateAndSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">客户姓名 *</label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={newCustomerData.name}
                        onChange={e => setNewCustomerData({...newCustomerData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">所属公司 *</label>
                      <input 
                        type="text" required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={newCustomerData.company}
                        onChange={e => setNewCustomerData({...newCustomerData, company: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">职位</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={newCustomerData.role}
                        onChange={e => setNewCustomerData({...newCustomerData, role: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 tracking-wider">行业</label>
                      <input 
                        type="text"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                        value={newCustomerData.industry}
                        onChange={e => setNewCustomerData({...newCustomerData, industry: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-4"
                  >
                    创建客户并生成报告
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewInteractionPage;
