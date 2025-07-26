import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import webhookService from "@/services/webhookService";

interface ProjectData {
  status: "pending" | "active" | "delivered" | "manual";
  count: number;
  percentage: number;
  change: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "active":
      return <AlertCircle className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "manual":
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-warning";
    case "active":
      return "text-accent";
    case "delivered":
      return "text-success";
    case "manual":
      return "text-accent";
    default:
      return "text-muted-foreground";
  }
};

const getProgressColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-warning";
    case "active":
      return "bg-accent";
    case "delivered":
      return "bg-success";
    case "manual":
      return "bg-accent";
    default:
      return "bg-muted";
  }
};

export function ProjectStatus() {
  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectStats = async () => {
      try {
        setLoading(true);
        const stats = await webhookService.getProjectStats();
        const total = stats.pending + stats.active + stats.delivered + stats.manual;
        
        const data: ProjectData[] = [
          {
            status: "pending",
            count: stats.pending,
            percentage: total > 0 ? Math.round((stats.pending / total) * 100) : 0,
            change: "Awaiting action",
          },
          {
            status: "active",
            count: stats.active,
            percentage: total > 0 ? Math.round((stats.active / total) * 100) : 0,
            change: "In progress",
          },
          {
            status: "delivered",
            count: stats.delivered,
            percentage: total > 0 ? Math.round((stats.delivered / total) * 100) : 0,
            change: "Completed",
          },
          {
            status: "manual",
            count: stats.manual,
            percentage: total > 0 ? Math.round((stats.manual / total) * 100) : 0,
            change: "Manually added",
          },
        ];
        
        setProjectData(data);
      } catch (error) {
        console.error("Error fetching project stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, []);

  const totalProjects = projectData.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Project Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Project Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projectData.map((project) => (
            <div key={project.status} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={getStatusColor(project.status)}>
                    {getStatusIcon(project.status)}
                  </span>
                  <span className="font-medium capitalize">
                    {project.status === "manual" ? "Manually Added" : project.status}
                  </span>
                  <Badge variant="outline" className="ml-2">
                    {project.count}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {project.change}
                </span>
              </div>
              <Progress 
                value={project.percentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{project.percentage}% of total</span>
                <span>{project.count}/{totalProjects} projects</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}