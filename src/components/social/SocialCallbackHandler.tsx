
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

const SocialCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your connection...');
  
  // Get platform-specific callback handlers
  const { handleCallback: handleInstagramCallback } = useInstagramConnect();
  const { handleCallback: handleTwitterCallback } = useTwitterConnect();
  const { handleCallback: handleTiktokCallback } = useTiktokConnect();
  const { handleCallback: handleYoutubeCallback } = useYoutubeConnect();
  const { handleCallback: handleTwitchCallback } = useTwitchConnect();
  
  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const platform = searchParams.get('platform') || 'instagram'; // Default platform
      
      if (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error}`);
        return;
      }
      
      if (!code) {
        setStatus('error');
        setMessage('No authorization code provided');
        return;
      }
      
      try {
        switch(platform) {
          case 'instagram':
            await handleInstagramCallback(code);
            break;
          case 'twitter':
            await handleTwitterCallback(code);
            break;
          case 'tiktok':
            await handleTiktokCallback(code);
            break;
          case 'youtube':
            await handleYoutubeCallback(code);
            break;
          case 'twitch':
            await handleTwitchCallback(code);
            break;
          default:
            throw new Error(`Unknown platform: ${platform}`);
        }
        
        setStatus('success');
        setMessage(`Successfully connected to ${platform}`);
        
        // Redirect back to social connect page after success
        setTimeout(() => {
          navigate('/social-connect');
        }, 3000);
      } catch (err) {
        console.error('Error during callback processing:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Connection failed');
      }
    };
    
    processCallback();
  }, [searchParams, navigate, handleInstagramCallback, handleTwitterCallback, handleTiktokCallback, handleYoutubeCallback, handleTwitchCallback]);
  
  return (
    <div className="w-full flex justify-center items-center min-h-[400px] p-6">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <Alert>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <AlertTitle>Processing</AlertTitle>
            </div>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-600">Success</AlertTitle>
            </div>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SocialCallbackHandler;
