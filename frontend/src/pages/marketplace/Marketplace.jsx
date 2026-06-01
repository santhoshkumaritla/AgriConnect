import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import useRolePath from '../../hooks/useRolePath';
import PageHeader from '../../components/PageHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import { imageUrl } from '../../utils/media';

const Marketplace = () => {
  const { rp } = useRolePath();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [organic, setOrganic] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, organic, minPrice, maxPrice, sort, page],
    queryFn: async () => {
      const { data: res } = await api.get('/products', {
        params: {
          search: search || undefined,
          category: category || undefined,
          organic: organic || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort,
          page,
          limit: 12,
        },
      });
      return res;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace" subtitle="Discover fresh produce directly from farmers." />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Input label="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <Input label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} />
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
          Organic
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={organic}
            onChange={(e) => { setOrganic(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            <option value="true">Organic only</option>
            <option value="false">Conventional</option>
          </select>
        </label>
        <Input label="Min ₹" type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
        <Input label="Max ₹" type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-200">
          Sort
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="popularity">Stock</option>
          </select>
        </label>
      </div>
      {isLoading ? (
        <p className="text-sm text-slate-500">Loading products...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {data?.items?.map((product) => (
              <Card key={product._id} className="space-y-3">
                {product.images?.[0] ? (
                  <img
                    src={imageUrl(product.images[0])}
                    alt={product.title}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-32 rounded-lg bg-slate-100 dark:bg-slate-800" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{product.title}</h3>
                  <p className="text-sm text-slate-500">{product.category}</p>
                  {product.organicStatus && (
                    <span className="text-xs font-medium text-brand-green">Organic</span>
                  )}
                </div>
                <p className="text-sm text-slate-600">₹{product.price} / kg · {product.quantity} kg left</p>
                <Link to={rp('marketplace', product._id)} className="text-sm font-semibold text-brand-green">
                  View Details →
                </Link>
              </Card>
            ))}
          </div>
          {data?.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {data.pages}
              </span>
              <Button variant="outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Marketplace;
