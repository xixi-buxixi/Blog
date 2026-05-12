import { useState, useEffect } from 'react';
import { articleApi, type Article } from '../utils/api';
import ArticleCard from './ArticleCard';
import Pagination from './Pagination';

interface Props {
  page: number;
  pageSize: number;
  categoryId?: number;
}

function SkeletonCard() {
  return (
    <div className="block h-full">
      <article className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="h-4 w-10 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
          </div>
          <div className="h-6 sm:h-7 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3 w-3/4" />
          <div className="h-7 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse mb-3 w-1/2" />
          <div className="space-y-2 flex-1 mb-4">
            <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse w-2/3" />
          </div>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800/50 rounded-full animate-pulse" />
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ArticleList({ page, pageSize, categoryId }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    articleApi.getList({ page, pageSize, categoryId })
      .then(res => {
        if (!cancelled) {
          setArticles(res.data.records || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.pages || 1);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to fetch articles:', err);
          setError('Failed to load articles.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [page, pageSize, categoryId]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-5 w-20 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
        <p className="font-sans text-slate-500 dark:text-slate-400 text-lg">{error}</p>
      </div>
    );
  }

  const baseUrl = categoryId ? `/?category=${categoryId}` : '/';

  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-8">
        <h2 className="font-sans text-2xl font-bold text-slate-900 dark:text-white">
          Latest Articles
        </h2>
        <span className="text-slate-500 dark:text-slate-400 font-sans text-sm">{total} Posts</span>
      </div>

      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8">
              <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="font-sans text-slate-500 dark:text-slate-400 text-lg">No articles found.</p>
        </div>
      )}
    </div>
  );
}
