
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

interface VirtualScrollListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: ({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => React.ReactElement;
  className?: string;
}

const VirtualScrollList = <T,>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}: VirtualScrollListProps<T>) => {
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={memoizedItems}
      >
        {renderItem}
      </List>
    </div>
  );
};

export default VirtualScrollList;
