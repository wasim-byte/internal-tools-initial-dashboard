import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, MessageSquare, Clock, CheckCircle, Loader2 } from "lucide-react";
import webhookService from "@/services/webhookService";

export default function Analytics() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalEarnings: 0,
    avgProjectValue: 0,
    activeProjects: 0,
    deliveredProjects: 0,
    manualClients: 0,
    totalCommunications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [projectStats, clients, earnings, preEmails, gmeet, brd] = await Promise.all([
          webhookService.getProjectStats(),
          webhookService.getAllClients(),
          webhookService.getEarnings(),
          webhookService.getPreEmailStatus(),
          webhookService.getGmeetStatus(),
          webhookService.getBrdStatus(),
        ]);

        const avgProjectValue = earnings.length > 0 ? projectStats.totalEarnings / earnings.length : 0;
        const totalCommunications = preEmails.length + gmeet.length + brd.length;

        setStats({
          totalClients: clients.length,
          totalEarnings: projectStats.totalEarnings,
          avgProjectValue: avgProjectValue,
          activeProjects: projectStats.active,
          deliveredProjects: projectStats.delivered,
          manualClients: projectStats.manual,
          totalCommunications: totalCommunications,
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const conversionRate = stats.totalClients > 0 ? ((stats.deliveredProjects / stats.totalClients) * 100) : 0;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <TrendingUp className="h-8 w-8" />
          Analytics
        </h1>
        <p className="text-muted-foreground text-lg">
          Real-time insights and performance metrics for your CRM
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                <p className="text-3xl font-bold gradient-text">{conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-success mt-1">Projects completed successfully</p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Project Value</p>
                <p className="text-3xl font-bold gradient-text">${stats.avgProjectValue.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">Per project revenue</p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-accent/20">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Communications</p>
                <p className="text-3xl font-bold gradient-text">{stats.totalCommunications}</p>
                <p className="text-xs text-success mt-1">Messages sent to clients</p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-warning/20">
                <MessageSquare className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-accent" />
                    <span>Total Clients</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stats.totalClients}</p>
                    <p className="text-xs text-muted-foreground">All clients</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Projects Delivered</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stats.deliveredProjects}</p>
                    <p className="text-xs text-success">Completed</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-warning" />
                    <span>Active Projects</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stats.activeProjects}</p>
                    <p className="text-xs text-warning">In progress</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-success" />
                    <span>Revenue Generated</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${stats.totalEarnings.toLocaleString()}</p>
                    <p className="text-xs text-success">Total earnings</p>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Projects</span>
                    <span>{stats.activeProjects}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-button`} style={{width: `${stats.totalClients > 0 ? (stats.activeProjects / stats.totalClients) * 100 : 0}%`}} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Delivered Projects</span>
                    <span>{stats.deliveredProjects}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-button`} style={{width: `${stats.totalClients > 0 ? (stats.deliveredProjects / stats.totalClients) * 100 : 0}%`}} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Manual Clients</span>
                    <span>{stats.manualClients}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-button`} style={{width: `${stats.totalClients > 0 ? (stats.manualClients / stats.totalClients) * 100 : 0}%`}} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Communications Sent</span>
                    <span>{stats.totalCommunications}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-button`} style={{width: `${stats.totalClients > 0 ? Math.min((stats.totalCommunications / stats.totalClients) * 100, 100) : 0}%`}} />
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-accent">Project Performance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {stats.deliveredProjects} projects completed successfully</li>
                <li>• Average project value: ${stats.avgProjectValue.toLocaleString()}</li>
                <li>• {stats.manualClients} clients added manually</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-accent">Communication Stats</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {stats.totalCommunications} total communications sent</li>
                <li>• Active project communication rate: {stats.activeProjects > 0 ? (stats.totalCommunications / stats.activeProjects).toFixed(1) : '0'} per project</li>
                <li>• Client engagement tracking system active</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}