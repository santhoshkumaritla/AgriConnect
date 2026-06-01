import { useNavigate } from 'react-router-dom';
import useRolePath from '../../hooks/useRolePath';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const { items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();
  const { rp } = useRolePath();

  const startCheckout = () => {
    sessionStorage.setItem(
      'checkout',
      JSON.stringify({ items, total, createdAt: Date.now() })
    );
    navigate(rp('payment'));
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cart" subtitle="Your cart is empty." />
        <Button onClick={() => navigate(rp('marketplace'))}>Browse marketplace</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Cart" subtitle="Review items before checkout." />
      <Card className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 text-sm dark:border-slate-800">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-slate-500">₹{item.price} / kg</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={item.maxQuantity}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                className="w-16 rounded border px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
              />
              <span className="w-16 text-right font-medium">₹{item.price * item.quantity}</span>
              <Button variant="ghost" onClick={() => removeItem(item.productId)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between font-semibold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
        <Button className="w-full" onClick={startCheckout}>
          Proceed to Checkout
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
