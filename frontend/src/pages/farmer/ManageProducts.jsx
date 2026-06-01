import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { imageUrl } from '../../utils/media';
import { useAuth } from '../../context/AuthContext';
import ActionMessage from '../../components/ui/ActionMessage';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import { getApiError } from '../../utils/apiError';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'];

const ManageProducts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const [images, setImages] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editImages, setEditImages] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState({});
  const createFeedback = useFormFeedback();
  const updateFeedback = useFormFeedback();

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-products', user?._id],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { farmerId: user._id, limit: 100 },
      });
      return res.data.items || [];
    },
    enabled: !!user?._id,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['my-products'] });

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      form.append('title', values.title);
      form.append('category', values.category);
      form.append('price', values.price);
      form.append('quantity', values.quantity);
      if (values.description) form.append('description', values.description);
      if (values.harvestDate) form.append('harvestDate', values.harvestDate);
      form.append('organicStatus', values.organicStatus === 'true' ? 'true' : 'false');
      if (images) Array.from(images).forEach((f) => form.append('images', f));
      return api.post('/products', form);
    },
    onSuccess: () => {
      createFeedback.showSuccess('Product added to marketplace!');
      invalidate();
      reset();
      setImages(null);
    },
    onError: (err) => createFeedback.showError(err, 'Failed to add product'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const form = new FormData();
      Object.entries(values).forEach(([k, v]) => v !== '' && form.append(k, v));
      form.append('organicStatus', values.organicStatus === 'true');
      if (editImages) Array.from(editImages).forEach((f) => form.append('images', f));
      return api.put(`/products/${id}`, form);
    },
    onSuccess: () => {
      updateFeedback.showSuccess('Product updated!');
      invalidate();
      setEditing(null);
      setEditImages(null);
    },
    onError: (err) => updateFeedback.showError(err, 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: (_, id) => {
      setDeleteFeedback((s) => ({ ...s, [id]: { type: 'success', text: 'Product deleted.' } }));
      invalidate();
    },
    onError: (err, id) => {
      setDeleteFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Failed to delete') },
      }));
    },
  });

  if (user && user.role !== 'farmer') {
    return (
      <div className="space-y-4">
        <PageHeader title="My Products" subtitle="Only farmer accounts can manage products." />
        <p className="text-sm text-red-600">
          You are logged in as <strong className="capitalize">{user.role?.replace('_', ' ')}</strong>.
          Log out and sign in with a farmer account (e.g. farmer@demo.com).
        </p>
        <Link to="/login" className="text-sm font-semibold text-brand-green">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="My Products" subtitle="Create, edit, and delete listings stored in MongoDB." />
      <Card className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Add new product</h3>
        <form
          onSubmit={handleSubmit((v) => createMutation.mutate(v))}
          className="grid gap-4 md:grid-cols-2"
        >
          <Input label="Title" {...register('title', { required: true })} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Category
            <select className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" {...register('category', { required: true })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <Input label="Price (₹/kg)" type="number" step="0.01" {...register('price', { required: true })} />
          <Input label="Quantity (kg)" type="number" {...register('quantity', { required: true })} />
          <Input label="Harvest date" type="date" {...register('harvestDate')} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Organic
            <select className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" {...register('organicStatus')} defaultValue="false">
              <option value="false">Conventional</option>
              <option value="true">Organic</option>
            </select>
          </label>
          <textarea className="md:col-span-2 rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" rows={2} placeholder="Description" {...register('description')} />
          <Input label="Images" type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
          <div className="flex items-end">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add product'}
            </Button>
          </div>
          <ActionMessage className="md:col-span-2" success={createFeedback.success} error={createFeedback.error} />
        </form>
      </Card>

      <div className="space-y-4">
        <h3 className="font-semibold">Your listings ({products?.length || 0})</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !products?.length ? (
          <p className="text-sm text-slate-500">No products yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <Card key={product._id}>
                {editing === product._id ? (
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.target);
                      updateMutation.mutate({
                        id: product._id,
                        values: Object.fromEntries(fd.entries()),
                      });
                    }}
                  >
                    <Input name="title" defaultValue={product.title} label="Title" />
                    <Input name="price" type="number" defaultValue={product.price} label="Price" />
                    <Input name="quantity" type="number" defaultValue={product.quantity} label="Stock (kg)" />
                    <Input name="description" defaultValue={product.description} label="Description" />
                    <Input type="file" multiple accept="image/*" onChange={(e) => setEditImages(e.target.files)} />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                    <ActionMessage success={updateFeedback.success} error={updateFeedback.error} />
                  </form>
                ) : (
                  <div className="flex gap-4">
                    {product.images?.[0] && (
                      <img src={imageUrl(product.images[0])} alt="" className="h-20 w-20 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-slate-500">₹{product.price} · {product.quantity} kg · {product.category}</p>
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setEditing(product._id)}>Edit</Button>
                          <Button
                            variant="outline"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(product._id)}
                          >
                            Delete
                          </Button>
                        </div>
                        {deleteFeedback[product._id] && (
                          <ActionMessage
                            success={deleteFeedback[product._id].type === 'success' ? deleteFeedback[product._id].text : ''}
                            error={deleteFeedback[product._id].type === 'error' ? deleteFeedback[product._id].text : ''}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
