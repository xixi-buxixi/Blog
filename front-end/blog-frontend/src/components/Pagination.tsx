import { useMemo } from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: Props) {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  const buildUrl = (page: number) => {
    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('page', String(page));
    return url.pathname + url.search;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center space-x-4 font-mono" aria-label="分页导航">
      {currentPage > 1 ? (
        <a
          href={buildUrl(currentPage - 1)}
          className="flex items-center px-4 py-2 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          PREV
        </a>
      ) : (
        <span className="flex items-center px-4 py-2 text-sm text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 rounded-xl cursor-not-allowed">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          PREV
        </span>
      )}

      <div className="hidden sm:flex items-center space-x-2">
        {pageNumbers.map((page, i) =>
          typeof page === 'number' ? (
            <a
              key={i}
              href={buildUrl(page)}
              className={`w-10 h-10 flex items-center justify-center text-sm rounded-xl border transition-colors ${
                page === currentPage
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </a>
          ) : (
            <span key={i} className="px-2 py-2 text-slate-400 dark:text-slate-500">...</span>
          )
        )}
      </div>

      <span className="sm:hidden px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
        {currentPage} / {totalPages}
      </span>

      {currentPage < totalPages ? (
        <a
          href={buildUrl(currentPage + 1)}
          className="flex items-center px-4 py-2 text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          NEXT
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      ) : (
        <span className="flex items-center px-4 py-2 text-sm text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800 rounded-xl cursor-not-allowed">
          NEXT
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
