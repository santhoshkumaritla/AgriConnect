import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { imageUrl } from '../../utils/media';
import ActionMessage from '../../components/ui/ActionMessage';
import { useFormFeedback } from '../../hooks/useFormFeedback';

const FarmProfile = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const feedback = useFormFeedback();

  const { data: farm, isLoading } = useQuery({
    queryKey: ['my-farm'],
    queryFn: async () => {
      const res = await api.get('/farms/me');
      return res.data.farm;
    },
  });

  useEffect(() => {
    if (farm) {
      reset({
        farmName: farm.farmName || '',
        location: farm.location || '',
        area: farm.area || '',
        soilType: farm.soilType || '',
      });
    }
  }, [farm, reset]);

  const mutation = useMutation({
    mutationFn: async (values) => {
      const form = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v) form.append(k, v);
      });
      const fileInput = document.getElementById('farm-images');
      if (fileInput?.files?.length) {
        Array.from(fileInput.files).forEach((f) => form.append('images', f));
      }
      return api.put('/farms/me', form);
    },
    onSuccess: () => {
      feedback.showSuccess('Farm profile saved!');
      queryClient.invalidateQueries({ queryKey: ['my-farm'] });
    },
    onError: (err) => feedback.showError(err, 'Failed to save farm profile'),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading farm details...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="Farm profile" subtitle="Add farm details and upload images." />
      <Card className="max-w-xl space-y-4">
        {farm?.images?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {farm.images.map((img) => (
              <img
                key={img}
                src={imageUrl(img)}
                alt=""
                className="h-24 w-24 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <Input label="Farm name" {...register('farmName', { required: true })} />
          <Input label="Location" {...register('location')} />
          <Input label="Area (acres)" type="number" {...register('area')} />
          <Input label="Soil type" {...register('soilType')} />
          <Input label="Farm images" id="farm-images" type="file" multiple accept="image/*" />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save farm'}
          </Button>
          <ActionMessage success={feedback.success} error={feedback.error} />
        </form>
      </Card>
    </div>
  );
};

export default FarmProfile;
