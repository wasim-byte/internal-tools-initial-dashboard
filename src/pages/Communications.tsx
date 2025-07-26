import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Mail, Video, FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Communication {
  client_id: string;
  status: string;
  created_at?: string;
  client_name?: string;
  company?: string;
}

export default function Communications() {
  const [preEmails, setPreEmails] = useState<Communication[]>([]);
  const [gmeetInvites, setGmeetInvites] = useState<Communication[]>([]);
  const [brdEmails, setBrdEmails] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      
      // Check if we're in development or if webhooks are accessible
      const isLocalhost = window.location.hostname === 'localhost';
      const baseUrl = isLocalhost ? "http://localhost:5678" : "";
      
      if (!baseUrl && !isLocalhost) {
        // For production, we need proper webhook URLs or API endpoints
        console.warn("Webhook endpoints not configured for production environment");
        setPreEmails([]);
        setGmeetInvites([]);
        setBrdEmails([]);
        toast({
          title: "Configuration Required",
          description: "Communication webhooks need to be configured for this environment.",
          variant: "destructive",
        });
        return;
      }

      // Fetch Pre-emails with better error handling
      try {
        const preEmailResponse = await fetch(`${baseUrl}/webhook/9fb9503c-19f2-4987-8b33-fcabcb513b85`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (preEmailResponse.ok) {
          const text = await preEmailResponse.text();
          if (text.trim()) {
            const preEmailData = JSON.parse(text);
            setPreEmails(Array.isArray(preEmailData) ? preEmailData : []);
          } else {
            setPreEmails([]);
          }
        } else {
          console.warn("Pre-email webhook failed:", preEmailResponse.status);
          setPreEmails([]);
        }
      } catch (error) {
        console.error("Pre-email fetch error:", error);
        setPreEmails([]);
      }

      // Fetch Gmeet invites with better error handling
      try {
        const gmeetResponse = await fetch(`${baseUrl}/webhook/9736912e-d79f-4789-8872-64662a173198`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (gmeetResponse.ok) {
          const text = await gmeetResponse.text();
          if (text.trim()) {
            const gmeetData = JSON.parse(text);
            setGmeetInvites(Array.isArray(gmeetData) ? gmeetData : []);
          } else {
            setGmeetInvites([]);
          }
        } else {
          console.warn("Gmeet webhook failed:", gmeetResponse.status);
          setGmeetInvites([]);
        }
      } catch (error) {
        console.error("Gmeet fetch error:", error);
        setGmeetInvites([]);
      }

      // Fetch BRD emails with better error handling
      try {
        const brdResponse = await fetch(`${baseUrl}/webhook/92bfff09-2507-4334-963e-ccf80ed74c21`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (brdResponse.ok) {
          const text = await brdResponse.text();
          if (text.trim()) {
            const brdData = JSON.parse(text);
            setBrdEmails(Array.isArray(brdData) ? brdData : []);
          } else {
            setBrdEmails([]);
          }
        } else {
          console.warn("BRD webhook failed:", brdResponse.status);
          setBrdEmails([]);
        }
      } catch (error) {
        console.error("BRD fetch error:", error);
        setBrdEmails([]);
      }

    } catch (error) {
      console.error("Error fetching communications:", error);
      toast({
        title: "Error", 
        description: "Failed to fetch communications data. Please check your network connection and webhook configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, []);

  const CommunicationCard = ({ communication, type }: { communication: Communication; type: string }) => {
    const getIcon = () => {
      switch (type) {
        case "pre-email":
          return <Mail className="h-4 w-4" />;
        case "gmeet":
          return <Video className="h-4 w-4" />;
        case "brd":
          return <FileText className="h-4 w-4" />;
        default:
          return <MessageSquare className="h-4 w-4" />;
      }
    };

    const getTypeColor = () => {
      switch (type) {
        case "pre-email":
          return "bg-accent/20 text-accent border-accent/30";
        case "gmeet":
          return "bg-warning/20 text-warning border-warning/30";
        case "brd":
          return "bg-success/20 text-success border-success/30";
        default:
          return "bg-muted/20 text-muted-foreground border-muted/30";
      }
    };

    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border/50 hover:border-accent/30 transition-all duration-200">
        <div className="flex items-center space-x-4">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {getIcon()}
          </div>
          <div>
            <p className="font-medium">
              {communication.client_name || `Client ID: ${communication.client_id}`}
            </p>
            {communication.company && (
              <p className="text-sm text-muted-foreground">{communication.company}</p>
            )}
            <p className="text-sm text-muted-foreground">{communication.status}</p>
          </div>
        </div>
        <div className="text-right">
          {communication.created_at && (
            <p className="text-xs text-muted-foreground">
              {new Date(communication.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const totalCommunications = preEmails.length + gmeetInvites.length + brdEmails.length;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Communications
        </h1>
        <p className="text-muted-foreground text-lg">
          Track and manage all client communications
        </p>
      </div>

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
                <p className="text-3xl font-bold gradient-text">{preEmails.length}</p>
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
                <p className="text-3xl font-bold gradient-text">{gmeetInvites.length}</p>
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
                <p className="text-3xl font-bold gradient-text">{brdEmails.length}</p>
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
            Pre-emails ({preEmails.length})
          </TabsTrigger>
          <TabsTrigger value="gmeet" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Gmeet Invites ({gmeetInvites.length})
          </TabsTrigger>
          <TabsTrigger value="brd" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            BRD Emails ({brdEmails.length})
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
              {preEmails.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pre-emails sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {preEmails.map((comm, index) => (
                    <CommunicationCard key={index} communication={comm} type="pre-email" />
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
              {gmeetInvites.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No Gmeet invites sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gmeetInvites.map((comm, index) => (
                    <CommunicationCard key={index} communication={comm} type="gmeet" />
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
              {brdEmails.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No BRD emails sent yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {brdEmails.map((comm, index) => (
                    <CommunicationCard key={index} communication={comm} type="brd" />
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