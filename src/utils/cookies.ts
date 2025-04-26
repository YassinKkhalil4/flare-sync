
export const setCookie = (name: string, value: string, days: number = 365) => {
  // Check if user has consented to cookies first
  const cookieConsent = getCookie('cookie-consent');
  if (!cookieConsent || cookieConsent === 'declined') {
    console.log('Cookie consent not granted');
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// New helper function to check cookie consent
export const hasCookieConsent = (): boolean => {
  const consent = getCookie('cookie-consent');
  return consent === 'accepted';
};
