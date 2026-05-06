import { useEffect } from 'react';

export const useUnreadTitle = (unreadCount) => {
  useEffect(() => {
    const originalTitle = document.title.replace(/^\(\d+\)\s*/, ''); // Remove existing count
    
    if (unreadCount > 0) {
      document.title = `(${unreadCount > 99 ? '99+' : unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
    };
  }, [unreadCount]);
};