'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearch: (val: string) => void;
  placeholder?: string;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilter?: (val: string) => void;
  filterLabel?: string;
  rightSlot?: React.ReactNode;
}

export default function SearchFilter({
  searchValue, onSearch, placeholder = 'Search...', filterOptions,
  filterValue, onFilter, filterLabel = 'Filter', rightSlot
}: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Filter Dropdown */}
      {filterOptions && onFilter && (
        <div className="relative">
          <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterValue}
            onChange={(e) => onFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer min-w-[150px]"
          >
            <option value="">{filterLabel}: All</option>
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Right slot for buttons */}
      {rightSlot}
    </div>
  );
}
