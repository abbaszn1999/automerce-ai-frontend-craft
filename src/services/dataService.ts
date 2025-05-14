
import { storage } from "./storageService";
import { AEConfigType } from "@/hooks/projectSettings/types";

// Mock data service to replace Supabase functionality
export const dataService = {
  // Project Settings
  getProjectId: async (
    workspaceId: string,
    solutionPrefix: string,
    projectName: string
  ): Promise<string | null> => {
    // In a real app, this would query the database
    // For now, generate a consistent ID based on inputs
    return `${workspaceId}-${solutionPrefix}-${projectName}`;
  },
  
  getProjectSettings: async (projectId: string): Promise<AEConfigType | null> => {
    const key = `project-settings-${projectId}`;
    return storage.get<AEConfigType>(key);
  },
  
  saveProjectSettings: async (projectId: string, settings: AEConfigType): Promise<boolean> => {
    try {
      const key = `project-settings-${projectId}`;
      storage.set(key, settings);
      return true;
    } catch (error) {
      console.error("Error saving project settings:", error);
      return false;
    }
  },
  
  // Feeds
  getFeeds: async (projectId: string): Promise<any[]> => {
    const key = `feeds-${projectId}`;
    return storage.get<any[]>(key) || [];
  },
  
  createFeed: async (projectId: string, name: string): Promise<any> => {
    const feeds = await dataService.getFeeds(projectId);
    
    const newFeed = {
      id: `feed-${Date.now()}`,
      project_id: projectId,
      name,
      created_at: new Date().toISOString(),
      row_count: 0
    };
    
    const updatedFeeds = [...feeds, newFeed];
    
    const key = `feeds-${projectId}`;
    storage.set(key, updatedFeeds);
    
    return newFeed;
  },
  
  getFeedItems: async (feedId: string): Promise<any[]> => {
    const key = `feed-items-${feedId}`;
    return storage.get<any[]>(key) || [];
  },
  
  saveFeedItems: async (feedId: string, items: any[]): Promise<boolean> => {
    try {
      const key = `feed-items-${feedId}`;
      storage.set(key, items);
      
      // Update row count in feed
      const feedParts = feedId.split('-');
      const projectId = feedParts[0]; // Simplified, in real app would need proper lookup
      const feeds = await dataService.getFeeds(projectId);
      const updatedFeeds = feeds.map(feed => 
        feed.id === feedId ? { ...feed, row_count: items.length } : feed
      );
      
      storage.set(`feeds-${projectId}`, updatedFeeds);
      
      return true;
    } catch (error) {
      console.error("Error saving feed items:", error);
      return false;
    }
  }
};
