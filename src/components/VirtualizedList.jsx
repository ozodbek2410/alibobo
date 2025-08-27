import React, { useCallback, useRef, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';

/**
 * A virtualized list component that efficiently renders large datasets
 * Only renders items that are visible in the viewport to improve performance
 *
 * @param {Object} props Component props
 * @param {Array} props.items Array of items to render
 * @param {Function} props.renderItem Function to render each item (receives item and index)
 * @param {Number} props.itemHeight Height of each item in pixels
 * @param {Number} props.overscanCount Number of items to render outside of the visible area
 * @param {Function} props.onItemsRendered Callback when items are rendered (for pagination)
 * @param {Number} props.totalCount Total count of all items (for infinite scroll)
 */
const VirtualizedList = ({
  items,
  renderItem,
  itemHeight = 60,
  overscanCount = 5,
  onItemsRendered = null,
  totalCount = null,
  className = '',
  style = {},
  listHeight = 500
}) => {
  const listRef = useRef();

  // Throttled scroll handler for implementing infinite scroll
  const handleItemsRendered = useCallback(
    throttle(({ visibleStartIndex, visibleStopIndex }) => {
      if (onItemsRendered && totalCount) {
        // If we're close to the bottom and there are more items, trigger loading more
        const threshold = 10; // Load more when 10 items from the end
        if (visibleStopIndex + threshold >= items.length && items.length < totalCount) {
          onItemsRendered(visibleStartIndex, visibleStopIndex);
        }
      }
    }, 200), // Throttle to prevent excessive callbacks
    [items.length, totalCount, onItemsRendered]
  );

  // Reset scroll position when items change completely
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [items]);

  // Row renderer function that handles each item display
  const Row = useCallback(({ index, style }) => {
    const item = items[index];
    if (!item) return null;
    return <div style={style}>{renderItem(item, index)}</div>;
  }, [items, renderItem]);

  return (
    <div className={`virtualized-list-container ${className}`} style={{height: listHeight, ...style}}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={listRef}
            height={height || listHeight}
            width={width}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            onItemsRendered={handleItemsRendered}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

VirtualizedList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  overscanCount: PropTypes.number,
  onItemsRendered: PropTypes.func,
  totalCount: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  listHeight: PropTypes.number
};

export default React.memo(VirtualizedList);