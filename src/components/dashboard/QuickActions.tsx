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
      const success = await webhookService.markAsActive(clientId);
      if (success) {
        toast({
          title: "Success",
          description: "Project marked as active.",
        });
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
      const success = await webhookService.markAsDelivered(clientId);
      if (success) {
        toast({
          title: "Success",
          description: "Project marked as delivered.",
        });
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
      let success = false;
      
      if (type === "Pre-email") {
        success = await webhookService.sendCommunication(clientId, "precall");
      } else if (type === "Gmeet Invite") {
        success = await webhookService.markGmeetSent(clientId);
      } else if (type === "BRD Email") {
        success = await webhookService.markBrdSent(clientId);
      }

      if (success) {
        toast({
          title: "Success",
          description: `${type} sent successfully.`,
        });
      } else {
        throw new Error(`Failed to send ${type}`);
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
      const success = await webhookService.addEarnings(clientId, parseFloat(earningAmount));
      if (success) {
        toast({
          title: "Success",
          description: "Earning recorded successfully.",
        });
        setIsEarningDialogOpen(false);
        setEarningAmount("");
      } else {
        throw new Error("Failed to record earning");
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