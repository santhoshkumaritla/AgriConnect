import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import useRolePath from '../hooks/useRolePath';

const PaymentFailure = () => {
  const { rp } = useRolePath();

  return (
    <div className="space-y-6">
      <PageHeader title="Payment failed" subtitle="Your payment could not be processed." />
      <Card className="space-y-4 text-center">
        <p className="text-4xl text-red-500">✕</p>
        <p className="font-semibold text-slate-900 dark:text-white">Transaction declined</p>
        <p className="text-sm text-slate-500">Please try again or use a different payment method.</p>
        <div className="flex justify-center gap-3">
          <Link to={rp('payment')}>
            <Button>Retry payment</Button>
          </Link>
          <Link to={rp('cart')}>
            <Button variant="outline">Back to cart</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default PaymentFailure;
