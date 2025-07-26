import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Save, Loader2 } from "lucide-react";

const services = [
  "AI Consulting",
  "AI Automation", 
  "Machine Learning",
  "Custom Development",
  "Data Analytics",
  "Computer Vision",
  "NLP",
  "Chatbot Development"
];

export default function AddClient() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    servicesNeeded: [] as string[],
    projectDescription: "",
    companySummary: ""
  });

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      servicesNeeded: checked 
        ? [...prev.servicesNeeded, service]
        : prev.servicesNeeded.filter(s => s !== service)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        description: formData.projectDescription,
        servicesNeeded: formData.servicesNeeded,
        companySummary: formData.companySummary,
        submittedAt: new Date().toISOString(),
        isManuallyAdded: true,
        addedBy: "Manually Added",
        currentDate: new Date().toISOString()
      };

      const response = await fetch("http://localhost:5678/webhook/859ddaa1-f80a-4ccf-9e66-7bb4d3c1d2eb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Client has been added successfully.",
        });
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          website: "",
          servicesNeeded: [],
          projectDescription: "",
          companySummary: ""
        });
      } else {
        throw new Error("Failed to add client");
      }
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
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
          <UserPlus className="h-8 w-8" />
          Add New Client
        </h1>
        <p className="text-muted-foreground text-lg">
          Manually add a new client to the CRM system
        </p>
      </div>

      <Card className="glass max-w-4xl">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="glass"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  required
                  className="glass"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="glass"
                placeholder="https://example.com"
              />
            </div>

            {/* Services Needed */}
            <div className="space-y-4">
              <Label>Services Needed</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.servicesNeeded.includes(service)}
                      onCheckedChange={(checked) => 
                        handleServiceChange(service, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={service}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                className="glass min-h-24"
                placeholder="Describe the project requirements..."
              />
            </div>

            {/* Company Summary */}
            <div className="space-y-2">
              <Label htmlFor="companySummary">Company Summary</Label>
              <Textarea
                id="companySummary"
                value={formData.companySummary}
                onChange={(e) => setFormData(prev => ({ ...prev, companySummary: e.target.value }))}
                className="glass min-h-24"
                placeholder="Brief description of the client's company..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Client...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Client
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}