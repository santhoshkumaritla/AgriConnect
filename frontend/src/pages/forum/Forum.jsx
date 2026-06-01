import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ActionMessage from '../../components/ui/ActionMessage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import { getApiError } from '../../utils/apiError';

const Forum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [commentFeedback, setCommentFeedback] = useState({});
  const { register, handleSubmit, reset } = useForm();
  const postFeedback = useFormFeedback();

  const { data, isLoading } = useQuery({
    queryKey: ['forum'],
    queryFn: async () => {
      const res = await api.get('/forum');
      return res.data.posts || [];
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['forum'] });

  const createMutation = useMutation({
    mutationFn: (body) => api.post('/forum', body),
    onSuccess: (res) => {
      postFeedback.showSuccess(res.data?.message || 'Post published!');
      refresh();
      reset();
      setShowForm(false);
    },
    onError: (err) => postFeedback.showError(err, 'Could not publish post.'),
  });

  const likeMutation = useMutation({
    mutationFn: (id) => api.post(`/forum/${id}/like`),
    onSuccess: refresh,
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => api.post(`/forum/${id}/comment`, { text }),
    onSuccess: (_, { id }) => {
      setCommentFeedback((s) => ({ ...s, [id]: { type: 'success', text: 'Comment posted!' } }));
      setCommentText((s) => ({ ...s, [id]: '' }));
      refresh();
    },
    onError: (err, { id }) => {
      setCommentFeedback((s) => ({
        ...s,
        [id]: { type: 'error', text: getApiError(err, 'Could not post comment.') },
      }));
    },
  });

  const authorName = (author) => author?.name || 'User';

  const handleComment = (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) {
      setCommentFeedback((s) => ({
        ...s,
        [postId]: { type: 'error', text: 'Please enter a comment.' },
      }));
      return;
    }
    commentMutation.mutate({ id: postId, text });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Community Forum" subtitle="Posts and comments stored in the database." />
      {user && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'New Post'}</Button>
        </div>
      )}
      {showForm && (
        <Card>
          <form
            onSubmit={handleSubmit((v) => {
              postFeedback.clear();
              createMutation.mutate(v);
            })}
            className="space-y-4"
          >
            <Input label="Title" {...register('title', { required: true })} />
            <textarea
              className="w-full rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              rows={4}
              placeholder="Content"
              {...register('content', { required: true })}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
            <ActionMessage success={postFeedback.success} error={postFeedback.error} />
          </form>
        </Card>
      )}
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading posts...</p>
      ) : !data?.length ? (
        <p className="text-sm text-slate-500">No posts yet. Be the first to share!</p>
      ) : (
        <div className="grid gap-4">
          {data.map((post) => (
            <Card key={post._id}>
              <p className="text-xs text-slate-500">{authorName(post.authorId)} · {new Date(post.createdAt).toLocaleDateString()}</p>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">{post.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <button type="button" onClick={() => likeMutation.mutate(post._id)}>
                  ♥ {post.likes?.length || 0} likes
                </button>
                <button type="button" onClick={() => setExpanded(expanded === post._id ? null : post._id)}>
                  {post.comments?.length || 0} comments
                </button>
              </div>
              {expanded === post._id && (
                <div className="mt-4 space-y-3 border-t pt-3 dark:border-slate-800">
                  {post.comments?.map((c) => (
                    <div key={c._id} className="text-sm">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {authorName(c.userId)}: {c.text}
                      </p>
                      {c.replies?.map((r) => (
                        <p key={r._id} className="ml-4 mt-1 text-slate-500">
                          ↳ {authorName(r.userId)}: {r.text}
                        </p>
                      ))}
                    </div>
                  ))}
                  {user && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                          placeholder="Add a comment..."
                          value={commentText[post._id] || ''}
                          onChange={(e) => setCommentText((s) => ({ ...s, [post._id]: e.target.value }))}
                        />
                        <Button
                          variant="outline"
                          disabled={commentMutation.isPending}
                          onClick={() => handleComment(post._id)}
                        >
                          Post
                        </Button>
                      </div>
                      {commentFeedback[post._id] && (
                        <ActionMessage
                          success={commentFeedback[post._id].type === 'success' ? commentFeedback[post._id].text : ''}
                          error={commentFeedback[post._id].type === 'error' ? commentFeedback[post._id].text : ''}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forum;
