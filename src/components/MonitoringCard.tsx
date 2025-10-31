import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MonitoringCardProps {
  icon: LucideIcon;
  title: string;
  score: number | string;
  status?: string;
  details: string;
  scoreColor?: string;
}

export const MonitoringCard = ({
  icon: Icon,
  title,
  score,
  status,
  details,
  scoreColor = "text-foreground",
}: MonitoringCardProps) => {
  return (
    <Card className="p-6 border-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent rounded-lg">
            <Icon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {status && (
              <span className="text-xs bg-warning text-warning-foreground px-2 py-0.5 rounded mt-1 inline-block">
                {status}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{details}</p>
    </Card>
  );
};
