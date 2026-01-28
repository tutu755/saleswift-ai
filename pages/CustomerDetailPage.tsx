
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Customer, Interaction, Schedule } from '../types';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronRight, 
  MessageCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  Circle,
  X,
  Tags,
  Plus,
  Target
} from 'lucide-react';

interface Props {
  customers: Customer[];
  interactions: Interaction[];
  schedules: Schedule[];
  onAddSchedule: (s: Schedule) => void;
  onUpdateCustomer: (c: Customer) => void;
}

const CustomerDetailPage: React.FC<Props> = ({ customers, interactions, schedules, onAddSchedule, onUpdateCustomer }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newSchedule, setNewSchedule] = useState({ title: '', date: '', time: '' });

  const customer = customers.find(c => c.id === id);
  const customerInteractions = interactions.filter(i => i.customerId === id);
  const customerSchedules = schedules.filter(s => s.customerId === id);

  if (!customer) return <div className="p-20 text-center">客户不存在</div>;

  const handleQuickSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSchedule({
      id: 'sched-' + Date.now(),
      ...newSchedule,
      customerId: customer.id,
      status: 'pending'
    });
    setShowAddSchedule(false);
    setNewSchedule({ title: '', date: '', time: '' });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagText.trim()) return;
    const tags = newTagText.split(/[，, ]/).map(t => t.trim()).filter(t => t !== '');
    const uniqueTags = Array.from(new Set([...customer.tags, ...tags]));
    onUpdateCustomer({ ...customer, tags: uniqueTags });
    setNewTagText('');
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = customer.tags.filter(t => t !== tagToRemove);
    onUpdateCustomer({ ...customer, tags: updatedTags });
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium">
          <ArrowLeft size={18} /> 返回客户列表
        </button>
        <Link 
          to={`/roleplay/${customer.id}`}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-bold shadow-lg shadow-amber-100"
        >
          <Target size={18} />
          AI 实战演练
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shrink-0 shadow-lg shadow-blue-100">
            {customer.name.charAt(0)}
          </div>
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1">{customer.name}</h2>
                <p className="text-lg text-gray-500">{customer.role} @ {customer.company}</p>
              </div>
              <button 
                onClick={() => setShowAddSchedule(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100"
              >
                <PlusCircle size={18} />
                安排日程
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
              <Tags size={16} className="text-gray-400 mr-2" />
              {customer.tags.map(tag => (
                <span key={tag} className="group flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 text-blue-600 rounded-full text-xs font-bold shadow-sm">
                  {tag}
                  <button 
                    onClick={() => removeTag(tag)}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <form onSubmit={handleAddTag} className="flex items-center gap-2 animate-in slide-in-from-left-2">
                  <input 
                    autoFocus
                    type="text" 
                    className="px-3 py-1 text-xs border border-blue-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="输入标签..."
                    value={newTagText}
                    onChange={e => setNewTagText(e.target.value)}
                    onBlur={() => !newTagText && setShowTagInput(false)}
                  />
                </form>
              ) : (
                <button 
                  onClick={() => setShowTagInput(true)}
                  className="flex items-center gap-1 px-3 py-1 border border-dashed border-gray-300 text-gray-400 rounded-full text-xs font-bold hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <Plus size={12} />
                  加分类标签
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg"><Building2 size={18} /></div>
                <div><p className="text-[10px] uppercase font-bold text-gray-400">行业</p><p className="font-medium">{customer.industry || '未分类'}</p></div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg"><Mail size={18} /></div>
                <div><p className="text-[10px] uppercase font-bold text-gray-400">邮件</p><p className="font-medium">{customer.email || '未设置'}</p></div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <div className="p-2 bg-gray-50 rounded-lg"><Phone size={18} /></div>
                <div><p className="text-[10px] uppercase font-bold text-gray-400">电话</p><p className="font-medium">{customer.phone || '未设置'}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-600" />
              历史互动记录 ({customerInteractions.length})
            </h3>
            
            {customerInteractions.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                <p className="text-gray-400">该客户暂无历史互动。立即开始一次复盘？</p>
                <Link to="/new" className="inline-block mt-4 text-blue-600 font-bold hover:underline">去新建互动 →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {customerInteractions.map(item => (
                  <Link 
                    key={item.id} 
                    to={`/interaction/${item.id}`}
                    className="block bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                          <Calendar size={20} className="text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{new Date(item.date).toLocaleDateString()} 的销售访谈</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{item.customerProfile.summary}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              待办日程
            </h3>
            <div className="space-y-4">
              {customerSchedules.filter(s => s.status === 'pending').length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-4">暂无待办日程</p>
                  <button onClick={() => setShowAddSchedule(true)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors">立即安排</button>
                </div>
              ) : (
                customerSchedules.filter(s => s.status === 'pending').map(sched => (
                  <div key={sched.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-bold text-gray-900 text-sm mb-1">{sched.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={12} />
                      {sched.date}
                      {sched.time && <><Clock size={12} className="ml-2" />{sched.time}</>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddSchedule && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">为 {customer.name} 安排日程</h3>
              <button onClick={() => setShowAddSchedule(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleQuickSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">日程主题 *</label>
                <input 
                  type="text" required placeholder="如：二次拜访、方案演示"
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
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 mt-4">确认安排</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
