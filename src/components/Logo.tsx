
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'default' | 'light';
}

const Logo: React.FC<LogoProps> = ({ variant = 'default' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-foreground';
  
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex items-center justify-center h-8 w-8">
        <img 
          src="/lovable-uploads/b9ed3f54-ea3d-4c31-b542-9535b274fa3d.png" 
          alt="FlareSync Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      <span className={`font-bold text-xl ${textColor}`}>
        Flare<span className="text-secondary">Sync</span>
      </span>
    </Link>
  );
};

export default Logo;
