import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ rating, max = 5, size = 14, showValue = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}
          fill={i < Math.round(rating) ? '#FBBF24' : 'none'}
        />
      ))}
      {showValue && (
        <span className="text-sm font-700 text-slate-700 ml-1">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
