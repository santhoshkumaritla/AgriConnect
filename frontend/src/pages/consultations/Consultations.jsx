import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ActionMessage from '../../components/ui/ActionMessage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { imageUrl } from '../../utils/media';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import { getApiError } from '../../utils/apiError';

const Consultations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState({});
  const [itemFeedback, setItemFeedback] = useState({});
  const { register, handleSubmit, reset } = useForm();
  const submitFeedback = useFormFeedback();

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['consultations'] });

  const { data: experts } = useQuery({
    queryKey: ['experts'],
    queryFn: async () => (await api.get('/users/experts')).data.experts || [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['consultations'],
    queryFn: async () => (await api.get('/consultations')).data.consultations || [],
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const question = values.question?.trim();
      if (!question) {
        throw new Error('Please enter your question.');
      }
      const form = new FormData();
      form.append('question', question);
      if (values.expertId) form.append('expertId', values.expertId);
      const file = document.getElementById('consult-image')?.files?.[0];
      if (file) form.append('image', file);
      return api.post('/consultations', form);
    },
    onSuccess: (res) => {
      submitFeedback.showSuccess(
        res.data?.message || 'Consultation submitted! Check My consultations below.'
      );
      const fileInput = document.getElementById('consult-image');
      if (fileInput) fileInput.value = '';
      refresh();
      reset();
    },
    onError: (err) => submitFeedback.showError(err, 'Could not submit consultation. Log in as a farmer.'),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, response }) => {
      const text = response?.trim();
      if (!text) {
        return Promise.reject(new Error('Please enter a reply.'));
      }
      return api.patch(`/consultations/${id}/reply`, { response: text });
    },
    onSuccess: (res, { id }) => {
      setItemFeedback((s) => ({
        ...s,
        [id]: { type: 'success', text: res.data?.message || 'Reply sent!' },
      }));
      setReplyText((s) => ({ ...s, [id]: '' }));
      refresh();
    },
    onError: (err, { id }) => {
      setItemFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Could not send reply.') },
      }));
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => api.patch(`/consultations/${id}/resolve`),
    onSuccess: (res, id) => {
      setItemFeedback((s) => ({
        ...s,
        [id]: { type: 'success', text: res.data?.message || 'Marked as resolved.' },
      }));
      refresh();
    },
    onError: (err, id) => {
      setItemFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Could not resolve.') },
      }));
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Expert Consultations" subtitle="Questions and replies stored in MongoDB." />

      {user?.role === 'farmer' && (
        <Card>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Describe your issue and click Submit consultation. Your question will appear under My
            consultations.
          </p>
          <form
            onSubmit={handleSubmit((v) => {
              submitFeedback.clear();
              createMutation.mutate(v);
            })}
            className="space-y-4"
          >
            <label className="flex flex-col gap-2 text-sm font-medium">
              Expert (optional)
              <select className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900" {...register('expertId')}>
                <option value="">Any available expert</option>
                {experts?.map((e) => (
                  <option key={e._id} value={e._id}>{e.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Your question
              <textarea
                className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                rows={3}
                placeholder="Describe your crop issue..."
                {...register('question', { required: true })}
              />
            </label>
            <Input label="Upload image (optional)" id="consult-image" type="file" accept="image/*" />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting...' : 'Submit consultation'}
            </Button>
            <ActionMessage success={submitFeedback.success} error={submitFeedback.error} />
          </form>
        </Card>
      )}

      {user?.role !== 'farmer' && user?.role !== 'expert' && user && (
        <p className="text-sm text-slate-500">Consultations are for farmers and experts.</p>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {user?.role === 'farmer' ? 'My consultations' : user?.role === 'expert' ? 'Incoming questions' : 'Consultations'}
        </h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !data?.length ? (
          <Card>
            <p className="text-sm text-slate-500">
              {user?.role === 'farmer'
                ? 'No consultations yet. Submit a question above.'
                : 'No consultations yet.'}
            </p>
          </Card>
        ) : (
          data.map((c) => (
            <Card key={c._id}>
              <p className="text-xs text-slate-500">
                {c.farmerId?.name && `Farmer: ${c.farmerId.name}`}
                {c.expertId?.name && ` · Expert: ${c.expertId.name}`}
                {' · '}
                <span className="capitalize">{c.status}</span>
              </p>
              <p className="mt-2 font-medium">{c.question}</p>
              {c.image && (
                <img src={imageUrl(c.image)} alt="Consultation" className="mt-2 max-h-48 rounded-lg object-cover" />
              )}
              {c.response && (
                <p className="mt-2 rounded-lg bg-brand-green/10 p-3 text-sm text-brand-green">{c.response}</p>
              )}
              {user?.role === 'expert' && c.status !== 'resolved' && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="min-w-[200px] flex-1 rounded border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                      placeholder="Your reply..."
                      value={replyText[c._id] || ''}
                      onChange={(e) => setReplyText((s) => ({ ...s, [c._id]: e.target.value }))}
                    />
                    <Button
                      variant="outline"
                      disabled={replyMutation.isPending}
                      onClick={() => replyMutation.mutate({ id: c._id, response: replyText[c._id] })}
                    >
                      {replyMutation.isPending ? 'Sending...' : 'Reply'}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={resolveMutation.isPending}
                      onClick={() => resolveMutation.mutate(c._id)}
                    >
                      Resolve
                    </Button>
                  </div>
                  {itemFeedback[c._id] && (
                    <ActionMessage
                      success={itemFeedback[c._id].type === 'success' ? itemFeedback[c._id].text : ''}
                      error={itemFeedback[c._id].type === 'error' ? itemFeedback[c._id].text : ''}
                    />
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Consultations;
