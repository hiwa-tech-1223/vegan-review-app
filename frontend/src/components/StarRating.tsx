interface StarRatingProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ rating, showValue = false, size = 'md' }: StarRatingProps) {
  const sizes = {
    sm: { fontSize: '14px', gap: '1px' },
    md: { fontSize: '18px', gap: '2px' },
    lg: { fontSize: '24px', gap: '2px' },
  };

  const valueSizes = {
    sm: '12px',
    md: '14px',
    lg: '16px',
  };

  const { fontSize, gap } = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex', gap }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const fillPercentage = Math.min(Math.max(rating - (star - 1), 0), 1) * 100;
          return (
            <div
              key={star}
              style={{
                position: 'relative',
                display: 'inline-block',
                fontSize,
                lineHeight: 1,
              }}
            >
              <span style={{ color: '#ddd' }}>★</span>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  overflow: 'hidden',
                  width: `${fillPercentage}%`,
                  color: 'var(--accent)',
                }}
              >
                ★
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span style={{ fontSize: valueSizes[size], color: 'var(--text)' }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
