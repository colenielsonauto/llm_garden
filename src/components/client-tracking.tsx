'use client'; // Make this a client component

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// This is the tracking function we'll use client-side
const trackPageView = (path: string) => {
  // Avoid tracking API routes or static assets if possible (though middleware handles auth)
  if (!path.startsWith('/api/')) {
      fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send minimal data, backend gets userId, IP, UserAgent
        body: JSON.stringify({ eventType: 'page_view', eventData: { path } }),
      }).catch(error => {
        console.warn('[Client Tracking] Failed to send page_view event to API:', error);
      });
  }
};

// A component to handle the tracking logic
export function ClientSideTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  return null; // This component doesn't render anything
} 