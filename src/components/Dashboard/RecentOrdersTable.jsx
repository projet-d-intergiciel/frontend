import { MoreHorizontal } from 'lucide-react';

const RecentOrdersTable = ({ orders = [] }) => {
  const defaultOrders = [
    {
      id: '#ORD-2891',
      type: 'Réapprovisionnement',
      status: 'EXPÉDIÉ',
      date: '22 Mai, 14:30',
      creator: 'A. Martin'
    },
    {
      id: '#ORD-2890',
      type: 'Sortie Stock',
      status: 'EN COURS',
      date: '22 Mai, 12:15',
      creator: 'J. Dupont'
    },
    {
      id: '#ORD-2889',
      type: 'Inventaire',
      status: 'ATTENTE',
      date: '21 Mai, 09:45',
      creator: 'S. Leroy'
    }
  ];

  const displayOrders = orders.length > 0 ? orders : defaultOrders;

  const getStatusBadge = (status) => {
    const styles = {
      'EXPÉDIÉ': 'bg-green-100 text-green-700',
      'EN COURS': 'bg-yellow-100 text-yellow-700',
      'ATTENTE': 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Commandes récentes</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayOrders.map((order, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.creator}</td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;