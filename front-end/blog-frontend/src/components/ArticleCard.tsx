import type { Article } from '../utils/api';

interface Props {
  article: Article;
  index?: number;
}

export default function ArticleCard({ article, index = 0 }: Props) {
  return (
    <a href={`/article/${article.id}`} className="block h-full group">
      <article className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:shadow-md">
        <div className="p-5 sm:p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-sans font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {article.categoryName || 'Engineering'}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-sans flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              {article.viewCount || 0}
            </span>
          </div>
          <h3 className="font-sans text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
            {article.title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 flex-1 line-clamp-3 font-serif leading-relaxed">
            {article.summary || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-sans font-medium uppercase tracking-wider">
              {new Date(article.createTime || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <span className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-slate-400 dark:text-slate-500 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}
