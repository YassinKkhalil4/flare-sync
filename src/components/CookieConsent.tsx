
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCookie, setCookie, hasCookieConsent } from '@/utils/cookies';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only show banner once if consent hasn't been recorded yet
    const consent = getCookie('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookie('cookie-consent', 'accepted', 365);
    setShowBanner(false);
  };

  const declineCookies = () => {
    setCookie('cookie-consent', 'declined', 365);
    setShowBanner(false);
  };

  // Auto-accept after a brief delay to improve user experience
  useEffect(() => {
    if (showBanner) {
      // Auto-accept after 3 seconds if the user doesn't interact
      const timer = setTimeout(() => {
        acceptCookies();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            This site uses cookies to provide necessary site functionality.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="sm"
            onClick={acceptCookies}
            className="px-3 py-1 h-auto"
          >
            OK
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto"
            onClick={acceptCookies}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
