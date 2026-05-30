import { useState, useEffect } from 'react';

const StockChart = ({ data = [] }) => {
  const [chartData, setChartData] = useState([
    { day: 'Lun', value: 45 },
    { day: 'Mar', value: 52 },
    { day: 'Mer', value: 38 },
    { day: 'Jeu', value: 47 },
    { day: 'Ven', value: 55 },
    { day: 'Sam', value: 62 },
    { day: 'Dim', value: 48 }
  ]);

  useEffect(() => {
    if (data.length > 0) {
      setChartData(data);
    }
  }, [data]);

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Mouvements de stock — 7 derniers jours</h3>
      <div className="flex items-end justify-between gap-2 h-64">
        {chartData.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
              style={{ height: `${(item.value / maxValue) * 180}px` }}
            />
            <div className="text-center mt-3">
              <p className="text-xs text-gray-500">{item.day}</p>
              <p className="text-sm font-semibold text-gray-700">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockChart;