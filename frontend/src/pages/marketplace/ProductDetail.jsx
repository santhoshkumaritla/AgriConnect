import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import useRolePath from '../../hooks/useRolePath';
import { imageUrl } from '../../utils/media';

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const isConsumer = user?.role === 'consumer';
  const { rp } = useRolePath();
  const [qty, setQty] = useState(1);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState(false);

  const { data } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data;
    },
  });

  const { data: related } = useQuery({
    queryKey: ['related', data?.product?.category],
    enabled: !!data?.product?.category,
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { category: data.product.category, limit: 4 },
      });
      return res.data.items?.filter((p) => p._id !== id) || [];
    },
  });

  const product = data?.product;
  if (!product) return <p className="text-sm text-slate-500">Loading...</p>;

  const showAction = (msg, isError = false) => {
    setActionMsg(msg);
    setActionError(isError);
  };

  const handleWishlist = async () => {
    if (!user) return;
    try {
      await api.post('/users/me/wishlist', { productId: product._id });
      showAction('Added to wishlist!');
    } catch {
      showAction('Could not add to wishlist', true);
    }
  };

  const handleFollow = async () => {
    if (!user || !product.farmerId?._id) return;
    try {
      await api.post('/users/me/following', { farmerId: product.farmerId._id });
      showAction('You are now following this farmer!');
    } catch {
      showAction('Could not follow farmer', true);
    }
  };

  const handleAddToCart = () => {
    addItem(product, qty);
    showAction(`Added ${qty} kg to cart!`);
  };

  return (
    <div className="space-y-8">
      <PageHeader title={product.title} subtitle={`Category: ${product.category}`} />
      <div className="grid gap-6 md:grid-cols-2">
        {product.images?.[0] ? (
          <img
            src={imageUrl(product.images[0])}
            alt={product.title}
            className="h-64 rounded-2xl object-cover md:h-80"
          />
        ) : (
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 md:h-80" />
        )}
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{product.description}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">₹{product.price} per kg</p>
          <p className="text-sm text-slate-500">
            Stock: {product.quantity} kg
            {product.organicStatus && ' · Organic certified'}
          </p>
          {product.farmerId && (
            <p className="text-sm">
              Farmer:{' '}
              <Link to={rp('farmers', product.farmerId._id)} className="font-semibold text-brand-green">
                {product.farmerId.name}
              </Link>
            </p>
          )}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Qty (kg)</label>
            <input
              type="number"
              min={1}
              max={product.quantity}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {isConsumer && (
              <>
                <Button onClick={handleAddToCart} disabled={product.quantity < 1}>
                  Add to Cart
                </Button>
                <Button variant="outline" onClick={handleWishlist}>
                  Wishlist
                </Button>
                <Button variant="outline" onClick={handleFollow}>
                  Follow farmer
                </Button>
              </>
            )}
            {user?.role === 'farmer' && (
              <p className="text-sm text-slate-500">You are viewing as a farmer — switch to consumer account to purchase.</p>
            )}
          </div>
          {actionMsg && (
            <p className={`text-sm ${actionError ? 'text-red-600' : 'text-brand-green'}`}>{actionMsg}</p>
          )}
        </div>
      </div>
      {related?.length > 0 && (
        <div>
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Related products</h3>
          <div className="grid gap-4 md:grid-cols-4">
            {related.map((p) => (
              <Link key={p._id} to={rp('marketplace', p._id)} className="rounded-xl border p-3 dark:border-slate-800">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-slate-500">₹{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
