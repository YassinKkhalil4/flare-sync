
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

interface SocialConnectCallbackProps {
  platform?: string;
}

const SocialConnectCallback: React.FC<SocialConnectCallbackProps> = ({ platform }: SocialConnectCallbackProps) => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
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
        // Detect platform from URL params or default logic
        const detectedPlatform = platform || searchParams.get('platform') || 'instagram';
        
        switch(detectedPlatform) {
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
            throw new Error(`Unknown platform: ${detectedPlatform}`);
        }
        
        setStatus('success');
        setMessage(`Successfully connected to ${detectedPlatform}`);
        
        // Redirect after success
        setTimeout(() => {
          window.location.href = '/social-connect';
        }, 3000);
      } catch (err) {
        console.error('Error during callback processing:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Connection failed');
      }
    };
    
    processCallback();
  }, [code, error, platform, searchParams, handleInstagramCallback, handleTwitterCallback, handleTiktokCallback, handleYoutubeCallback, handleTwitchCallback]);
  
  return (
    <div className="w-full flex justify-center items-center min-h-[400px] p-6">
      <div className="w-full max-w-md">
        {status === 'loading' && (
          <Alert>
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
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

export default SocialConnectCallback;
