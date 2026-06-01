const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-green/50';
  const variants = {
    primary: 'bg-brand-green text-white hover:bg-brand-green/90',
    outline: 'border border-brand-green text-brand-green hover:bg-brand-green/10',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
