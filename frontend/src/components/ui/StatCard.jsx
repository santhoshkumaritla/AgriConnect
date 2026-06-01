import Card from './Card';

const StatCard = ({ label, value, helper }) => {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
    </Card>
  );
};

export default StatCard;
