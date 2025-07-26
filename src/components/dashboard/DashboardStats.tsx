import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  Users, 
  UserCheck, 
  UserX, 
  FolderOpen, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import webhookService from "@/services/webhookService";

interface DashboardData {
  totalClients: number;
  validClients: number;
  spamClients: number;
  manualEntries: number;
  activeProjects: number;
  deliveredProjects: number;
  totalEarnings: number;
  totalCommunications: number;
}

export function DashboardStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardData>({
    totalClients: 0,
    validClients: 0,
    spamClients: 0,
    manualEntries: 0,
    activeProjects: 0,
    deliveredProjects: 0,
    totalEarnings: 0,
    totalCommunications: 0,
  });
  const [loading, setLoading] = useState(true);

  const handleStatClick = (filter: string) => {
    switch (filter) {
      case 'all':
        navigate('/clients');
        break;
      case 'valid':
        navigate('/clients?status=pending,active,delivered');
        break;
      case 'spam':
        navigate('/clients?status=spam');
        break;
      case 'manual':
        navigate('/clients?source=manual');
        break;
      case 'active':
        navigate('/clients?status=active');
        break;
      case 'delivered':
        navigate('/clients?status=delivered');
        break;
      case 'earnings':
        navigate('/earnings');
        break;
      case 'communications':
        navigate('/communications');
        break;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          clients,
          validation,
          activeProjects,
          deliveredProjects,
          earnings,
          preEmailComms,
          gmeetComms,
          brdComms
        ] = await Promise.all([
          webhookService.getAllClients(),
          webhookService.getValidationStatus(),
          webhookService.getActiveProjects(),
          webhookService.getDeliveredProjects(),
          webhookService.getEarnings(),
          webhookService.getPreEmailStatus(),
          webhookService.getGmeetStatus(),
          webhookService.getBrdStatus(),
        ]);

        // Calculate stats
        const totalClients = clients.length;
        const manualEntries = clients.filter(client => 
          client.manuallyAdded || client.addedBy === "Manually Added"
        ).length;
        
        // Validation stats - manually added clients are always valid
        const validationIds = new Set(validation.map(v => v.source_id || v.saved_id));
        const validatedClients = validation.filter(v => v.status === 'valid').length;
        const manualValidClients = clients.filter(client => 
          client.manuallyAdded || client.addedBy === "Manually Added"
        ).length;
        const validClients = validatedClients + manualValidClients;
        const spamClients = validation.filter(v => v.status === 'spam').length;
        
        // Project stats
        const activeCount = activeProjects.length;
        const deliveredCount = deliveredProjects.length;
        
        // Earnings total
        const totalEarningsAmount = earnings.reduce((sum, earning) => {
          return sum + (earning.amount || 0);
        }, 0);
        
        // Communications total
        const totalComms = preEmailComms.length + gmeetComms.length + brdComms.length;

        setStats({
          totalClients,
          validClients,
          spamClients,
          manualEntries,
          activeProjects: activeCount,
          deliveredProjects: deliveredCount,
          totalEarnings: totalEarningsAmount,
          totalCommunications: totalComms,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-accent/20 rounded mb-2"></div>
            <div className="h-8 bg-accent/20 rounded mb-2"></div>
            <div className="h-3 bg-accent/20 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => handleStatClick('all')} className="cursor-pointer">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            change="Real-time data"
            changeType="neutral"
            trend="up"
            icon={Users}
          />
        </div>
        <div onClick={() => handleStatClick('valid')} className="cursor-pointer">
          <StatsCard
            title="Valid Clients"
            value={stats.validClients.toString()}
            change="From validation API"
            changeType="positive"
            trend="up"
            icon={UserCheck}
          />
        </div>
        <div onClick={() => handleStatClick('spam')} className="cursor-pointer">
          <StatsCard
            title="Spam Detected"
            value={stats.spamClients.toString()}
            change="Filtered automatically"
            changeType="negative"
            trend="down"
            icon={UserX}
          />
        </div>
        <div onClick={() => handleStatClick('manual')} className="cursor-pointer">
          <StatsCard
            title="Manually Added Clients"
            value={stats.manualEntries.toString()}
            change="Added via manual form"
            changeType="positive"
            trend="up"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Project & Business Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div onClick={() => handleStatClick('active')} className="cursor-pointer">
          <StatsCard
            title="Active Projects"
            value={stats.activeProjects.toString()}
            change="Currently in progress"
            changeType="positive"
            trend="up"
            icon={FolderOpen}
          />
        </div>
        <div onClick={() => handleStatClick('delivered')} className="cursor-pointer">
          <StatsCard
            title="Delivered Projects"
            value={stats.deliveredProjects.toString()}
            change="Successfully completed"
            changeType="positive"
            trend="up"
            icon={CheckCircle}
          />
        </div>
        <div onClick={() => handleStatClick('earnings')} className="cursor-pointer">
          <StatsCard
            title="Total Earnings"
            value={formatCurrency(stats.totalEarnings)}
            change="Live earnings data"
            changeType="positive"
            trend="up"
            icon={DollarSign}
          />
        </div>
        <div onClick={() => handleStatClick('communications')} className="cursor-pointer">
          <StatsCard
            title="Communications"
            value={stats.totalCommunications.toString()}
            change="All message types"
            changeType="positive"
            trend="up"
            icon={MessageSquare}
          />
        </div>
      </div>
    </div>
  );
}