// Formater la date
export const formatDate = (dateStr, format = 'short') => {
  const date = new Date(dateStr);
  if (format === 'short') {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
  if (format === 'long') {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  if (format === 'datetime') {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
  return dateStr;
};

// Formater la devise
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Formater le nombre
export const formatNumber = (num) => {
  return num.toLocaleString('fr-FR');
};

// Calculer la variation
export const getVariation = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Obtenir la couleur selon la variation
export const getVariationColor = (variation) => {
  if (variation > 0) return 'text-green-600';
  if (variation < 0) return 'text-red-600';
  return 'text-gray-500';
};

// Obtenir le badge de statut
export const getStatusBadge = (status) => {
  const badges = {
    OK: 'bg-green-100 text-green-700',
    ALERTE: 'bg-yellow-100 text-yellow-700',
    RUPTURE: 'bg-red-100 text-red-700',
    ENTRÉE: 'bg-green-100 text-green-700',
    SORTIE: 'bg-red-100 text-red-700',
    AJUSTEMENT: 'bg-blue-100 text-blue-700'
  };
  return badges[status] || 'bg-gray-100 text-gray-700';
};

// Grouper les données par période
export const groupByPeriod = (data, period = 'day') => {
  // Implémentation selon besoin
  return data;
};