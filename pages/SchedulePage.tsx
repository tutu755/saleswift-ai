
import React, { useState } from 'react';
// Added Link from react-router-dom to fix missing name error
import { Link } from 'react-router-dom';
import { Schedule, Customer } from '../types';
import { 
  CalendarDays, 
  Plus, 
  Mic, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  User, 
  Trash2,
  Sparkles,
  Calendar,
  X,
  ChevronRight
} from 'lucide-react';
import { parseScheduleVoice, transcribeAudio } from '../services/geminiService';
import { useAudioRecorder, blobToBase64 } from '../hooks/useAudioRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { parseScheduleLocally } from '../utils/scheduleParser';

interface Props {
  schedules: Schedule[];
  customers: Customer[];
  onAddSchedule: (s: Schedule) => void;
  onToggleStatus: (id: string) => void;
}

const SchedulePage: React.FC<Props> = ({ schedules, customers, onAddSchedule, onToggleStatus }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', time: '', customerId: '' });
  const [recognizedText, setRecognizedText] = useState('');
  
  // 使用录音 Hook（MediaRecorder + Gemini API）
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  // 使用免费的 Web Speech API（浏览器内置，无需 API Key）
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening,
    isSupported: isSpeechSupported 
  } = useSpeechRecognition();
  
  // 优先使用 Web Speech API（如果支持）
  const isCurrentlyRecording = isSpeechSupported ? isListening : isRecording;

  const sortedSchedules = [...schedules].sort((a, b) => 
    new Date(`${a.date} ${a.time || '00:00'}`).getTime() - new Date(`${b.date} ${b.time || '00:00'}`).getTime()
  );

  const startVoiceInput = async () => {
    // 优先使用 Web Speech API（免费，无需 API Key）
    if (isSpeechSupported) {
      if (isListening) {
        // 停止监听并处理识别的文本
        stopListening();
        if (transcript) {
          setRecognizedText(transcript); // 显示识别的文本
          setIsProcessing(true);
          try {
            // 尝试使用本地解析器（无需 API Key）
            const localResult = parseScheduleLocally(transcript);
            
            if (localResult) {
              // 尝试匹配客户
              const matchedCust = localResult.customerName 
                ? customers.find(c => 
                    c.name.includes(localResult.customerName!) || 
                    c.company.includes(localResult.customerName!)
                  )
                : undefined;
              
              const schedule: Schedule = {
                id: 'sched-' + Date.now(),
                title: localResult.title,
                date: localResult.date,
                time: localResult.time,
                description: localResult.description,
                customerId: matchedCust?.id,
                status: 'pending'
              };
              onAddSchedule(schedule);
              
              // 清空识别文本
              setTimeout(() => setRecognizedText(''), 2000);
            }
          } catch (err) {
            console.error('语音处理失败:', err);
          } finally {
            setIsProcessing(false);
          }
        }
      } else {
        // 开始监听
        setRecognizedText(''); // 清空之前的文本
        startListening();
      }
      return;
    }
    
    // 降级到 MediaRecorder + Gemini API（需要 API Key）
    if (isRecording) {
      // 停止录音并处理
      setIsProcessing(true);
      try {
        const audioBlob = await stopRecording();
        if (audioBlob) {
          const base64data = await blobToBase64(audioBlob);
          const transcribedText = await transcribeAudio(base64data, 'audio/webm;codecs=opus');
          const result = await parseScheduleVoice(transcribedText);
          if (result) {
            // 尝试匹配客户
            const matchedCust = customers.find(c => 
              c.name.includes(result.customerName) || c.company.includes(result.customerName)
            );
            
            const schedule: Schedule = {
              id: 'sched-' + Date.now(),
              title: result.title,
              date: result.date,
              time: result.time,
              description: result.description,
              customerId: matchedCust?.id,
              status: 'pending'
            };
            onAddSchedule(schedule);
          }
        }
      } catch (err) {
        console.error('语音处理失败:', err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // 开始录音
      try {
        await startRecording();
      } catch (err) {
        console.error('无法启动录音:', err);
      }
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title || !newSchedule.date) return;
    onAddSchedule({
      id: 'sched-' + Date.now(),
      ...newSchedule,
      status: 'pending'
    });
    setShowAddForm(false);
    setNewSchedule({ title: '', date: '', time: '', customerId: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">日程计划</h2>
          <p className="text-gray-500 mt-1">AI 助手为您智能调度访谈、会议与待办事项。</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={18} />
          安排日程
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">语音智能录入</h4>
                  <p className="text-sm text-gray-500">只需说出"明天下午两点和张总开会"</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button 
                  onClick={startVoiceInput}
                  disabled={isProcessing}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all ${
                    isCurrentlyRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : isCurrentlyRecording ? <X size={20} /> : <Mic size={20} />}
                  {isProcessing ? '正在处理...' : isCurrentlyRecording ? '点击停止' : '开始说话'}
                </button>
                {isSpeechSupported && !isCurrentlyRecording && (
                  <span className="text-xs text-green-600 font-medium">✓ 免费语音识别</span>
                )}
              </div>
            </div>
            
            {/* 显示实时识别的文字或已识别的文字 */}
            {(isListening && transcript) || recognizedText ? (
              <div className="px-6 pb-6">
                <div className={`p-4 rounded-xl ${isListening ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isListening ? '🎤 正在识别...' : '✅ 识别完成'}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {isListening ? transcript : recognizedText}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            {sortedSchedules.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <CalendarDays size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400">当前没有待办日程。试试语音录入？</p>
              </div>
            ) : (
              sortedSchedules.map(item => (
                <div 
                  key={item.id}
                  className={`group flex items-center gap-6 p-6 bg-white rounded-3xl border transition-all ${
                    item.status === 'completed' ? 'opacity-50 border-gray-100' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                  }`}
                >
                  <button 
                    onClick={() => onToggleStatus(item.id)}
                    className={`shrink-0 transition-colors ${item.status === 'completed' ? 'text-emerald-500' : 'text-gray-300 hover:text-blue-500'}`}
                  >
                    {item.status === 'completed' ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`text-lg font-bold ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar size={14} />
                        {item.date}
                      </div>
                      {item.time && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock size={14} />
                          {item.time}
                        </div>
                      )}
                      {item.customerId && (
                        // Added Link around the customer name to navigate to Customer Detail page
                        <Link 
                          to={`/customers/${item.customerId}`}
                          className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
                        >
                          <User size={14} />
                          {customers.find(c => c.id === item.customerId)?.name}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">今日概览</h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase">已完成</p>
                  <p className="text-2xl font-black text-emerald-700">{schedules.filter(s => s.status === 'completed').length}</p>
                </div>
                <CheckCircle2 size={32} className="text-emerald-200" />
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">待处理</p>
                  <p className="text-2xl font-black text-blue-700">{schedules.filter(s => s.status === 'pending').length}</p>
                </div>
                <Clock size={32} className="text-blue-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">手动安排日程</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">标题 *</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSchedule.title}
                  onChange={e => setNewSchedule({...newSchedule, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">日期 *</label>
                  <input 
                    type="date" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSchedule.date}
                    onChange={e => setNewSchedule({...newSchedule, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">时间</label>
                  <input 
                    type="time"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={newSchedule.time}
                    onChange={e => setNewSchedule({...newSchedule, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">关联客户</label>
                <select 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSchedule.customerId}
                  onChange={e => setNewSchedule({...newSchedule, customerId: e.target.value})}
                >
                  <option value="">-- 选择客户 --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 mt-4">确认安排</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
