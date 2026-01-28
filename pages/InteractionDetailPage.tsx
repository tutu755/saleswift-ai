
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Target, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Zap,
  Calendar,
  Smile,
  MessageSquare
} from 'lucide-react';
import { Interaction } from '../types';

const DetailSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
      <div className="text-blue-600">{icon}</div>
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const MetricPill: React.FC<{ label: string, value: string | number, subValue?: string }> = ({ label, value, subValue }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
    <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">{label}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-xl font-bold text-gray-900">{value}</span>
      {subValue && <span className="text-sm text-gray-400">{subValue}</span>}
    </div>
  </div>
);

const InteractionDetailPage: React.FC<{ interactions: Interaction[] }> = ({ interactions }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = interactions.find(i => i.id === id);

  if (!item) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">未找到该记录</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-blue-600 hover:underline">返回控制面板</button>
      </div>
    );
  }

  const sentimentColor = item.metrics.sentiment === '正面' ? 'text-emerald-600' : 
                         item.metrics.sentiment === '负面' ? 'text-rose-600' : 'text-gray-600';

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="font-medium">返回</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-extrabold text-gray-900">{item.customerProfile.name}</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {item.intelligence.currentStage}
            </span>
          </div>
          <p className="text-xl text-gray-500">{item.customerProfile.role} @ {item.customerProfile.company}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-sm mb-1">AI 置信度</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500" 
                style={{ width: `${item.metrics.confidenceScore}%` }}
              ></div>
            </div>
            <span className="font-bold text-gray-700">{item.metrics.confidenceScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <DetailSection title="执行摘要" icon={<Briefcase size={18} />}>
            <p className="text-gray-700 leading-relaxed text-lg italic">"{item.customerProfile.summary}"</p>
          </DetailSection>

          <DetailSection title="销售情报" icon={<Target size={18} />}>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">核心痛点</h4>
                <ul className="space-y-3">
                  {item.intelligence.painPoints.map((p, i) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <AlertTriangle className="text-amber-500 flex-shrink-0" size={18} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-4 tracking-widest">关键兴趣</h4>
                <ul className="space-y-3">
                  {item.intelligence.keyInterests.map((p, i) => (
                    <li key={i} className="flex gap-3 text-gray-700">
                      <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="下一步行动计划" icon={<Calendar size={18} />}>
            <div className="space-y-4">
              {item.intelligence.nextSteps.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      step.priority === '高' ? 'bg-red-500' : step.priority === '中' ? 'bg-amber-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{step.action}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {step.dueDate && <span className="text-sm text-gray-400">{step.dueDate}</span>}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                       step.priority === '高' ? 'bg-red-50 text-red-600' : step.priority === '中' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      优先级: {step.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="表现评估" icon={<Zap size={18} />}>
            <div className="space-y-4">
              <MetricPill label="发言比例" value={`${(item.metrics.talkRatio * 100).toFixed(0)}%`} subValue="您 vs 客户" />
              <MetricPill label="有效提问" value={item.metrics.questionRate} subValue="次/分钟" />
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 uppercase font-bold tracking-wider">情绪基调</p>
                <div className="flex items-center gap-2">
                  <Smile className={sentimentColor} size={20} />
                  <span className={`text-xl font-bold ${sentimentColor}`}>{item.metrics.sentiment}</span>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="AI 改进建议" icon={<Lightbulb size={18} />}>
            <ul className="space-y-4">
              {item.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-3 leading-relaxed">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></div>
                  {s}
                </li>
              ))}
            </ul>
          </DetailSection>

          <DetailSection title="原始上下文" icon={<MessageSquare size={18} />}>
            <p className="text-xs text-gray-400 line-clamp-6 leading-relaxed">
              {item.rawInput}
            </p>
          </DetailSection>
        </div>
      </div>
    </div>
  );
};

export default InteractionDetailPage;
