import React, { forwardRef, useState } from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

const SearchBar = forwardRef(
  (
    {
      value = '',
      onChange,
      placeholder = 'Search…',
      className = '',
      ...rest
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = () => {
      onChange?.({ target: { value: '' } });
    };

    return (
      <div
        className={[
          'relative flex items-center',
          'w-full md:w-64 md:transition-all md:duration-300 md:ease-in-out',
          isFocused ? 'md:w-80' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Search Icon */}
        <HiMagnifyingGlass
          className={[
            'absolute left-3.5 w-4.5 h-4.5 pointer-events-none transition-colors duration-200',
            isFocused ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500',
          ].join(' ')}
          aria-hidden="true"
        />

        {/* Input */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={[
            'w-full pl-10 pr-9 py-2.5 text-sm text-gray-700 dark:text-slate-200',
            'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl',
            'placeholder:text-gray-400 dark:placeholder:slate-500',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500',
            'focus:bg-white dark:focus:bg-slate-900 focus:shadow-sm',
            'hover:border-gray-300 dark:hover:border-slate-600',
          ].join(' ')}
          {...rest}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={[
              'absolute right-2.5 p-1 rounded-lg',
              'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-200/60 dark:hover:bg-slate-750',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            ].join(' ')}
            aria-label="Clear search"
          >
            <HiXMark className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
