import { useState, useMemo } from 'react';

const useSearch = (items = [], searchFields = []) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase().trim();

    return items.filter((item) => {
      return searchFields.some((field) => {
        // Handle nested fields if any, e.g. "customer.fullName" (optional helper)
        const value = field.split('.').reduce((acc, curr) => {
          return acc ? acc[curr] : undefined;
        }, item);

        if (value === undefined || value === null) return false;
        return String(value).toLowerCase().includes(query);
      });
    });
  }, [items, searchFields, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
  };
};

export default useSearch;
