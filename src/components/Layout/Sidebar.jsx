import { LayoutDashboard, Package, Database, ShoppingCart, Bell, Users } from 'lucide-react';

export const Sidebar = ({ activePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'produits', label: 'Produits', icon: Package },
    { id: 'stock', label: 'Stock', icon: Database },
    { id: 'commandes', label: 'Commandes', icon: ShoppingCart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 p-6 flex flex-col h-screen sticky top-0">
      <div className="mb-10 px-2">
        <h1 className="text-[#0F4C81] font-bold text-xl leading-tight">
          StockManager
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Inventory Control</p>
      </div>
      
      <nav className="flex-1">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all mb-1 ${
              activePage === item.id 
              ? 'bg-blue-50 text-[#0F4C81] border-l-4 border-[#0F4C81] rounded-l-none' 
              : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="text-sm font-semibold">{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">JD</div>
        <div>
          <p className="text-sm font-bold text-slate-700">Jean Dupont</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Admin</p>
        </div>
      </div>
    </aside>
  );
};