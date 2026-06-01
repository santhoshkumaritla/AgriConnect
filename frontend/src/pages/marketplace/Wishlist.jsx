import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import useRolePath from '../../hooks/useRolePath';
import { imageUrl } from '../../utils/media';
import ActionMessage from '../../components/ui/ActionMessage';
import { getApiError } from '../../utils/apiError';

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { rp } = useRolePath();
  const [cartMsg, setCartMsg] = useState({});
  const [removeMsg, setRemoveMsg] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/users/me/wishlist');
      return res.data.wishlist || [];
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) =>
      api.delete('/users/me/wishlist', { data: { productId } }),
    onSuccess: (_, productId) => {
      setRemoveMsg((s) => ({ ...s, [productId]: { type: 'success', text: 'Removed from wishlist.' } }));
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: (err, productId) => {
      setRemoveMsg((s) => ({
        ...s,
        [productId]: { type: 'error', text: getApiError(err, 'Could not remove.') },
      }));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Wishlist" subtitle="Saved products for later." />
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.map((product) => (
            <Card key={product._id} className="space-y-3">
              {product.images?.[0] && (
                <img src={imageUrl(product.images[0])} alt="" className="h-28 w-full rounded-lg object-cover" />
              )}
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-sm">₹{product.price} / kg</p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    addItem(product, 1);
                    setCartMsg((s) => ({ ...s, [product._id]: 'Added to cart!' }));
                  }}
                >
                  Add to cart
                </Button>
                <Button
                  variant="outline"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(product._id)}
                >
                  Remove
                </Button>
              </div>
              {cartMsg[product._id] && (
                <ActionMessage success={cartMsg[product._id]} />
              )}
              {removeMsg[product._id] && (
                <ActionMessage
                  success={removeMsg[product._id].type === 'success' ? removeMsg[product._id].text : ''}
                  error={removeMsg[product._id].type === 'error' ? removeMsg[product._id].text : ''}
                />
              )}
              <Link to={rp('marketplace', product._id)} className="text-sm text-brand-green">
                View →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
