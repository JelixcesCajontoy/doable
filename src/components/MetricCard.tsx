import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

const MetricCard = ({ title, value, icon: Icon, description }: MetricCardProps) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg hover:animate-card-hover transition-all duration-300 border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{value}</p>
          <p className="text-sm text-gray-500 mt-2">{description}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;