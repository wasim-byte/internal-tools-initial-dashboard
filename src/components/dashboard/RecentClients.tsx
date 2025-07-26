import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import webhookService, { Client } from "@/services/webhookService";

export function RecentClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentClients = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getAllClients();
      
      // Sort by submittedAt date (most recent first) and take first 5
      const recentClients = data
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
        .slice(0, 5);
      setClients(recentClients);
    } catch (error) {
      console.error("Error fetching recent clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentClients();
  }, []);

  const getSourceColor = (client: Client) => {
    return client.manuallyAdded 
      ? "bg-accent/20 text-accent border-accent/30"
      : "bg-secondary/20 text-secondary-foreground border-secondary/30";
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Clients
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4">
            {clients.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent clients found.</p>
            ) : (
              clients.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border/50 hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-button text-white">
                        {client.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                      <p className="text-xs text-muted-foreground">{client.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(client.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSourceColor(client)}>
                      {client.manuallyAdded ? "Manual" : "Automatic"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass border-border/50">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Mark as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Send Communication
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}