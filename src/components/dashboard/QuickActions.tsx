import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import webhookService, { Client } from "@/services/webhookService";
import { 
  Zap, 
  Play, 
  CheckCircle, 
  Mail, 
  Video, 
  FileText, 
  DollarSign
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuickActions() {
  const [clientId, setClientId] = useState("");
  const [earningAmount, setEarningAmount] = useState("");
  const [isEarningDialogOpen, setIsEarningDialogOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState<Client | null>(null);
  const [loadingClientInfo, setLoadingClientInfo] = useState(false);
  const { toast } = useToast();

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


  const markAsActive = async () => {
    if (!clientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/webhook/6e9fdf45-074d-4d3c-8ff7-ec1f0f362e5f", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project marked as active.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as active.",
        variant: "destructive",
      });
    }
  };

  const markAsDelivered = async () => {
    if (!clientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/webhook/c7e5fb43-bf46-4f07-8f18-50a3be133d23", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Project marked as delivered.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark project as delivered.",
        variant: "destructive",
      });
    }
  };

  const sendCommunication = async (type: string) => {
    if (!clientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a client ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const messageType = type === "Pre-email" ? "precall" : type === "Gmeet Invite" ? "googlemeet" : "brd";
      const response = await fetch("http://localhost:5678/webhook/157c77be-9e01-4abb-821e-ee1bd376a330", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageType,
          clientId,
          message: `Send ${type} to client ID ${clientId}`
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `${type} sent successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to send ${type}.`,
        variant: "destructive",
      });
    }
  };

  const addEarning = async () => {
    if (!clientId.trim() || !earningAmount.trim()) {
      toast({
        title: "Error",
        description: "Please enter both client ID and earning amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/webhook/8ad47ee4-2aeb-4332-8406-2a30459ee9e2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          amount: parseFloat(earningAmount),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Earning recorded successfully.",
        });
        setIsEarningDialogOpen(false);
        setEarningAmount("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record earning.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client ID Input */}
        <div className="space-y-2">
          <Label htmlFor="client-id">Client ID</Label>
          <Input
            id="client-id"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Enter client ID..."
            className="glass"
          />
          
          {/* Client Info Display */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={markAsActive}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Mark Active
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={markAsDelivered}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark Delivered
          </Button>

          <Dialog open={isEarningDialogOpen} onOpenChange={setIsEarningDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Add Earning
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle>Record Earning</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="earning-amount">Amount ($)</Label>
                  <Input
                    id="earning-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={earningAmount}
                    onChange={(e) => setEarningAmount(e.target.value)}
                    placeholder="0.00"
                    className="glass"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEarningDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addEarning} className="bg-gradient-button">
                    Record Earning
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Communication Actions */}
        <div className="border-t border-border/50 pt-4">
          <Label className="text-sm font-medium">Send Communications</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendCommunication("Pre-email")}
              className="flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Pre-email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => sendCommunication("Gmeet Invite")}
              className="flex items-center gap-1"
            >
              <Video className="h-3 w-3" />
              Gmeet
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => sendCommunication("BRD Email")}
              className="flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              BRD
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}