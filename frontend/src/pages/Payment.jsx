import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import useRolePath from '../hooks/useRolePath';

const Payment = () => {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const navigate = useNavigate();
  const { rp } = useRolePath();
  const { total, clearCart } = useCart();

  const checkoutRaw = sessionStorage.getItem('checkout');
  const checkout = checkoutRaw ? JSON.parse(checkoutRaw) : null;
  const amount = checkout?.total ?? total;
  const items = checkout?.items ?? [];

  const processPayment = async () => {
    setLoading(true);
    setPayError('');
    try {
      const groups = {};
      items.forEach((item) => {
        const fid = item.farmerId;
        if (!groups[fid]) groups[fid] = [];
        groups[fid].push(item);
      });

      const transactionId = `TXN${Date.now()}`;
      const simulateSuccess = cardNumber !== '0000000000000000';

      if (!simulateSuccess) {
        navigate(rp('payment', 'failure'));
        return;
      }

      for (const [farmerId, farmerItems] of Object.entries(groups)) {
        const products = farmerItems.map((i) => ({
          productId: i.productId,
          title: i.title,
          quantity: Number(i.quantity),
          price: Number(i.price),
        }));
        const orderAmount = farmerItems.reduce((s, i) => s + i.price * i.quantity, 0);
        await api.post('/orders', {
          farmerId,
          products,
          amount: orderAmount,
          payment: {
            method,
            status: 'completed',
            transactionId,
          },
        });
      }

      clearCart();
      sessionStorage.removeItem('checkout');
      navigate(rp('payment', 'success'), { state: { transactionId, amount } });
    } catch (err) {
      setPayError(err?.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length && !total) {
    return (
      <div className="space-y-6">
        <PageHeader title="Payment" subtitle="No items to pay for." />
        <Button onClick={() => navigate(rp('cart'))}>Go to cart</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment"
        subtitle="Simulated payment — gateway-ready architecture."
      />
      <Card className="space-y-6">
        <p className="text-lg font-semibold">Amount due: ₹{amount}</p>
        <div className="flex flex-wrap gap-3">
          {['upi', 'card', 'wallet'].map((item) => (
            <Button
              key={item}
              variant={method === item ? 'primary' : 'outline'}
              onClick={() => setMethod(item)}
            >
              {item.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          {method === 'upi' && (
            <Input label="UPI ID" placeholder="name@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
          )}
          {method === 'card' && (
            <>
              <Input
                label="Card number"
                placeholder="4111 1111 1111 1111"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">Use 0000000000000000 to simulate failure.</p>
            </>
          )}
          {method === 'wallet' && (
            <p className="text-sm text-slate-500">AgriConnect wallet balance: ₹5,000 (demo)</p>
          )}
        </div>
        {payError && <p className="text-sm text-red-600">{payError}</p>}
        <div className="flex gap-3">
          <Button className="flex-1" disabled={loading} onClick={processPayment}>
            {loading ? 'Processing...' : `Pay ₹${amount}`}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate(rp('cart'))}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Payment;
