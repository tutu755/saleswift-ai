
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  Building2, 
  ChevronRight,
  Database,
  Mic,
  Loader2,
  Sparkles,
  X,
  User,
  Tags,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { parseCustomerVoiceInput, extractSearchKeywords } from '../services/geminiService';

interface Props {
  customers: Customer[];
  onSync: (customers: Customer[]) => void;
  onAdd: (customer: Customer) => void;
}

const CustomerManagementPage: React.FC<Props> = ({ customers, onSync, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const [isSearchVoiceProcessing, setIsSearchVoiceProcessing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [searchRecording, setSearchRecording] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', company: '', role: '', industry: '', tagsInput: '' });
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);

  // 自动提取所有唯一标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    customers.forEach(c => c.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [customers]);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.company) return;
    
    // 处理标签输入
    const tags = newCustomer.tagsInput
      .split(/[，, ]/)
      .map(t => t.trim())
      .filter(t => t !== '');

    const customer: Customer = {
      id: 'manual-' + Date.now(),
      name: newCustomer.name,
      company: newCustomer.company,
      role: newCustomer.role,
      industry: newCustomer.industry,
      tags: tags.length > 0 ? tags : ['手动录入'],
      createdAt: new Date().toISOString()
    };
    onAdd(customer);
    setShowAddForm(false);
    setNewCustomer({ name: '', company: '', role: '', industry: '', tagsInput: '' });
  };

  const startSearchVoiceInput = () => {
    setSearchRecording(true);
    setTimeout(async () => {
      setSearchRecording(false);
      setIsSearchVoiceProcessing(true);
      try {
        const mockSpeech = "帮我找一下标签是重要客户的腾讯张伟";
        const keywords = await extractSearchKeywords(mockSpeech);
        setSearchTerm(keywords);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchVoiceProcessing(false);
      }
    }, 2000);
  };

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.includes(searchTerm) || 
                          c.company.includes(searchTerm) || 
                          c.industry?.includes(searchTerm) ||
                          c.tags.some(t => t.includes(searchTerm));
    const matchesTag = selectedTag ? c.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">客户档案库</h2>
          <p className="text-gray-500 mt-1">管理您的核心客户，支持语音快速搜索与建档。</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onSync.bind(null, [])} // 简化
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all shadow-sm"
          >
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
            从 CRM 同步
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} />
            新增客户
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="搜索姓名、公司、行业或标签... 或使用语音搜索"
            className="w-full pl-12 pr-16 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            onClick={startSearchVoiceInput}
            disabled={searchRecording || isSearchVoiceProcessing}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
              searchRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {isSearchVoiceProcessing ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2 whitespace-nowrap">
              <Filter size={14} />
              分类筛选:
            </div>
            <button 
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                !selectedTag ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              全部
            </button>
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                  tag === selectedTag ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center text-gray-300">
            <Database size={48} className="mb-4" />
            <p className="text-lg">未找到匹配的客户档案</p>
          </div>
        ) : (
          filtered.map(customer => (
            <Link 
              key={customer.id} 
              to={`/customers/${customer.id}`}
              className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all relative flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <User size={24} />
                </div>
                <div className="flex flex-wrap justify-end gap-1 max-w-[150px]">
                  {customer.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold whitespace-nowrap">{tag}</span>
                  ))}
                  {customer.tags.length > 3 && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-bold">+{customer.tags.length - 3}</span>}
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h4>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <Building2 size={14} />
                {customer.company}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-xs text-gray-400">
                <span className="truncate max-w-[150px]">{customer.role || '未设职位'} • {customer.industry || '未分类'}</span>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">录入客户信息</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客户姓名 *</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属公司 *</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newCustomer.company}
                    onChange={e => setNewCustomer({...newCustomer, company: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newCustomer.role}
                    onChange={e => setNewCustomer({...newCustomer, role: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newCustomer.industry}
                    onChange={e => setNewCustomer({...newCustomer, industry: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Tags size={14} className="text-gray-400" />
                  客户标签 (用空格或逗号分隔)
                </label>
                <input 
                  type="text"
                  placeholder="如：重要客户 意向强 硬件行业"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newCustomer.tagsInput}
                  onChange={e => setNewCustomer({...newCustomer, tagsInput: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">取消</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-50">保存客户</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;
