import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, Video, FileText, Loader2, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import webhookService, { Client, CommunicationEntry } from "@/services/webhookService";

interface CommunicationWithClient extends CommunicationEntry {
  client?: Client;
}

export default function Communications() {
  const [preEmailComms, setPreEmailComms] = useState<CommunicationWithClient[]>([]);
  const [gmeetComms, setGmeetComms] = useState<CommunicationWithClient[]>([]);
  const [brdComms, setBrdComms] = useState<CommunicationWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState("");
  const [clientInfo, setClientInfo] = useState<Client | null>(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);
  const { toast } = useToast();

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      
      const [clients, preEmails, gmeets, brds] = await Promise.all([
        webhookService.getAllClients(),
        webhookService.getPreEmailStatus(),
        webhookService.getGmeetStatus(),
        webhookService.getBrdStatus(),
      ]);

      // Enrich communications with client data
      const enrichWithClientData = (comms: CommunicationEntry[]) => 
        comms.map(comm => ({
          ...comm,
          client: clients.find(c => c._id === comm.client_id)
        }));

      setPreEmailComms(enrichWithClientData(preEmails));
      setGmeetComms(enrichWithClientData(gmeets));
      setBrdComms(enrichWithClientData(brds));
    } catch (error) {
      console.error("Error fetching communications:", error);
      toast({
        title: "Error",
        description: "Failed to fetch communications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch client info when client ID changes
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (!clientId.trim()) {
        setClientInfo(null);
        return;
      }

      setLoadingClientInfo(true);
      try {
        const clients = await webhookService.getAllClients();
        const client = clients.find(c => c._id === clientId.trim());
        setClientInfo(client || null);
      } catch (error) {
        console.error("Error fetching client info:", error);
      } finally {
        setLoadingClientInfo(false);
      }
    };

    const debounceTimeout = setTimeout(fetchClientInfo, 500);
    return () => clearTimeout(debounceTimeout);
  }, [clientId]);

  const sendCommunication = async (type: 'precall' | 'gmeet' | 'brd') => {
    if (!clientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      let success = false;
      let typeName = "";
      
      if (type === "precall") {
        success = await webhookService.sendCommunication(clientId, "precall");
        typeName = "Pre-email";
      } else if (type === "gmeet") {
        success = await webhookService.markGmeetSent(clientId);
        typeName = "Google Meet invite";
      } else if (type === "brd") {
        success = await webhookService.markBrdSent(clientId);
        typeName = "BRD email";
      }

      if (success) {
        toast({
          title: "Success",
          description: `${typeName} sent successfully.`,
        });
        fetchCommunications(); // Refresh the data
        setClientId(""); // Clear the input
        setClientInfo(null);
      } else {
        throw new Error(`Failed to send ${typeName}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send communication.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const CommunicationCard = ({ comm }: { comm: CommunicationWithClient }) => (
    <Card className="glass hover-lift transition-all duration-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">{comm.client?.name || "Unknown Client"}</h3>
              <p className="text-sm text-muted-foreground">{comm.client?.email}</p>
              <p className="text-sm text-muted-foreground">{comm.client?.company}</p>
            </div>
            <Badge variant="outline" className="bg-accent/20 text-accent border-accent/30">
              ID: {comm.client_id}
            </Badge>
          </div>
          
          {comm.client?.phone && (
            <p className="text-xs text-muted-foreground">📞 {comm.client.phone}</p>
          )}
          
          {comm.client?.website && (
            <a 
              href={comm.client.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline block"
            >
              🌐 Visit Website
            </a>
          )}
          
          {comm.client && Array.isArray(comm.client.servicesNeeded) && comm.client.servicesNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {comm.client.servicesNeeded.slice(0, 3).map((service) => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
              {comm.client.servicesNeeded.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{comm.client.servicesNeeded.length - 3} more
                </Badge>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            {comm.sentAt ? `Sent: ${new Date(comm.sentAt).toLocaleString()}` : 
            comm.client?.submittedAt ? `Client submitted: ${new Date(comm.client.submittedAt).toLocaleDateString()}` : ""}
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

  const totalCommunications = preEmailComms.length + gmeetComms.length + brdComms.length;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Communications
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage client communications and track sent messages
        </p>
      </div>

      {/* Quick Send Section */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-accent" />
            Send Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comm-client-id">Client ID</Label>
            <Input
              id="comm-client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID..."
              className="glass"
            />
            
            {loadingClientInfo && (
              <div className="text-sm text-muted-foreground">Loading client info...</div>
            )}
            
            {clientInfo && (
              <div className="p-3 bg-muted/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{clientInfo.name}</span>
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    {clientInfo.manuallyAdded ? "Manual" : "Auto"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{clientInfo.email}</div>
                  <div>{clientInfo.company}</div>
                  {clientInfo.phone && <div>📞 {clientInfo.phone}</div>}
                </div>
              </div>
            )}
            
            {clientId.trim() && !loadingClientInfo && !clientInfo && (
              <div className="text-sm text-red-400">Client not found</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => sendCommunication("precall")}
              className="flex items-center gap-2 bg-gradient-button"
              disabled={!clientInfo}
            >
              <Mail className="h-4 w-4" />
              Send Pre-email
            </Button>
            <Button
              onClick={() => sendCommunication("gmeet")}
              className="flex items-center gap-2 bg-gradient-button"
              disabled={!clientInfo}
            >
              <Video className="h-4 w-4" />
              Send Google Meet
            </Button>
            <Button
              onClick={() => sendCommunication("brd")}
              className="flex items-center gap-2 bg-gradient-button"
              disabled={!clientInfo}
            >
              <FileText className="h-4 w-4" />
              Send BRD
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-3xl font-bold gradient-text">{totalCommunications}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pre-emails</p>
                <p className="text-3xl font-bold gradient-text">{preEmailComms.length}</p>
              </div>
              <Mail className="h-6 w-6 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gmeet Invites</p>
                <p className="text-3xl font-bold gradient-text">{gmeetComms.length}</p>
              </div>
              <Video className="h-6 w-6 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">BRD Emails</p>
                <p className="text-3xl font-bold gradient-text">{brdComms.length}</p>
              </div>
              <FileText className="h-6 w-6 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communications Tabs */}
      <Tabs defaultValue="pre-emails" className="space-y-6">
        <TabsList className="glass grid w-full grid-cols-3">
          <TabsTrigger value="pre-emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Pre-emails ({preEmailComms.length})
          </TabsTrigger>
          <TabsTrigger value="gmeet" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Gmeet Invites ({gmeetComms.length})
          </TabsTrigger>
          <TabsTrigger value="brd" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            BRD Emails ({brdComms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pre-emails">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-accent" />
                Pre-email Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preEmailComms.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pre-emails sent yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {preEmailComms.map((comm) => (
                    <CommunicationCard key={`pre-${comm._id}`} comm={comm} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmeet">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-warning" />
                Gmeet Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gmeetComms.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No Google Meet invites sent yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {gmeetComms.map((comm) => (
                    <CommunicationCard key={`gmeet-${comm._id}`} comm={comm} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brd">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-success" />
                BRD Email Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brdComms.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No BRD emails sent yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {brdComms.map((comm) => (
                    <CommunicationCard key={`brd-${comm._id}`} comm={comm} />
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