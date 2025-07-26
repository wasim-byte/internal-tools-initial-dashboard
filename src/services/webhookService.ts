/**
 * Webhook Service for n8n integration
 * Manages all webhook endpoints for the CRM system
 */

interface WebhookUrls {
  mainDatabase: string;
  validation: string;
  addClient: string;
  markActive: string;
  viewActive: string;
  markDelivered: string;
  viewDelivered: string;
  addEarnings: string;
  viewEarnings: string;
  mainCommunications: string;
  preEmail: string;
  viewPreEmail: string;
  gmeet: string;
  viewGmeet: string;
  brd: string;
  viewBrd: string;
}

const DEFAULT_WEBHOOK_URLS: WebhookUrls = {
  mainDatabase: "http://localhost:5678/webhook/69de402b-c5df-45f4-8c99-b2bd5f039180",
  validation: "http://localhost:5678/webhook/ce847b40-35cb-4f04-ad03-f9abb859d1e7",
  addClient: "http://localhost:5678/webhook/859ddaa1-f80a-4ccf-9e66-7bb4d3c1d2eb",
  markActive: "http://localhost:5678/webhook/6e9fdf45-074d-4d3c-8ff7-ec1f0f362e5f",
  viewActive: "http://localhost:5678/webhook/a7747199-9416-41a3-9f64-08fecc097c66",
  markDelivered: "http://localhost:5678/webhook/c7e5fb43-bf46-4f07-8f18-50a3be133d23",
  viewDelivered: "http://localhost:5678/webhook/b289847e-c275-4f2a-9243-b3c6e9a00478",
  addEarnings: "http://localhost:5678/webhook/8ad47ee4-2aeb-4332-8406-2a30459ee9e2",
  viewEarnings: "http://localhost:5678/webhook/8abc3a46-9543-48b8-85c2-ee47eb73dba8",
  mainCommunications: "http://localhost:5678/webhook/157c77be-9e01-4abb-821e-ee1bd376a330",
  preEmail: "http://localhost:5678/webhook/157c77be-9e01-4abb-821e-ee1bd376a330",
  viewPreEmail: "http://localhost:5678/webhook/9fb9503c-19f2-4987-8b33-fcabcb513b85",
  gmeet: "http://localhost:5678/webhook/157c77be-9e01-4abb-821e-ee1bd376a330",
  viewGmeet: "http://localhost:5678/webhook/9736912e-d79f-4789-8872-64662a173198",
  brd: "http://localhost:5678/webhook/157c77be-9e01-4abb-821e-ee1bd376a330",
  viewBrd: "http://localhost:5678/webhook/92bfff09-2507-4334-963e-ccf80ed74c21",
};

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  website?: string;
  description?: string;
  servicesNeeded: string[] | string;
  companySummary?: string;
  submittedAt: string;
  manuallyAdded?: boolean;
  addedBy?: string;
  addedAt?: string;
}

export interface ValidationEntry {
  _id: string;
  source_id: string;
  saved_id: string;
  status: "valid" | "spam";
  issues?: string[] | null;
}

export interface ProjectEntry {
  _id: string;
  client_id: string;
}

export interface EarningsEntry {
  _id: string;
  client_id?: string;
  clientId?: string;
  amount: number;
  submittedAt?: string;
}

export interface CommunicationEntry {
  _id: string;
  client_id: string;
  messageType?: string;
  sentAt?: string;
}

class WebhookService {
  private webhookUrls: WebhookUrls;

  constructor() {
    this.webhookUrls = this.loadWebhookUrls();
  }

