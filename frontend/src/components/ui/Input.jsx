const Input = ({ label, className = '', ...props }) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
      {label && <span>{label}</span>}
      <input
        className={`rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
        {...props}
      />
    </label>
  );
};

export default Input;
