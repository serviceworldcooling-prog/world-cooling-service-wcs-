import clsx from 'clsx';
import { Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function Table<T extends { id: string }>({ columns, data, emptyMessage = 'No records found.' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-card">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80">
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : {}}
                className={clsx(
                  'px-5 py-3.5 text-[11px] font-800 text-slate-500 uppercase tracking-wider whitespace-nowrap select-none',
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Inbox size={22} />
                  </div>
                  <p className="text-xs font-700 text-slate-600">{emptyMessage}</p>
                  <p className="text-[11px] text-slate-400">Try adjusting your filters or search query.</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/80 transition-colors duration-150 group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      'px-5 py-3.5 text-xs text-slate-700 font-500',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    )}
                  >
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
