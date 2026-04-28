export const InputGroup = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-0.5">{label}</label>
    {children}
  </div>
);

export const PrimaryButton = ({ children, className = "" }) => (
  <button className={`bg-[#0F4C81] text-white text-[11px] font-bold px-5 py-2.5 rounded uppercase tracking-wide hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/10 ${className}`}>
    {children}
  </button>
);

export const SecondaryButton = ({ children }) => (
  <button className="text-[11px] font-bold text-gray-400 border border-gray-200 px-5 py-2.5 rounded uppercase hover:bg-gray-50 transition-colors">
    {children}
  </button>
);