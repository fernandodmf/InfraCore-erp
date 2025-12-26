import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Briefcase,
  FileText,
  Bell,
  Menu,
  Construction,
  Search,
  ChevronDown,
  Truck,
  Settings
} from 'lucide-react';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Cadastros', path: '/clients', icon: <Users size={18} /> },
    { name: 'Vendas', path: '/sales', icon: <ShoppingCart size={18} /> },
    { name: 'Compras', path: '/purchases', icon: <ShoppingBag size={18} /> },
    { name: 'Produção', path: '/production', icon: <Construction size={18} /> },
    { name: 'Financeiro', path: '/finance', icon: <DollarSign size={18} /> },
    { name: 'RH', path: '/hr', icon: <Briefcase size={18} /> },
    { name: 'Frota', path: '/fleet', icon: <Truck size={18} /> },
    { name: 'Relatórios', path: '/reports', icon: <FileText size={18} /> },
    { name: 'Configurações', path: '/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-white flex flex-col font-body">
      {/* Modern Clean Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 h-16 shadow-soft">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-4 lg:gap-8">

            {/* Logo Area */}
            <div className="flex items-center gap-2.5 shrink-0 cursor-pointer">
              <div className="bg-cyan-600 text-white p-1.5 rounded-lg">
                <Construction size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-none tracking-tight font-display">InfraCore</h1>
              </div>
            </div>

            {/* Horizontal Navigation - Modules as Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 justify-start ml-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out flex items-center gap-2 whitespace-nowrap ${isActive
                      ? 'bg-slate-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/50'
                    }`
                  }
                >
                  <span className="block">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right Actions Area Removed for Space */}
          </div>
        </div>


      </header>

      {/* Main Content - Reduced vertical padding for better density */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-medium">
          <p>© 2024 InfraCore ERP. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-2 md:mt-0">
            <a href="#" className="hover:text-cyan-600 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-cyan-600 transition-colors">Suporte Técnico</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;