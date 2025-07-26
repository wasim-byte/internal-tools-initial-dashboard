import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import webhookService, { Client, EarningsEntry, CommunicationEntry } from "@/services/webhookService";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Play, 
  MessageSquare,
  RefreshCw,
  Download,
  MoreHorizontal,
  DollarSign,
  Calendar,
  Phone,
  Globe,
  Building,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Clock,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientWithStatus extends Client {
  isValid?: boolean;
  isActive?: boolean;
  isDelivered?: boolean;
  status: 'pending' | 'active' | 'delivered' | 'spam';
  earnings?: EarningsEntry;
  communications: {
    preEmail: boolean;
    gmeet: boolean;
    brd: boolean;
  };
}

export default function Clients() {
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState<ClientWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [selectedClient, setSelectedClient] = useState<ClientWithStatus | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const { toast } = useToast();

  // Handle URL params for filtering
  useEffect(() => {
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    
    if (status && ['pending', 'active', 'delivered', 'spam'].includes(status)) {
      setFilterStatus(status);
    }
    if (source && ['manual', 'automatic'].includes(source)) {
      setFilterSource(source);
    }
  }, [searchParams]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [allClients, validation, active, delivered, earnings, preEmail, gmeet, brd] = await Promise.all([
        webhookService.getAllClients(),
        webhookService.getValidationStatus(),
        webhookService.getActiveProjects(),
        webhookService.getDeliveredProjects(),
        webhookService.getEarnings(),
        webhookService.getPreEmailStatus(),
        webhookService.getGmeetStatus(),
        webhookService.getBrdStatus(),
      ]);

      // Create lookup sets for performance
      const validIds = new Set(validation.filter(v => v.status === 'valid').map(v => v.source_id));
      const activeIds = new Set(active.map(a => a.client_id));
      const deliveredIds = new Set(delivered.map(d => d.client_id));
      
      // Create communication lookups
      const preEmailIds = new Set(preEmail.map(p => p.client_id));
      const gmeetIds = new Set(gmeet.map(g => g.client_id));
      const brdIds = new Set(brd.map(b => b.client_id));

      // Enrich clients with status
      const enrichedClients: ClientWithStatus[] = allClients.map(client => {
        const isManuallyAdded = client.manuallyAdded || client.addedBy === "Manually Added";
        const isValid = validIds.has(client._id) || isManuallyAdded; // Manual clients are always valid
        const isActive = activeIds.has(client._id);
        const isDelivered = deliveredIds.has(client._id);
        const clientEarnings = earnings.find(e => e.client_id === client._id);
        
        let status: 'pending' | 'active' | 'delivered' | 'spam';
        if (!isValid && !isManuallyAdded) {
          status = 'spam';
        } else if (isDelivered) {
          status = 'delivered';
        } else if (isActive) {
          status = 'active';
        } else {
          status = 'pending';
        }

        return {
          ...client,
          isValid,
          isActive,
          isDelivered,
          status,
          earnings: clientEarnings,
          communications: {
            preEmail: preEmailIds.has(client._id),
            gmeet: gmeetIds.has(client._id),
            brd: brdIds.has(client._id),
          },
        };
      });

      setClients(enrichedClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch clients. Please check webhook connectivity.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const markAsActive = async (clientId: string) => {
    try {
      const success = await webhookService.markAsActive(clientId);
      if (success) {
        toast({
          title: "Success",
          description: "Project marked as active.",
        });
        fetchClients(); // Refresh data
      } else {
        throw new Error("Webhook request failed");
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
        fetchClients(); // Refresh data
      } else {
        throw new Error("Webhook request failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as delivered.",
        variant: "destructive",
      });
    }
  };

  const sendPreEmail = async (clientId: string) => {
    try {
      const success = await webhookService.sendCommunication(clientId, 'precall');
      if (success) {
        await webhookService.markPreEmailSent(clientId);
        toast({
          title: "Success",
          description: "Pre-email sent successfully.",
        });
      } else {
        throw new Error("Communication failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send pre-email.",
        variant: "destructive",
      });
    }
  };

  const sendGmeetInvite = async (clientId: string) => {
    try {
      const success = await webhookService.sendCommunication(clientId, 'googlemeet');
      if (success) {
        await webhookService.markGmeetSent(clientId);
        toast({
          title: "Success",
          description: "Google Meet invite sent successfully.",
        });
      } else {
        throw new Error("Communication failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send Google Meet invite.",
        variant: "destructive",
      });
    }
  };

  const sendBrdEmail = async (clientId: string) => {
    try {
      const success = await webhookService.sendCommunication(clientId, 'brd');
      if (success) {
        await webhookService.markBrdSent(clientId);
        toast({
          title: "Success",
          description: "BRD email sent successfully.",
        });
      } else {
        throw new Error("Communication failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send BRD email.",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = filterSource === "all" || 
      (filterSource === "manual" && (client.manuallyAdded || client.addedBy === "Manually Added")) ||
      (filterSource === "automatic" && !client.manuallyAdded && client.addedBy !== "Manually Added");
    
    const matchesStatus = filterStatus === "all" || client.status === filterStatus;
    
    return matchesSearch && matchesSource && matchesStatus;
  });

  const openClientDetails = (client: ClientWithStatus) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  const getSourceBadge = (client: ClientWithStatus) => {
    if (client.manuallyAdded || client.addedBy === "Manually Added") {
      return <Badge className="bg-accent/20 text-accent border-accent/30">Manual</Badge>;
    }
    return <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30">Automatic</Badge>;
  };

  const getStatusBadge = (client: ClientWithStatus) => {
    switch (client.status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Delivered</Badge>;
      case 'spam':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Spam</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <Users className="h-8 w-8" />
          All Clients
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage and view all clients in your CRM system
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass"
                />
              </div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="w-32 glass">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 glass">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={fetchClients}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            Clients ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No clients found matching your criteria.</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border/50 hover:border-accent/30 transition-all duration-200 hover-lift"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-button text-white">
                        {client.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-lg">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-muted-foreground">{client.company}</p>
                          {client.phone && (
                            <p className="text-xs text-muted-foreground">📞 {client.phone}</p>
                          )}
                          {client.website && (
                            <a 
                              href={client.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-accent hover:underline"
                            >
                              🌐 Website
                            </a>
                          )}
                        </div>
                        {client.description && (
                          <p className="text-xs text-muted-foreground italic mt-1">"{client.description}"</p>
                        )}
                        {client.companySummary && (
                          <p className="text-xs text-muted-foreground mt-1">Summary: {client.companySummary.slice(0, 100)}...</p>
                        )}
                        {(client.manuallyAdded || client.addedBy === "Manually Added") && (
                          <Badge className="mt-2 bg-warning/20 text-warning border-warning/30">
                            Manually Added
                          </Badge>
                        )}
                      {client.servicesNeeded && (Array.isArray(client.servicesNeeded) ? client.servicesNeeded.length > 0 : client.servicesNeeded !== '') && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(Array.isArray(client.servicesNeeded) ? client.servicesNeeded : [client.servicesNeeded])
                            .slice(0, 3)
                            .map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          {(Array.isArray(client.servicesNeeded) ? client.servicesNeeded.length : 1) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(Array.isArray(client.servicesNeeded) ? client.servicesNeeded.length : 1) - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                   <div className="flex items-center space-x-2">
                     <div className="text-right text-xs text-muted-foreground">
                       <div className="flex items-center gap-1">
                         ID: {client._id}
                         <CopyButton text={client._id} />
                       </div>
                       <div>{new Date(client.submittedAt).toLocaleDateString()}</div>
                       {client.earnings && (
                         <div className="text-green-400">${client.earnings.amount}</div>
                       )}
                     </div>
                    {getSourceBadge(client)}
                    {getStatusBadge(client)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass border-border/50">
                        <DropdownMenuItem onClick={() => openClientDetails(client)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {client.status === 'pending' && (
                          <DropdownMenuItem onClick={() => markAsActive(client._id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Mark as Active
                          </DropdownMenuItem>
                        )}
                        {client.status === 'active' && (
                          <DropdownMenuItem onClick={() => markAsDelivered(client._id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => sendPreEmail(client._id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Pre-email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sendGmeetInvite(client._id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Gmeet Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => sendBrdEmail(client._id)}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send BRD Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Details Modal */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent className="glass max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <User className="h-6 w-6" />
              Client Details
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm text-muted-foreground">Client ID</label>
                       <div className="flex items-center gap-2 font-mono text-sm bg-muted/20 p-2 rounded">
                         {selectedClient._id}
                         <CopyButton text={selectedClient._id} />
                       </div>
                     </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Name</label>
                      <p className="font-medium">{selectedClient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedClient.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedClient.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Company</label>
                      <p className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {selectedClient.company}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Website</label>
                      {selectedClient.website ? (
                        <a 
                          href={selectedClient.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          {selectedClient.website}
                        </a>
                      ) : (
                        <p>N/A</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Submitted At</label>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedClient.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Source</label>
                       <div className="flex items-center gap-2">
                        {(selectedClient.manuallyAdded || selectedClient.addedBy === "Manually Added") ? (
                          <>
                            <Badge className="bg-accent/20 text-accent border-accent/30">Manual</Badge>
                            {selectedClient.addedAt && (
                              <span className="text-xs text-muted-foreground">
                                Added: {new Date(selectedClient.addedAt).toLocaleDateString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30">Automatic</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedClient.description && (
                    <div>
                      <label className="text-sm text-muted-foreground">Description</label>
                      <p className="p-3 bg-muted/20 rounded-lg">{selectedClient.description}</p>
                    </div>
                  )}
                  
                  {selectedClient.servicesNeeded && (Array.isArray(selectedClient.servicesNeeded) ? selectedClient.servicesNeeded.length > 0 : selectedClient.servicesNeeded !== '') && (
                    <div>
                      <label className="text-sm text-muted-foreground">Services Needed</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(Array.isArray(selectedClient.servicesNeeded) ? selectedClient.servicesNeeded : [selectedClient.servicesNeeded]).map((service) => (
                          <Badge key={service} variant="outline">{service}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status & Project Info */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Status & Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Validation Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedClient.isValid ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">Valid</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">Spam</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Project Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedClient)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Earnings</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">
                          ${selectedClient.earnings?.amount || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communications */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span>Pre-call Email</span>
                      {selectedClient.communications.preEmail ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span>Google Meet</span>
                      {selectedClient.communications.gmeet ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span>BRD Email</span>
                      {selectedClient.communications.brd ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Summary */}
              {selectedClient.companySummary && (
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Company Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {selectedClient.companySummary}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}