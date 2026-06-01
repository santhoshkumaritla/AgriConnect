const Unauthorized = () => {
  return (
    <div className="mx-auto max-w-lg text-center">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Access denied</h1>
      <p className="mt-2 text-sm text-slate-500">
        You do not have permission to view this page.
      </p>
    </div>
  );
};

export default Unauthorized;
