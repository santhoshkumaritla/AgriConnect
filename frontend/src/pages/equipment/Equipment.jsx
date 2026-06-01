import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../utils/media';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import ActionMessage from '../../components/ui/ActionMessage';

const EQUIPMENT_TYPES = ['Tractor', 'Harvester', 'Sprayer', 'Seeder', 'Water Pump'];

const Equipment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [images, setImages] = useState(null);
  const [bookingForm, setBookingForm] = useState({});
  const [bookingFeedback, setBookingFeedback] = useState({});
  const [pendingEquipmentId, setPendingEquipmentId] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const listFeedback = useFormFeedback();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['equipment'] });
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', search],
    queryFn: async () => {
      const res = await api.get('/equipment', { params: { search: search || undefined } });
      return res.data.equipment || [];
    },
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data.bookings || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      form.append('equipmentName', values.equipmentName);
      form.append('category', values.category || 'Tractor');
      form.append('rentalPrice', values.rentalPrice);
      form.append('description', values.description || '');
      if (images) Array.from(images).forEach((f) => form.append('images', f));
      return api.post('/equipment', form);
    },
    onSuccess: () => {
      listFeedback.showSuccess('Equipment listed successfully!');
      refresh();
      reset();
      setImages(null);
      setShowAdd(false);
    },
    onError: (err) => listFeedback.showError(err, 'Could not list equipment.'),
  });

  const bookMutation = useMutation({
    mutationFn: (body) => api.post('/bookings', body),
    onSuccess: (res, variables) => {
      const equipmentId = variables.equipmentId;
      setBookingFeedback((s) => ({
        ...s,
        [equipmentId]: {
          type: 'success',
          text: res.data?.message || 'Rental request sent! Waiting for owner approval.',
        },
      }));
      setBookingForm((s) => ({ ...s, [equipmentId]: { date: '', duration: '' } }));
      setPendingEquipmentId(null);
      refresh();
    },
    onError: (err, variables) => {
      setBookingFeedback((s) => ({
        ...s,
        [variables.equipmentId]: {
          type: 'error',
          text: err?.response?.data?.message || 'Could not send request. Log in as a farmer.',
        },
      }));
      setPendingEquipmentId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => refresh(),
  });

  const handleRequestRental = (item) => {
    const b = bookingForm[item._id];
    if (!b?.date) {
      setBookingFeedback((s) => ({
        ...s,
        [item._id]: { type: 'error', text: 'Please select a start date.' },
      }));
      return;
    }
    if (!b?.duration || Number(b.duration) < 1) {
      setBookingFeedback((s) => ({
        ...s,
        [item._id]: { type: 'error', text: 'Please enter duration (at least 1 day).' },
      }));
      return;
    }
    setBookingFeedback((s) => ({ ...s, [item._id]: null }));
    setPendingEquipmentId(item._id);
    bookMutation.mutate({
      equipmentId: item._id,
      bookingDate: new Date(b.date).toISOString(),
      duration: Number(b.duration),
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Equipment Rental" subtitle="Listings and bookings from database." />

      {user?.role === 'farmer' && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fill in the start date and duration, then click Request rental. Your request will appear
          below under My bookings.
        </p>
      )}

      <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />

      {user?.role === 'equipment_owner' && (
        <Button onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : 'Add equipment'}</Button>
      )}

      {showAdd && (
        <Card>
          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="grid gap-4 md:grid-cols-2">
            <Input label="Name" {...register('equipmentName', { required: true })} />
            <label className="flex flex-col gap-2 text-sm font-medium">
              Type
              <select className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" {...register('category')}>
                {EQUIPMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
            <Input label="Rental price / day (₹)" type="number" {...register('rentalPrice', { required: true })} />
            <Input label="Description" {...register('description')} />
            <Input label="Images" type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Listing...' : 'List equipment'}
              </Button>
            </div>
            <ActionMessage className="md:col-span-2" success={listFeedback.success} error={listFeedback.error} />
          </form>
        </Card>
      )}

      {user?.role !== 'farmer' && user?.role !== 'equipment_owner' && (
        <p className="text-sm text-slate-500">Equipment rental is available for farmers and owners.</p>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading equipment...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">No equipment listed yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {data.map((item) => (
            <Card key={item._id} className="space-y-3">
              {item.images?.[0] ? (
                <img src={imageUrl(item.images[0])} alt="" className="h-28 w-full rounded-lg object-cover" />
              ) : (
                <div className="h-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
              )}
              <h3 className="font-semibold">{item.equipmentName}</h3>
              <p className="text-sm text-slate-500">₹{item.rentalPrice}/day · {item.category}</p>
              {user?.role === 'farmer' && (
                <div className="space-y-2">
                  <Input
                    label="Start date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm[item._id]?.date || ''}
                    onChange={(e) =>
                      setBookingForm((s) => ({
                        ...s,
                        [item._id]: { ...s[item._id], date: e.target.value },
                      }))
                    }
                  />
                  <Input
                    label="Duration (days)"
                    type="number"
                    min={1}
                    value={bookingForm[item._id]?.duration || ''}
                    onChange={(e) =>
                      setBookingForm((s) => ({
                        ...s,
                        [item._id]: { ...s[item._id], duration: e.target.value },
                      }))
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Total: ₹
                    {bookingForm[item._id]?.duration
                      ? Number(bookingForm[item._id].duration) * item.rentalPrice
                      : '—'}
                  </p>
                  <Button
                    variant="outline"
                    disabled={pendingEquipmentId === item._id && bookMutation.isPending}
                    onClick={() => handleRequestRental(item)}
                  >
                    {pendingEquipmentId === item._id && bookMutation.isPending
                      ? 'Sending...'
                      : 'Request rental'}
                  </Button>
                  {bookingFeedback[item._id] && (
                    <p
                      className={`text-sm ${
                        bookingFeedback[item._id].type === 'success'
                          ? 'text-brand-green'
                          : 'text-red-600'
                      }`}
                    >
                      {bookingFeedback[item._id].text}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {(user?.role === 'farmer' || user?.role === 'equipment_owner') && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {user?.role === 'farmer' ? 'My bookings' : 'Booking requests'}
          </h3>
          {bookingsLoading ? (
            <p className="text-sm text-slate-500">Loading bookings...</p>
          ) : !bookings?.length ? (
            <Card>
              <p className="text-sm text-slate-500">No bookings yet. Submit a rental request above.</p>
            </Card>
          ) : (
            bookings.map((b) => (
              <Card key={b._id}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm">
                    <strong>{b.equipmentId?.equipmentName || 'Equipment'}</strong>
                    {b.farmerId?.name && ` · Farmer: ${b.farmerId.name}`}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      b.status === 'approved'
                        ? 'bg-brand-green/20 text-brand-green'
                        : b.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : b.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  ₹{b.totalPrice} · {new Date(b.bookingDate).toLocaleDateString()} · {b.duration}{' '}
                  day{b.duration > 1 ? 's' : ''}
                </p>
                {user?.role === 'equipment_owner' && b.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => statusMutation.mutate({ id: b._id, status: 'approved' })}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => statusMutation.mutate({ id: b._id, status: 'rejected' })}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Equipment;