  private loadWebhookUrls(): WebhookUrls {
    try {
      const stored = localStorage.getItem('webhookUrls');
      if (stored) {
        return { ...DEFAULT_WEBHOOK_URLS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load stored webhook URLs, using defaults');
    }
    return DEFAULT_WEBHOOK_URLS;
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T | null> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        return [] as T; // Return empty array for empty responses
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error(`Webhook request failed for ${url}:`, error);
      return null;
    }
  }

  // Main database operations
  async getAllClients(): Promise<Client[]> {
    const data = await this.makeRequest<Client[]>(this.webhookUrls.mainDatabase);
    return Array.isArray(data) ? data : [];
  }

  async addClient(clientData: Omit<Client, '_id'>): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.addClient, {
      method: 'POST',
      body: JSON.stringify({
        ...clientData,
        manuallyAdded: true,
        addedBy: "Manually Added",
        addedAt: new Date().toISOString(),
        currentDate: new Date().toISOString(),
      }),
    });
    return result !== null;
  }

  // Validation operations
  async getValidationStatus(): Promise<ValidationEntry[]> {
    const data = await this.makeRequest<ValidationEntry[]>(this.webhookUrls.validation);
    return Array.isArray(data) ? data : [];
  }

  async isClientValid(clientId: string): Promise<boolean> {
    const validationData = await this.getValidationStatus();
    const entry = validationData.find(v => v.source_id === clientId || v.saved_id === clientId);
    return entry?.status === 'valid';
  }

  // Project status operations
  async markAsActive(clientId: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.markActive, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    });
    return result !== null;
  }

  async getActiveProjects(): Promise<ProjectEntry[]> {
    const data = await this.makeRequest<ProjectEntry[]>(this.webhookUrls.viewActive);
    return Array.isArray(data) ? data : [];
  }

  async markAsDelivered(clientId: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.markDelivered, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId }),
    });
    return result !== null;
  }

  async getDeliveredProjects(): Promise<ProjectEntry[]> {
    const data = await this.makeRequest<ProjectEntry[]>(this.webhookUrls.viewDelivered);
    return Array.isArray(data) ? data : [];
  }

  // Earnings operations
  async addEarnings(clientId: string, amount: number): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.addEarnings, {
      method: 'POST',
      body: JSON.stringify({ client_id: clientId, amount }),
    });
    return result !== null;
  }

  async getEarnings(): Promise<EarningsEntry[]> {
    const data = await this.makeRequest<EarningsEntry[]>(this.webhookUrls.viewEarnings);
    return Array.isArray(data) ? data : [];
  }

  async getEarningsWithClientInfo(): Promise<(EarningsEntry & { client_name?: string; company?: string })[]> {
    const [earnings, clients] = await Promise.all([
      this.getEarnings(),
      this.getAllClients(),
    ]);

    return earnings.map(earning => {
      const clientId = earning.client_id || earning.clientId;
      const client = clients.find(c => c._id === clientId);
      return {
        ...earning,
        client_name: client?.name,
        company: client?.company,
      };
    });
  }

  // Communication operations
  async sendCommunication(clientId: string, messageType: 'precall' | 'googlemeet' | 'brd', message?: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.mainCommunications, {
      method: 'POST',
      body: JSON.stringify({
        messageType,
        clientId,
        message: message || `Send ${messageType} to client ID ${clientId}`,
      }),
    });
    return result !== null;
  }

  async markPreEmailSent(clientId: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.mainCommunications, {
      method: 'POST',
      body: JSON.stringify({ 
        messageType: 'precall',
        clientId,
        message: `Send precall to client ID ${clientId}`
      }),
    });
    return result !== null;
  }

  async getPreEmailStatus(): Promise<CommunicationEntry[]> {
    const data = await this.makeRequest<CommunicationEntry[]>(this.webhookUrls.viewPreEmail);
    return Array.isArray(data) ? data : [];
  }

  async markGmeetSent(clientId: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.mainCommunications, {
      method: 'POST',
      body: JSON.stringify({ 
        messageType: 'googlemeet',
        clientId,
        message: `Send googlemeet to client ID ${clientId}`
      }),
    });
    return result !== null;
  }

  async getGmeetStatus(): Promise<CommunicationEntry[]> {
    const data = await this.makeRequest<CommunicationEntry[]>(this.webhookUrls.viewGmeet);
    return Array.isArray(data) ? data : [];
  }

  async markBrdSent(clientId: string): Promise<boolean> {
    const result = await this.makeRequest(this.webhookUrls.mainCommunications, {
      method: 'POST',
      body: JSON.stringify({ 
        messageType: 'brd',
        clientId,
        message: `Send brd to client ID ${clientId}`
      }),
    });
    return result !== null;
  }

  async getBrdStatus(): Promise<CommunicationEntry[]> {
    const data = await this.makeRequest<CommunicationEntry[]>(this.webhookUrls.viewBrd);
    return Array.isArray(data) ? data : [];
  }

  // Utility methods
  async getClientWithStatus(clientId: string): Promise<Client & { 
    isValid: boolean; 
    isActive: boolean; 
    isDelivered: boolean; 
    earnings?: EarningsEntry;
    communications: {
      preEmail: boolean;
      gmeet: boolean;
      brd: boolean;
    };
  } | null> {
    const [clients, validation, active, delivered, earnings, preEmail, gmeet, brd] = await Promise.all([
      this.getAllClients(),
      this.getValidationStatus(),
      this.getActiveProjects(),
      this.getDeliveredProjects(),
      this.getEarnings(),
      this.getPreEmailStatus(),
      this.getGmeetStatus(),
      this.getBrdStatus(),
    ]);

    const client = clients.find(c => c._id === clientId);
    if (!client) return null;

    const validationEntry = validation.find(v => v.source_id === clientId || v.saved_id === clientId);
    const isValid = validationEntry?.status === 'valid';
    const isActive = active.some(a => a.client_id === clientId);
    const isDelivered = delivered.some(d => d.client_id === clientId);
    const clientEarnings = earnings.find(e => e.client_id === clientId || e.clientId === clientId);

    return {
      ...client,
      isValid,
      isActive,
      isDelivered,
      earnings: clientEarnings,
      communications: {
        preEmail: preEmail.some(p => p.client_id === clientId),
        gmeet: gmeet.some(g => g.client_id === clientId),
        brd: brd.some(b => b.client_id === clientId),
      },
    };
  }

  async getPendingClients(): Promise<Client[]> {
    const [clients, active, delivered] = await Promise.all([
      this.getAllClients(),
      this.getActiveProjects(),
      this.getDeliveredProjects(),
    ]);

    const activeIds = new Set(active.map(a => a.client_id));
    const deliveredIds = new Set(delivered.map(d => d.client_id));

    return clients.filter(client => 
      !activeIds.has(client._id) && !deliveredIds.has(client._id)
    );
  }

  async getManuallyAddedClients(): Promise<Client[]> {
    const clients = await this.getAllClients();
    return clients.filter(client => client.manuallyAdded === true);
  }

  async getProjectStats(): Promise<{
    pending: number;
    active: number;
    delivered: number;
    manual: number;
    totalEarnings: number;
  }> {
    const [clients, active, delivered, earnings] = await Promise.all([
      this.getAllClients(),
      this.getActiveProjects(),
      this.getDeliveredProjects(),
      this.getEarnings(),
    ]);

    const activeIds = new Set(active.map(a => a.client_id));
    const deliveredIds = new Set(delivered.map(d => d.client_id));
    const pendingClients = clients.filter(client => 
      !activeIds.has(client._id) && !deliveredIds.has(client._id)
    );
    const manualClients = clients.filter(client => client.manuallyAdded === true);
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    return {
      pending: pendingClients.length,
      active: active.length,
      delivered: delivered.length,
      manual: manualClients.length,
      totalEarnings,
    };
  }

  // Update webhook URLs
  updateWebhookUrls(newUrls: Partial<WebhookUrls>): void {
    this.webhookUrls = { ...this.webhookUrls, ...newUrls };
    localStorage.setItem('webhookUrls', JSON.stringify(this.webhookUrls));
  }

  getWebhookUrls(): WebhookUrls {
    return { ...this.webhookUrls };
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
export default webhookService;