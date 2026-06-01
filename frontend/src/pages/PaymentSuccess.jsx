import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useRolePath from '../hooks/useRolePath';

const PaymentSuccess = () => {
  const { state } = useLocation();
  const { rp } = useRolePath();

  return (
    <div className="space-y-6">
      <PageHeader title="Payment successful" subtitle="Your order has been placed." />
      <Card className="space-y-4 text-center">
        <p className="text-4xl">✓</p>
        <p className="font-semibold text-brand-green">Payment completed</p>
        {state?.transactionId && (
          <p className="text-sm text-slate-500">Transaction ID: {state.transactionId}</p>
        )}
        {state?.amount && <p className="text-sm">Amount paid: ₹{state.amount}</p>}
        <div className="flex justify-center gap-3">
          <Link to={rp('orders')}>
            <Button>View orders</Button>
          </Link>
          <Link to={rp('marketplace')}>
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
