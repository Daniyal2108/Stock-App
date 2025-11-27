import { apiRequest } from './apiClient';

export interface Alert {
  _id?: string;
  id?: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
  triggeredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAlertData {
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
}

export interface UpdateAlertData {
  targetPrice?: number;
  condition?: 'above' | 'below';
  active?: boolean;
}

export interface AlertsResponse {
  status: string;
  results: number;
  data: {
    alerts: Alert[];
  };
}

export interface AlertResponse {
  status: string;
  data: {
    alert: Alert;
  };
}

// Alert Service
export const alertService = {
  // Get all alerts
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const response = await apiRequest.get<AlertsResponse>('/alerts');
      return response.data.alerts || [];
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  // Create alert
  createAlert: async (data: CreateAlertData): Promise<Alert> => {
    try {
      const response = await apiRequest.post<AlertResponse>('/alerts', data);
      return response.data.alert;
    } catch (error: any) {
      console.error('Error creating alert:', error);
      throw error;
    }
  },

  // Update alert
  updateAlert: async (alertId: string, data: UpdateAlertData): Promise<Alert> => {
    try {
      const response = await apiRequest.patch<AlertResponse>(`/alerts/${alertId}`, data);
      return response.data.alert;
    } catch (error: any) {
      console.error('Error updating alert:', error);
      throw error;
    }
  },

  // Delete alert
  deleteAlert: async (alertId: string): Promise<void> => {
    try {
      await apiRequest.delete(`/alerts/${alertId}`);
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  },

  // Toggle alert active status
  toggleAlert: async (alertId: string, active: boolean): Promise<Alert> => {
    return alertService.updateAlert(alertId, { active });
  },
};
