import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const generatePageNumbers = (current, total, isMobile = false) => {
  const pages = [];
  const maxVisible = isMobile ? 3 : 5;

  if (total <= maxVisible + 2) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(2, current - halfVisible);
  let end = Math.min(total - 1, current + halfVisible);

  if (current <= halfVisible + 1) {
    end = Math.min(total - 1, maxVisible);
  }
  if (current >= total - halfVisible) {
    start = Math.max(2, total - maxVisible + 1);
  }

  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('...');

  pages.push(total);

  return pages;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  startIndex,
  endIndex,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const desktopPages = generatePageNumbers(currentPage, totalPages, false);
  const mobilePages = generatePageNumbers(currentPage, totalPages, true);

  const PageButton = ({ page, isMobileVisible = true }) => {
    if (page === '...') {
      return (
        <span
          className={[
            'flex items-center justify-center w-9 h-9 text-sm text-gray-400 dark:text-slate-550 select-none',
            isMobileVisible ? '' : 'hidden md:flex',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          …
        </span>
      );
    }

    const isActive = page === currentPage;

    return (
      <button
        onClick={() => onPageChange(page)}
        disabled={isActive}
        className={[
          'flex items-center justify-center w-9 h-9 text-sm font-medium rounded-xl',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
          isActive
            ? 'bg-primary-600 text-white shadow-md shadow-primary-600/25 cursor-default'
            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white',
          isMobileVisible ? '' : 'hidden md:flex',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={`Page ${page}`}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </button>
    );
  };

  return (
    <div
      className={[
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Pagination"
      role="navigation"
    >
      {/* Item count */}
      {totalItems != null && startIndex != null && endIndex != null && (
        <p className="text-sm text-gray-500 dark:text-slate-400 order-2 sm:order-1">
          Showing{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">{startIndex}</span>–
          <span className="font-medium text-gray-700 dark:text-slate-200">{endIndex}</span> of{' '}
          <span className="font-medium text-gray-700 dark:text-slate-200">{totalItems}</span>
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirst}
          className={[
            'flex items-center justify-center w-9 h-9 rounded-xl',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            isFirst
              ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Previous page"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        {/* Desktop page numbers */}
        <div className="hidden md:flex items-center gap-1">
          {desktopPages.map((page, i) => (
            <PageButton key={`d-${i}`} page={page} isMobileVisible={false} />
          ))}
        </div>

        {/* Mobile page numbers */}
        <div className="flex md:hidden items-center gap-1">
          {mobilePages.map((page, i) => (
            <PageButton key={`m-${i}`} page={page} isMobileVisible />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLast}
          className={[
            'flex items-center justify-center w-9 h-9 rounded-xl',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            isLast
              ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label="Next page"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
