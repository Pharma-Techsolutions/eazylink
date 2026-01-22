export interface WiFiNetwork {
  ssid: string;
  bssid?: string;
  strength: number;
  frequency?: number;
  isSecure: boolean;
  qualityScore?: number;
  recommendation?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export interface ConnectionHistory {
  id: string;
  ssid: string;
  connectedAt: string;
  disconnectedAt?: string;
  duration?: number;
  dataUsed?: string;
  location?: string;
}

export interface NetworkConnection {
  type: 'wifi' | 'cellular' | 'none';
  isConnected: boolean;
  ssid?: string;
  strength?: number;
}
