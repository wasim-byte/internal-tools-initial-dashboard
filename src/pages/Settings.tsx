import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import webhookService from "@/services/webhookService";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [webhookUrls, setWebhookUrls] = useState(webhookService.getWebhookUrls());
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Update webhook service with new URLs
      webhookService.updateWebhookUrls(webhookUrls);
      
      toast({
        title: "Settings saved",
        description: "Webhook URLs have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Configure webhook URLs and system preferences
        </p>
      </div>

      {/* Webhook Configuration */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="main-db">Main Database URL</Label>
              <Input
                id="main-db"
                value={webhookUrls.mainDatabase}
                onChange={(e) => setWebhookUrls(prev => ({ ...prev, mainDatabase: e.target.value }))}
                className="glass font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="validation">Validation URL</Label>
              <Input
                id="validation"
                value={webhookUrls.validation}
                onChange={(e) => setWebhookUrls(prev => ({ ...prev, validation: e.target.value }))}
                className="glass font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-client">Add Client URL</Label>
              <Input
                id="add-client"
                value={webhookUrls.addClient}
                onChange={(e) => setWebhookUrls(prev => ({ ...prev, addClient: e.target.value }))}
                className="glass font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mark-active">Mark Active URL</Label>
                <Input
                  id="mark-active"
                  value={webhookUrls.markActive}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, markActive: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-active">View Active URL</Label>
                <Input
                  id="view-active"
                  value={webhookUrls.viewActive}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewActive: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mark-delivered">Mark Delivered URL</Label>
                <Input
                  id="mark-delivered"
                  value={webhookUrls.markDelivered}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, markDelivered: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-delivered">View Delivered URL</Label>
                <Input
                  id="view-delivered"
                  value={webhookUrls.viewDelivered}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewDelivered: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-earnings">Add Earnings URL</Label>
                <Input
                  id="add-earnings"
                  value={webhookUrls.addEarnings}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, addEarnings: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-earnings">View Earnings URL</Label>
                <Input
                  id="view-earnings"
                  value={webhookUrls.viewEarnings}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewEarnings: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="main-communications">Main Communications URL</Label>
              <Input
                id="main-communications"
                value={webhookUrls.mainCommunications}
                onChange={(e) => setWebhookUrls(prev => ({ ...prev, mainCommunications: e.target.value }))}
                className="glass font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pre-email">Pre-Email Send URL</Label>
                <Input
                  id="pre-email"
                  value={webhookUrls.preEmail}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, preEmail: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmeet">Gmeet Send URL</Label>
                <Input
                  id="gmeet"
                  value={webhookUrls.gmeet}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, gmeet: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brd">BRD Send URL</Label>
                <Input
                  id="brd"
                  value={webhookUrls.brd}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, brd: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="view-pre-email">View Pre-Email URL</Label>
                <Input
                  id="view-pre-email"
                  value={webhookUrls.viewPreEmail}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewPreEmail: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-gmeet">View Gmeet URL</Label>
                <Input
                  id="view-gmeet"
                  value={webhookUrls.viewGmeet}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewGmeet: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="view-brd">View BRD URL</Label>
                <Input
                  id="view-brd"
                  value={webhookUrls.viewBrd}
                  onChange={(e) => setWebhookUrls(prev => ({ ...prev, viewBrd: e.target.value }))}
                  className="glass font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={saveSettings}
                disabled={loading}
                className="bg-gradient-button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Webhook URLs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark theme
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}