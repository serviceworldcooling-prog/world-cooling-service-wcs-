'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
      
      {/* Search Input Box */}
      <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200/80 bg-white text-xs font-500 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-subtle"
          />
          {searchValue && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {filterOptions && onFilter && (
          <div className="relative shrink-0">
            <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filterValue}
              onChange={(e) => onFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl border border-slate-200/80 bg-white text-xs font-600 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 appearance-none cursor-pointer min-w-[130px] shadow-subtle"
            >
              <option value="">{filterLabel}: All</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Slot for Actions / Buttons */}
      {rightSlot && (
        <div className="flex items-center gap-2 shrink-0">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
