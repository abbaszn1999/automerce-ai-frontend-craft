
/**
 * Storage Service
 * 
 * A simple storage service that uses localStorage for persistence.
 * Replace with your preferred storage solution as needed.
 */

export class StorageService {
  private prefix: string;
  
  constructor(prefix = 'app') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(this.getKey(key));
      return value ? JSON.parse(value) as T : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${this.prefix}:`)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const storage = new StorageService();
