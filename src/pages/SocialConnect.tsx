
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import InstagramConnectCard from '@/components/social/InstagramConnectCard';
import ComingSoonCard from '@/components/social/ComingSoonCard';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';

const SocialConnect = () => {
  const { user } = useAuth();
  const {
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
  } = useInstagramConnect();

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12 flex justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your connected accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Connect Social Accounts</h1>
      <Separator className="mb-8" />
      
      <div className="grid gap-6">
        <InstagramConnectCard
          profile={instagramProfile}
          isConnected={isInstagramConnected}
          isConnecting={isConnecting}
          isSyncing={isSyncing}
          onConnect={initiateInstagramConnect}
          onDisconnect={disconnectInstagram}
          onSync={syncInstagramData}
        />
        
        <ComingSoonCard />
      </div>
    </div>
  );
};

export default SocialConnect;
