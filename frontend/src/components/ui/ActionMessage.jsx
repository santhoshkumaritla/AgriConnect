const ActionMessage = ({ success, error, className = '' }) => {
  if (!success && !error) return null;
  return (
    <p
      className={`text-sm ${className} ${
        success ? 'text-brand-green' : 'text-red-600 dark:text-red-400'
      }`}
      role="status"
    >
      {success || error}
    </p>
  );
};

export default ActionMessage;
