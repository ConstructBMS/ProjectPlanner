// Network utility for online/offline detection and management
import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

class NetworkManager {
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
    lastOffline: navigator.onLine ? null : new Date()
  };

  private listeners: Set<(status: NetworkStatus) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.status.lastOnline = new Date();
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.status.lastOffline = new Date();
      this.notifyListeners();
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  public getStatus(): NetworkStatus {
    return { ...this.status };
  }

  public isOnline(): boolean {
    return this.status.isOnline;
  }

  public addListener(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public removeListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.delete(listener);
  }
}

// Singleton instance
export const networkManager = new NetworkManager();

// React hook for network status
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>(networkManager.getStatus());

  useEffect(() => {
    const unsubscribe = networkManager.addListener(setStatus);
    return unsubscribe;
  }, []);

  return status;
};

// Utility functions
export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (networkManager.isOnline()) {
      resolve();
      return;
    }

    const unsubscribe = networkManager.addListener((status) => {
      if (status.isOnline) {
        unsubscribe();
        resolve();
      }
    });
  });
};

export const isOnline = (): boolean => {
  return networkManager.isOnline();
};

export const getNetworkStatus = (): NetworkStatus => {
  return networkManager.getStatus();
};
