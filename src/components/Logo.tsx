
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

interface LogoProps {
  variant?: 'default' | 'light';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-foreground';
  
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
        <Flame size={20} />
      </div>
      <span className={`font-bold text-xl ${textColor}`}>
        Flare<span className="text-secondary">Sync</span>
      </span>
    </Link>
  );
};

export default Logo;
