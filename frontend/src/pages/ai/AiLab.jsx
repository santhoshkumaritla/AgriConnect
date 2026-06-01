import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const CROPS = ['Tomato', 'Potato', 'Rice', 'Corn', 'Cotton'];

const AiLab = () => {
  const [crop, setCrop] = useState('Tomato');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const analyze = async () => {
    if (!file) {
      setFeedback('Please upload a leaf image first.');
      return;
    }
    setLoading(true);
    setResult(null);
    setFeedback('');
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('crop', crop);
      const res = await api.post('/ai/predict', form);
      setResult(res.data);
      setFeedback('Analysis complete!');
    } catch {
      setFeedback('Analysis failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Lab"
        subtitle="Plant disease detection — placeholder for future CNN integration."
      />
      <Card className="space-y-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Mock API only. Future: MobileNetV2 + FastAPI + TensorFlow.
        </p>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Crop type
          <select
            className="rounded-lg border px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
        <Button onClick={analyze} disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze leaf image'}
        </Button>
        {feedback && (
          <p className={`text-sm ${result?.prediction ? 'text-brand-green' : 'text-red-600'}`}>
            {feedback}
          </p>
        )}
        {result?.prediction && (
          <div className="rounded-lg border border-brand-green/30 bg-brand-green/5 p-4 dark:border-brand-green/20">
            <p className="font-semibold">{result.prediction.disease}</p>
            <p className="text-sm text-slate-600">Crop: {result.prediction.crop}</p>
            <p className="text-sm">Confidence: {(result.prediction.confidence * 100).toFixed(0)}%</p>
            <p className="mt-2 text-sm">{result.prediction.treatment}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AiLab;
