import { StatCard } from '../StatCard';
import { Camera, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatCard
        title="Total Shoots"
        value={21}
        icon={Camera}
        description="All time"
        trend={{ value: '+3 this month', isPositive: true }}
      />
      <StatCard
        title="Scheduled"
        value={4}
        icon={Calendar}
        description="Upcoming shoots"
      />
      <StatCard
        title="In Planning"
        value={2}
        icon={Clock}
        description="Being organized"
      />
      <StatCard
        title="Completed"
        value={12}
        icon={CheckCircle2}
        description="This year"
        trend={{ value: '+2 this month', isPositive: true }}
      />
    </div>
  );
}
