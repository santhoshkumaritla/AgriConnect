import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';

const ARTICLES = [
  {
    category: 'Organic Farming',
    title: 'Transitioning to organic certification',
    summary: 'Steps for soil health, natural inputs, and certification timelines.',
  },
  {
    category: 'Pest Control',
    title: 'Integrated pest management basics',
    summary: 'Monitor thresholds, beneficial insects, and targeted treatments.',
  },
  {
    category: 'Irrigation',
    title: 'Drip irrigation layout guide',
    summary: 'Design zones, pressure regulation, and water scheduling.',
  },
  {
    category: 'Fertilizers',
    title: 'Balanced NPK for seasonal crops',
    summary: 'Soil testing, split applications, and micronutrients.',
  },
  {
    category: 'Smart Agriculture',
    title: 'IoT sensors for farm monitoring',
    summary: 'Moisture probes, weather stations, and dashboard alerts.',
  },
];

const EducationHub = () => (
  <div className="space-y-6">
    <PageHeader title="Education Hub" subtitle="Articles, guides, and best practices for modern farming." />
    <div className="grid gap-4 md:grid-cols-2">
      {ARTICLES.map((article) => (
        <Card key={article.title} className="space-y-2">
          <span className="text-xs font-semibold uppercase text-brand-earth">{article.category}</span>
          <h3 className="font-semibold text-slate-900 dark:text-white">{article.title}</h3>
          <p className="text-sm text-slate-500">{article.summary}</p>
          <p className="text-sm font-medium text-brand-green">Read more →</p>
        </Card>
      ))}
    </div>
    <Card>
      <h3 className="font-semibold">Video learning</h3>
      <p className="mt-2 text-sm text-slate-500">
        Curated video playlists for pest control, organic farming, and smart agriculture will be
        linked here. Integrate YouTube or hosted LMS in production.
      </p>
    </Card>
  </div>
);

export default EducationHub;
