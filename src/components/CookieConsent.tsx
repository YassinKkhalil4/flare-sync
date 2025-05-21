
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCookie, setCookie } from '@/utils/cookies';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if there's already a consent cookie
    const consent = getCookie('cookie-consent');
    if (!consent) {
      // Only show banner if consent hasn't been given yet
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

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            We use cookies to enhance your experience, improve functionality, and analyze website traffic. 
            By clicking "Accept", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={declineCookies}
          >
            Decline
          </Button>
          <Button
            size="sm"
            onClick={acceptCookies}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
