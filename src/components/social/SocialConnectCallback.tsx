
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

interface SocialConnectCallbackProps {
  platform?: string;
}

const SocialConnectCallback: React.FC<SocialConnectCallbackProps> = ({ platform }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState('Processing your connection...');
  
  const { handleCallback: handleInstagramCallback } = useInstagramConnect();
  const { handleCallback: handleTwitterCallback } = useTwitterConnect();
  const { handleCallback: handleTiktokCallback } = useTiktokConnect();
  const { handleCallback: handleYoutubeCallback } = useYoutubeConnect();
  const { handleCallback: handleTwitchCallback } = useTwitchConnect();

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        // Get current URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorReason = urlParams.get('error_reason') || urlParams.get('error_description');
        
        // Handle errors from OAuth provider
        if (error) {
          console.error('OAuth error:', error, errorReason);
          setStatus('Connection failed');
          toast({
            title: 'Connection failed',
            description: errorReason || 'Authentication was canceled or failed',
            variant: 'destructive',
          });
          
          // Redirect after a short delay
          setTimeout(() => navigate('/social-connect'), 2000);
          return;
        }
        
        // Verify we have the required data
        if (!code) {
          console.error('Missing authorization code');
          setStatus('Missing authorization data');
          toast({
            title: 'Connection failed',
            description: 'Missing authorization data',
            variant: 'destructive',
          });
          
          // Redirect after a short delay
          setTimeout(() => navigate('/social-connect'), 2000);
          return;
        }
        
        setStatus('Processing your connection...');
        
        // Determine the platform from URL or props
        const activePlatform = platform || localStorage.getItem('connecting_platform') || '';
        
        let result;
        // Call the appropriate handler based on the platform
        switch (activePlatform.toLowerCase()) {
          case 'instagram':
            result = await handleInstagramCallback(code);
            break;
          case 'twitter':
            result = await handleTwitterCallback(code);
            break;
          case 'tiktok':
            result = await handleTiktokCallback(code);
            break;
          case 'youtube':
            result = await handleYoutubeCallback(code);
            break;
          case 'twitch':
            result = await handleTwitchCallback(code);
            break;
          default:
            console.error('Unknown platform:', activePlatform);
            setStatus('Unknown social platform');
            toast({
              title: 'Connection failed',
              description: 'Unknown social platform',
              variant: 'destructive',
            });
            
            // Redirect after a short delay
            setTimeout(() => navigate('/social-connect'), 2000);
            return;
        }
        
        // Clear connecting platform from localStorage
        localStorage.removeItem('connecting_platform');
        
        setStatus('Connection successful!');
        // Redirect to social connect page
        setTimeout(() => navigate('/social-connect'), 1500);
      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('Connection failed');
        toast({
          title: 'Connection failed',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive',
        });
        
        // Redirect after a short delay
        setTimeout(() => navigate('/social-connect'), 2000);
      }
    };
    
    processOAuthCallback();
  }, [navigate, toast, platform, handleInstagramCallback, handleTwitterCallback, handleTiktokCallback, handleYoutubeCallback, handleTwitchCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 rounded-lg shadow-lg bg-card border border-border">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">{status}</h2>
        <p className="text-muted-foreground">Please wait while we complete your account connection...</p>
      </div>
    </div>
  );
};

export default SocialConnectCallback;
