export const StatCard = ({ title, value, unit, icon: Icon, colorClass, bgColorClass, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black mt-2 text-slate-800">
        {value} {unit && <span className="text-xs font-normal text-gray-300">{unit}</span>}
      </h3>
      {trend && (
        <p className={`text-[10px] mt-2 font-bold ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>
          {trend}
        </p>
      )}
    </div>
    <div className={`p-3 rounded-lg ${bgColorClass} ${colorClass}`}>
      <Icon size={22} />
    </div>
  </div>
);