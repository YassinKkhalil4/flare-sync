
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  change?: {
    value: number;
    positive: boolean;
  };
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  description,
  icon,
  change,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && (
          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${change.positive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            {change.positive ? '↑' : '↓'} {Math.abs(change.value)}%
            {description && <span className="text-muted-foreground ml-1">{description}</span>}
          </p>
        )}
        {!change && description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
