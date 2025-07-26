import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Plus, TrendingUp, Loader2 } from "lucide-react";
import webhookService from "@/services/webhookService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Earning {
  _id: string;
  client_id?: string;
  clientId?: string;
  amount: number;
  client_name?: string;
  company?: string;
  created_at?: string;
  submittedAt?: string;
}

export default function Earnings() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEarning, setNewEarning] = useState({
    client_id: "",
    amount: "",
  });
  const { toast } = useToast();

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getEarningsWithClientInfo();
      setEarnings(data);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch earnings data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEarning.client_id || !newEarning.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await webhookService.addEarnings(newEarning.client_id, parseFloat(newEarning.amount));
      
      if (success) {
        toast({
          title: "Success",
          description: "Earning recorded successfully.",
        });
        setIsDialogOpen(false);
        setNewEarning({ client_id: "", amount: "" });
        fetchEarnings();
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

  useEffect(() => {
    fetchEarnings();
  }, []);

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
  const averageEarning = earnings.length > 0 ? totalEarnings / earnings.length : 0;

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
          <DollarSign className="h-8 w-8" />
          Earnings Management
        </h1>
        <p className="text-muted-foreground text-lg">
          Track and manage project earnings and revenue
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold gradient-text">
                  ${totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-success/20">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-3xl font-bold gradient-text">{earnings.length}</p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average per Project</p>
                <p className="text-3xl font-bold gradient-text">
                  ${averageEarning.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-card rounded-lg border border-warning/20">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings List */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Earnings</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Earning
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50">
                <DialogHeader>
                  <DialogTitle>Record New Earning</DialogTitle>
                </DialogHeader>
                <form onSubmit={addEarning} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client ID *</Label>
                    <Input
                      id="client_id"
                      value={newEarning.client_id}
                      onChange={(e) => setNewEarning(prev => ({ ...prev, client_id: e.target.value }))}
                      required
                      className="glass"
                      placeholder="Enter client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newEarning.amount}
                      onChange={(e) => setNewEarning(prev => ({ ...prev, amount: e.target.value }))}
                      required
                      className="glass"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-button">
                      Record Earning
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No earnings recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-card border border-border/50 hover:border-accent/30 transition-all duration-200"
                >
                  <div>
                     <p className="font-medium">
                       {earning.client_name || `Client ID: ${earning.client_id || earning.clientId}`}
                     </p>
                    {earning.company && (
                      <p className="text-sm text-muted-foreground">{earning.company}</p>
                    )}
                    {earning.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-success">
                      ${earning.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}