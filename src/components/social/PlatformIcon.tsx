
import { Instagram, Link } from 'lucide-react';
import { TiktokIcon, TwitterIcon, YoutubeIcon, TwitchIcon } from './SocialIcons';

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'twitch';

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  size?: number;
}

export const PlatformIcon = ({ platform, className = "", size = 24 }: PlatformIconProps) => {
  switch (platform) {
    case 'instagram':
      return <Instagram className={className} size={size} />;
    case 'tiktok':
      return <TiktokIcon className={className} />;
    case 'twitter':
      return <TwitterIcon className={className} />;
    case 'youtube':
      return <YoutubeIcon className={className} />;
    case 'twitch':
      return <TwitchIcon className={className} />;
    default:
      return <Link className={className} size={size} />;
  }
};

export default PlatformIcon;
