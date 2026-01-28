
import React from 'react';
import { Interaction, SalesStage } from '../types';
import { 
  Users, 
  Target, 
  BarChart3, 
  ArrowUpRight,
  Clock,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, trend?: string }> = ({ icon, label, value, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
        {icon}
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} />
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
  </div>
);

const DashboardPage: React.FC<{ interactions: Interaction[] }> = ({ interactions }) => {
  const recentInteractions = interactions.slice(0, 5);
  
  const stageData = Object.values(SalesStage).map(stage => ({
    name: stage,
    count: interactions.filter(i => i.intelligence.currentStage === stage).length
  }));

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#f1f5f9'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">欢迎回来，张三</h2>
        <p className="text-gray-500 mt-1">这是您今天的销售管线概览。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users size={20} />} label="活跃线索" value={interactions.length.toString()} trend="+12%" />
        <StatCard icon={<Target size={20} />} label="整体成交率" value="32%" trend="+5%" />
        <StatCard icon={<BarChart3 size={20} />} label="管线总价值" value="￥1,240.5k" />
        <StatCard icon={<Clock size={20} />} label="平均响应时长" value="4.2h" trend="-15%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">销售管线分布</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="数量">
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">近期洞察</h3>
            <Link to="/history" className="text-sm text-blue-600 font-semibold hover:underline">查看全部</Link>
          </div>
          <div className="space-y-6">
            {recentInteractions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                暂无记录。开始记录您的第一次互动吧！
              </div>
            ) : (
              recentInteractions.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/interaction/${item.id}`}
                  className="group flex gap-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white border border-transparent group-hover:border-gray-200 shadow-sm">
                    <User className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-semibold text-gray-900 truncate">{item.customerProfile.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.customerProfile.company}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.intelligence.currentStage}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
