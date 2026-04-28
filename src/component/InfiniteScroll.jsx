import React, { useEffect, useRef, useCallback } from 'react';

const InfiniteScroll = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
  className = "",
}) => {
  const containerRef = useRef(null);
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || loading || !hasMore || loadingRef.current) return;

    // Check if scrolled near the top (for loading older messages)
    if (container.scrollTop <= threshold) {
      loadingRef.current = true;
      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;

      onLoadMore().finally(() => {
        // Maintain scroll position after loading new content
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeight;
            container.scrollTop = previousScrollTop + heightDifference;
          }
          loadingRef.current = false;
        });
      });
    }
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ height: '100%' }}
    >
      {/* Loading indicator at top */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-surface-400">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading messages...</span>
          </div>
        </div>
      )}
      
      {/* Messages */}
      {children}
      
      {/* End of messages indicator */}
      {!hasMore && (
        <div className="flex justify-center py-4">
          <span className="text-surface-500 text-sm">
            You've reached the beginning of the conversation
          </span>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;