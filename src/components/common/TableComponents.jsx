export const StatusBadge = ({ type }) => {
  const config = {
    OK: "bg-emerald-50 text-emerald-600",
    ALERTE: "bg-orange-50 text-orange-600",
    RUPTURE: "bg-red-50 text-red-600",
    EXPÉDIÉ: "bg-green-50 text-green-600",
    "EN COURS": "bg-blue-50 text-blue-600",
    ATTENTE: "bg-amber-50 text-amber-600",
    ENTRÉE: "bg-emerald-50 text-emerald-500",
    SORTIE: "bg-red-50 text-red-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${config[type] || "bg-gray-100"}`}>
      {type}
    </span>
  );
};

export const DataTable = ({ title, headers, children, action }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-5 border-b border-gray-50 flex justify-between items-center">
      <h3 className="font-bold text-slate-700 italic text-sm tracking-tight">{title}</h3>
      {action}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <tr>
            {headers.map((h, i) => <th key={i} className="px-6 py-4">{h}</th>)}
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-50">
          {children}
        </tbody>
      </table>
    </div>
  </div>
);