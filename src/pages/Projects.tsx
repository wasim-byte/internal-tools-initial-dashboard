import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FolderOpen, CheckCircle, Clock, Play, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import webhookService, { Client } from "@/services/webhookService";

interface ProjectWithClient extends Client {
  status: "pending" | "active" | "delivered";
}

export default function Projects() {
  const [activeProjects, setActiveProjects] = useState<ProjectWithClient[]>([]);
  const [deliveredProjects, setDeliveredProjects] = useState<ProjectWithClient[]>([]);
  const [pendingProjects, setPendingProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [allClients, activeProjectIds, deliveredProjectIds] = await Promise.all([
        webhookService.getAllClients(),
        webhookService.getActiveProjects(),
        webhookService.getDeliveredProjects(),
      ]);

      // Create lookup sets
      const activeIds = new Set(activeProjectIds.map(p => p.client_id));
      const deliveredIds = new Set(deliveredProjectIds.map(p => p.client_id));

      // Categorize clients by project status
      const active: ProjectWithClient[] = [];
      const delivered: ProjectWithClient[] = [];
      const pending: ProjectWithClient[] = [];

      allClients.forEach(client => {
        if (deliveredIds.has(client._id)) {
          delivered.push({ ...client, status: 'delivered' });
        } else if (activeIds.has(client._id)) {
          active.push({ ...client, status: 'active' });
        } else {
          pending.push({ ...client, status: 'pending' });
        }
      });

      setActiveProjects(active);
      setDeliveredProjects(delivered);
      setPendingProjects(pending);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please check webhook connectivity.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsActive = async (clientId: string) => {
    try {
      const success = await webhookService.markAsActive(clientId);
      if (success) {
        toast({
          title: "Success",
          description: "Project marked as active.",
        });
        fetchProjects(); // Refresh the data
      } else {
        throw new Error("Failed to mark as active");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as active.",
        variant: "destructive",
      });
    }
  };

  const markAsDelivered = async (clientId: string) => {
    try {
      const success = await webhookService.markAsDelivered(clientId);
      if (success) {
        toast({
          title: "Success",
          description: "Project marked as delivered.",
        });
        fetchProjects(); // Refresh the data
      } else {
        throw new Error("Failed to mark as delivered");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as delivered.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const ProjectCard = ({ project, actionButton }: { 
    project: ProjectWithClient; 
    actionButton?: 'activate' | 'deliver' | null 
  }) => (
    <Card className="glass hover-lift transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{project.name}</h3>
              <Badge 
                className={
                  project.status === "active" 
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : project.status === "delivered"
                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }
              >
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{project.email}</p>
            <p className="text-sm text-muted-foreground">{project.company}</p>
            {project.phone && (
              <p className="text-xs text-muted-foreground">📞 {project.phone}</p>
            )}
            {project.website && (
              <a 
                href={project.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline block"
              >
                🌐 Visit Website
              </a>
            )}
            {Array.isArray(project.servicesNeeded) && project.servicesNeeded.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {project.servicesNeeded.slice(0, 2).map((service) => (
                  <Badge key={service} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {project.servicesNeeded.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{project.servicesNeeded.length - 2} more
                  </Badge>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Submitted: {new Date(project.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {actionButton === 'activate' && (
              <Button
                size="sm"
                onClick={() => markAsActive(project._id)}
                className="bg-gradient-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
            {actionButton === 'deliver' && (
              <Button
                size="sm"
                onClick={() => markAsDelivered(project._id)}
                className="bg-gradient-button"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Delivered
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <FolderOpen className="h-8 w-8" />
          Projects
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and track all project lifecycles
        </p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingProjects.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Active ({activeProjects.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Delivered ({deliveredProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending projects at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingProjects.map((project) => (
                    <ProjectCard 
                      key={`pending-${project._id}`} 
                      project={project} 
                      actionButton="activate"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-green-400" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No active projects at the moment.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeProjects.map((project) => (
                    <ProjectCard 
                      key={`active-${project._id}`} 
                      project={project} 
                      actionButton="deliver"
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                Delivered Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliveredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No delivered projects yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {deliveredProjects.map((project) => (
                    <ProjectCard 
                      key={`delivered-${project._id}`} 
                      project={project}
                      actionButton={null}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}