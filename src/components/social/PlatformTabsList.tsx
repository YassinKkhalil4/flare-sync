
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const platforms: Platform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: <Twitter className="h-5 w-5" />,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: <PlatformIcon platform="tiktok" className="h-5 w-5" />,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="h-5 w-5" />,
  },
  {
    id: 'twitch',
    name: 'Twitch',
    icon: <PlatformIcon platform="twitch" className="h-5 w-5" />,
  }
];

export const PlatformTabsList = () => {
  return (
    <TabsList className="grid grid-cols-5 mb-8">
      {platforms.map((platform) => (
        <TabsTrigger key={platform.id} value={platform.id} className="flex items-center gap-2">
          {platform.icon}
          <span className="hidden sm:inline">{platform.name}</span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
