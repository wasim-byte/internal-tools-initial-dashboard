import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentClients } from "@/components/dashboard/RecentClients";
import { ProjectStatus } from "@/components/dashboard/ProjectStatus";
import { QuickActions } from "@/components/dashboard/QuickActions";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome to aXtr Labs CRM - Your command center for client management
        </p>
      </div>

      {/* Real Stats from Webhooks */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RecentClients />
          <ProjectStatus />
        </div>
        <div className="space-y-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}