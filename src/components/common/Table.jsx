import React from 'react';

const SkeletonRow = ({ columns }) => (
  <tr className="animate-pulse">
    {columns.map((col, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded-lg bg-gray-200 dark:bg-slate-700 w-3/4" />
      </td>
    ))}
  </tr>
);

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  return (
    <div
      className={[
        'w-full rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card dark:shadow-black/20 overflow-hidden transition-colors duration-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Head */}
          <thead>
            <tr className="bg-gray-50/80 dark:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 transition-colors">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50 transition-colors">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} columns={columns} />
                ))
              : data.length > 0
              ? data.map((row, rowIndex) => (
                  <tr
                    key={row.id ?? rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'transition-colors duration-150',
                      'hover:bg-primary-50/40 dark:hover:bg-slate-800/40',
                      rowIndex % 2 === 1
                        ? 'bg-gray-50/30 dark:bg-slate-850/20'
                        : 'bg-white dark:bg-slate-900',
                      onRowClick ? 'cursor-pointer' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap"
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
