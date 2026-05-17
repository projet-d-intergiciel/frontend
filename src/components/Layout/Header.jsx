import { Bell, User } from 'lucide-react';

const Header = ({ userName = "Jean Dupont", notificationCount = 0 }) => {
  return (
    <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">
        INVENTORY CONTROL
      </h1>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={20} className="text-gray-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <User size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;