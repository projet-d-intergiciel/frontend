import { AlertCircle, TrendingDown, Package } from 'lucide-react';

const AlertsList = ({ alerts = [] }) => {
  const defaultAlerts = [
    {
      id: 1,
      title: 'RAM DDR5 - Stock Critique',
      description: 'Seulement 2 unités restantes en Rayon A-4.',
      severity: 'critical'
    },
    {
      id: 2,
      title: 'GPU RTX 4080 - Rupture',
      description: 'Dépassement du seuil minimal (0/15).',
      severity: 'critical'
    },
    {
      id: 3,
      title: 'SSD 1TB - Réapprovisionnement',
      description: 'Commande fournisseur non confirmée.',
      severity: 'warning'
    }
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const getSeverityStyles = (severity) => {
    switch(severity) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-orange-500 bg-orange-50';
    }
  };

  const getIcon = (severity) => {
    switch(severity) {
      case 'critical':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'warning':
        return <Package size={18} className="text-yellow-500" />;
      default:
        return <TrendingDown size={18} className="text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-red-600 mb-4">Alertes critiques</h3>
      <div className="space-y-4">
        {displayAlerts.map((alert) => (
          <div 
            key={alert.id}
            className={`border-l-4 ${getSeverityStyles(alert.severity)} p-4 rounded-r-lg cursor-pointer hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3">
              {getIcon(alert.severity)}
              <div>
                <p className="font-semibold text-gray-800">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;