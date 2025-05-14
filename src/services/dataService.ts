
import { storage } from './storageService';

export interface ProjectSettings {
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  solutionPrefix: string;
  description?: string;
  lastUpdated?: Date;
}

export interface ExtractionRun {
  id: string;
  projectId: string;
  fileName: string | null;
  columnMapping: any | null;
  status: string;
  totalProducts: number | null;
  processedProducts: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProductData {
  product_id: string;
  product_title: string;
  product_url: string;
  product_image_url: string;
  product_description: string;
  [key: string]: any;
}

class DataService {
  // Projects
  async getProjects(workspaceId: string, solutionPrefix: string): Promise<Project[]> {
    try {
      const key = `projects:${workspaceId}:${solutionPrefix}`;
      return storage.get<Project[]>(key) || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const newProject: Project = {
        ...project,
        id: 'project-' + Date.now(),
        lastUpdated: new Date()
      };
      
      const key = `projects:${project.workspaceId}:${project.solutionPrefix}`;
      const projects = storage.get<Project[]>(key) || [];
      const updatedProjects = [...projects, newProject];
      storage.set(key, updatedProjects);
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async deleteProject(project: Project): Promise<boolean> {
    try {
      const key = `projects:${project.workspaceId}:${project.solutionPrefix}`;
      const projects = storage.get<Project[]>(key) || [];
      const updatedProjects = projects.filter(p => p.id !== project.id);
      storage.set(key, updatedProjects);
      
      // Also delete project settings
      storage.remove(`projectSettings:${project.id}`);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  async getProjectId(workspaceId: string, solutionPrefix: string, projectName: string): Promise<string | null> {
    try {
      const key = `projects:${workspaceId}:${solutionPrefix}`;
      const projects = storage.get<Project[]>(key) || [];
      const project = projects.find(p => p.name === projectName);
      return project?.id || null;
    } catch (error) {
      console.error('Error getting project ID:', error);
      return null;
    }
  }

  // Project Settings
  async getProjectSettings(projectId: string): Promise<ProjectSettings | null> {
    try {
      return storage.get<ProjectSettings>(`projectSettings:${projectId}`);
    } catch (error) {
      console.error('Error fetching project settings:', error);
      return null;
    }
  }

  async saveProjectSettings(projectId: string, settings: ProjectSettings): Promise<boolean> {
    try {
      storage.set(`projectSettings:${projectId}`, settings);
      
      // Update project's lastUpdated
      this.updateProjectTimestamp(projectId);
      
      return true;
    } catch (error) {
      console.error('Error saving project settings:', error);
      return false;
    }
  }

  // Utility to update project timestamp
  private async updateProjectTimestamp(projectId: string): Promise<void> {
    const allProjects: Project[] = [];
    
    // Collect all projects from all workspaces and solution prefixes
    const keys = Object.keys(localStorage).filter(k => k.startsWith('app:projects:'));
    keys.forEach(key => {
      const projects = storage.get<Project[]>(key.replace('app:', '')) || [];
      allProjects.push(...projects);
    });
    
    // Find and update the project
    const projectToUpdate = allProjects.find(p => p.id === projectId);
    if (projectToUpdate) {
      projectToUpdate.lastUpdated = new Date();
      
      // Save the updated project
      const key = `projects:${projectToUpdate.workspaceId}:${projectToUpdate.solutionPrefix}`;
      const projects = storage.get<Project[]>(key) || [];
      const updatedProjects = projects.map(p => p.id === projectId ? projectToUpdate : p);
      storage.set(key, updatedProjects);
    }
  }

  // Extraction Runs
  async createExtractionRun(
    projectId: string, 
    fileName: string, 
    columnMapping: any
  ): Promise<string> {
    try {
      const newRun: ExtractionRun = {
        id: 'run-' + Date.now(),
        projectId,
        fileName,
        columnMapping,
        status: 'pending',
        totalProducts: null,
        processedProducts: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const key = `extractionRuns:${projectId}`;
      const runs = storage.get<ExtractionRun[]>(key) || [];
      const updatedRuns = [...runs, newRun];
      storage.set(key, updatedRuns);
      
      return newRun.id;
    } catch (error) {
      console.error('Error creating extraction run:', error);
      throw error;
    }
  }

  async updateExtractionRunStatus(
    runId: string, 
    status: string, 
    processedProducts?: number,
    totalProducts?: number
  ): Promise<boolean> {
    try {
      // Find the run in all projects
      let foundRun: ExtractionRun | null = null;
      let projectId: string | null = null;
      
      const keys = Object.keys(localStorage).filter(k => k.startsWith('app:extractionRuns:'));
      for (const key of keys) {
        const runs = storage.get<ExtractionRun[]>(key.replace('app:', '')) || [];
        const run = runs.find(r => r.id === runId);
        
        if (run) {
          foundRun = run;
          projectId = key.replace('app:extractionRuns:', '');
          break;
        }
      }
      
      if (foundRun && projectId) {
        // Update run
        foundRun.status = status;
        if (processedProducts !== undefined) {
          foundRun.processedProducts = processedProducts;
        }
        if (totalProducts !== undefined) {
          foundRun.totalProducts = totalProducts;
        }
        foundRun.updatedAt = new Date().toISOString();
        
        // Save updated run
        const key = `extractionRuns:${projectId}`;
        const runs = storage.get<ExtractionRun[]>(key) || [];
        const updatedRuns = runs.map(r => r.id === runId ? foundRun : r);
        storage.set(key, updatedRuns);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating extraction run status:', error);
      return false;
    }
  }

  async getExtractionRuns(projectId: string): Promise<ExtractionRun[]> {
    try {
      const key = `extractionRuns:${projectId}`;
      return storage.get<ExtractionRun[]>(key) || [];
    } catch (error) {
      console.error('Error fetching extraction runs:', error);
      return [];
    }
  }

  async getExtractionRunById(runId: string): Promise<ExtractionRun | null> {
    try {
      // Find the run in all projects
      const keys = Object.keys(localStorage).filter(k => k.startsWith('app:extractionRuns:'));
      for (const key of keys) {
        const runs = storage.get<ExtractionRun[]>(key.replace('app:', '')) || [];
        const run = runs.find(r => r.id === runId);
        
        if (run) {
          return run;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching extraction run:', error);
      return null;
    }
  }

  // Product Data
  async saveProductData(
    runId: string,
    projectId: string,
    products: ProductData[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<boolean> {
    try {
      // Start the run
      await this.updateExtractionRunStatus(runId, 'processing', 0, products.length);
      
      // Save products in batches
      const batchSize = 100;
      const totalProducts = products.length;
      let processedCount = 0;
      
      const key = `productData:${runId}`;
      const allProducts: ProductData[] = [];
      
      // Process products in batches
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        allProducts.push(...batch);
        
        processedCount += batch.length;
        
        // Update progress
        if (onProgress) {
          onProgress(processedCount, totalProducts);
        }
        
        // Save progress
        await this.updateExtractionRunStatus(runId, 'processing', processedCount);
      }
      
      // Save all products
      storage.set(key, allProducts);
      
      // Mark run as complete
      await this.updateExtractionRunStatus(runId, 'completed', totalProducts, totalProducts);
      
      return true;
    } catch (error) {
      console.error('Error saving product data:', error);
      await this.updateExtractionRunStatus(runId, 'failed');
      return false;
    }
  }

  async getProductDataByRunId(runId: string): Promise<ProductData[]> {
    try {
      const key = `productData:${runId}`;
      return storage.get<ProductData[]>(key) || [];
    } catch (error) {
      console.error('Error fetching product data:', error);
      return [];
    }
  }
}

export const dataService = new DataService();
