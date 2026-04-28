import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

const KpiCards = ({ stats }) => {
  const cards = [
    {
      title: 'PRODUITS ACTIFS',
      value: stats.activeProducts || 142,
      icon: <Package size={24} />,
      color: 'blue'
    },
    {
      title: 'COMMANDES EN COURS',
      value: stats.pendingOrders || 27,
      icon: <ShoppingCart size={24} />,
      color: 'green'
    },
    {
      title: 'RUPTURES DE STOCK',
      value: stats.stockOuts || 8,
      icon: <AlertTriangle size={24} />,
      color: 'red'
    },
    {
      title: 'MOUVEMENTS 7J',
      value: stats.movements7d || 314,
      icon: <TrendingUp size={24} />,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
            </div>
            <div className={`p-3 rounded-full ${colorClasses[card.color]}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;