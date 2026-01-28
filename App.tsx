
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  TrendingUp, 
  Users,
  LogOut,
  Zap,
  CalendarDays
} from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import NewInteractionPage from './pages/NewInteractionPage';
import InteractionDetailPage from './pages/InteractionDetailPage';
import HistoryPage from './pages/HistoryPage';
import GrowthPage from './pages/GrowthPage';
import CustomerManagementPage from './pages/CustomerManagementPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import SchedulePage from './pages/SchedulePage';
import RolePlayPage from './pages/RolePlayPage';
import { Interaction, Customer, Schedule } from './types';

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  to: string; 
  active?: boolean 
}> = ({ icon, label, to, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const location = useLocation();

  useEffect(() => {
    const savedInteractions = localStorage.getItem('sales_interactions');
    const savedCustomers = localStorage.getItem('sales_customers');
    const savedSchedules = localStorage.getItem('sales_schedules');
    if (savedInteractions) setInteractions(JSON.parse(savedInteractions));
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    if (savedSchedules) setSchedules(JSON.parse(savedSchedules));
  }, []);

  const saveInteraction = (newInteraction: Interaction) => {
    const updated = [newInteraction, ...interactions];
    setInteractions(updated);
    localStorage.setItem('sales_interactions', JSON.stringify(updated));
  };

  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    localStorage.setItem('sales_customers', JSON.stringify(newCustomers));
  };

  const addCustomer = (customer: Customer) => {
    const updated = [customer, ...customers];
    saveCustomers(updated);
    return customer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    const updated = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    saveCustomers(updated);
  };

  const saveSchedules = (newSchedules: Schedule[]) => {
    setSchedules(newSchedules);
    localStorage.setItem('sales_schedules', JSON.stringify(newSchedules));
  };

  const addSchedule = (schedule: Schedule) => {
    const updated = [schedule, ...schedules];
    saveSchedules(updated);
  };

  const toggleScheduleStatus = (id: string) => {
    const updated = schedules.map(s => s.id === id ? { ...s, status: s.status === 'completed' ? 'pending' : 'completed' as any } : s);
    saveSchedules(updated);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">SaleSwift</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="控制面板" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={<PlusCircle size={20} />} label="新建互动" to="/new" active={location.pathname === '/new'} />
          <SidebarItem icon={<CalendarDays size={20} />} label="日程计划" to="/schedules" active={location.pathname === '/schedules'} />
          <SidebarItem icon={<Users size={20} />} label="客户管理" to="/customers" active={location.pathname.startsWith('/customers')} />
          <SidebarItem icon={<History size={20} />} label="历史记录" to="/history" active={location.pathname === '/history'} />
          <SidebarItem icon={<TrendingUp size={20} />} label="成长曲线" to="/growth" active={location.pathname === '/growth'} />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              JD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">张三</p>
              <p className="text-xs text-gray-500 truncate">高级大客户经理</p>
            </div>
          </div>
          <SidebarItem icon={<LogOut size={20} />} label="退出登录" to="/logout" />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage interactions={interactions} />} />
            <Route path="/new" element={<NewInteractionPage onSave={saveInteraction} customers={customers} onAddCustomer={addCustomer} />} />
            <Route path="/schedules" element={<SchedulePage schedules={schedules} customers={customers} onAddSchedule={addSchedule} onToggleStatus={toggleScheduleStatus} />} />
            <Route path="/customers" element={<CustomerManagementPage customers={customers} onSync={saveCustomers} onAdd={addCustomer} />} />
            <Route path="/customers/:id" element={<CustomerDetailPage customers={customers} interactions={interactions} schedules={schedules} onAddSchedule={addSchedule} onUpdateCustomer={updateCustomer} />} />
            <Route path="/roleplay/:customerId" element={<RolePlayPage customers={customers} interactions={interactions} />} />
            <Route path="/history" element={<HistoryPage interactions={interactions} />} />
            <Route path="/interaction/:id" element={<InteractionDetailPage interactions={interactions} />} />
            <Route path="/growth" element={<GrowthPage interactions={interactions} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
