
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LogDisplay from "@/components/ui/LogDisplay";
import ProgressBar from "@/components/ui/ProgressBar";
import { toast } from "@/components/ui/sonner";

// Define job type
export interface AEJob {
  id: string;
  name: string;
  status: string;
  progress: number;
  current_stage: string;
  stage_progress: number;
  eta: string;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  error: string | null;
  projectId: string;
}

// Define log type
export interface AEJobLog {
  id: string;
  message: string;
  level: string;
  created_at: string;
}

const AEJobPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<AEJob | null>(null);
  const [logs, setLogs] = useState<AEJobLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const fetchJobDetails = () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      
      // Get all jobs from all projects
      const allJobs: AEJob[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ae-jobs-')) {
          const jobsInProject = JSON.parse(localStorage.getItem(key) || "[]");
          allJobs.push(...jobsInProject);
        }
      }
      
      // Find the specific job
      const foundJob = allJobs.find(j => j.id === jobId);
      
      if (!foundJob) {
        toast.error("Job not found");
        navigate("/");
        return;
      }
      
      // Generate some mock logs
      const mockLogs: AEJobLog[] = Array(10).fill(0).map((_, i) => ({
        id: `log_${i}`,
        message: `Processing step ${i + 1} of extraction workflow...`,
        level: i % 3 === 0 ? 'info' : i % 7 === 0 ? 'error' : 'debug',
        created_at: new Date(Date.now() - (i * 60000)).toISOString()
      }));
      
      setJob(foundJob);
      setLogs(mockLogs);
      setProjectId(foundJob.projectId);
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Failed to load job details");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch job details initially
  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);
  
  // Refresh job details periodically if job is running
  useEffect(() => {
    if (!job || ['completed', 'failed', 'cancelled'].includes(job.status)) {
      return;
    }
    
    // Simulate progress update
    const interval = setInterval(() => {
      setJob(prevJob => {
        if (!prevJob) return null;
        
        // Simulate progress
        const newProgress = Math.min(prevJob.progress + Math.random() * 5, 100);
        const isComplete = newProgress >= 100;
        
        const updatedJob = {
          ...prevJob,
          progress: newProgress,
          status: isComplete ? 'completed' : 'processing',
          current_stage: isComplete ? 'Completed' : prevJob.current_stage,
          completed_at: isComplete ? new Date().toISOString() : null
        };
        
        // Update in localStorage
        if (prevJob.projectId) {
          const jobs = JSON.parse(localStorage.getItem(`ae-jobs-${prevJob.projectId}`) || "[]");
          const updatedJobs = jobs.map((j: any) => j.id === prevJob.id ? updatedJob : j);
          localStorage.setItem(`ae-jobs-${prevJob.projectId}`, JSON.stringify(updatedJobs));
        }
        
        return updatedJob;
      });
      
      // Add a new log entry
      setLogs(prevLogs => [
        {
          id: `log_${Date.now()}`,
          message: `Processing products... ${Math.floor(Math.random() * 100)} items processed.`,
          level: 'info',
          created_at: new Date().toISOString()
        },
        ...prevLogs
      ]);
      
    }, 3000);
    
    return () => clearInterval(interval);
  }, [job]);
  
  const handleJobAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!jobId || !projectId || !job) return;
    
    try {
      const jobs = JSON.parse(localStorage.getItem(`ae-jobs-${projectId}`) || "[]");
      
      const updatedJobs = jobs.map((j: any) => {
        if (j.id === jobId) {
          if (action === 'pause') {
            return { ...j, is_paused: true };
          } else if (action === 'resume') {
            return { ...j, is_paused: false };
          } else if (action === 'cancel') {
            return { ...j, status: 'cancelled', completed_at: new Date().toISOString() };
          }
        }
        return j;
      });
      
      localStorage.setItem(`ae-jobs-${projectId}`, JSON.stringify(updatedJobs));
      
      // Update UI state
      setJob(prev => {
        if (!prev) return null;
        
        if (action === 'pause') {
          return { ...prev, is_paused: true };
        } else if (action === 'resume') {
          return { ...prev, is_paused: false };
        } else if (action === 'cancel') {
          return { ...prev, status: 'cancelled', completed_at: new Date().toISOString() };
        }
        
        return prev;
      });
      
      toast.success(`Job ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      toast.error(`Failed to ${action} job`);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Job not found</h2>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  const jobIsActive = !['completed', 'failed', 'cancelled'].includes(job.status);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{job.name || "Attribute Extraction Job"}</h1>
          <p className="text-muted-foreground">
            Status: <span className="font-medium">{job.status}</span>
            {job.is_paused && <span className="ml-2 text-yellow-500">(Paused)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {projectId && (
            <Button variant="outline" onClick={() => navigate(`/ae/project/${projectId}`)}>
              Back to Project
            </Button>
          )}
          <Button onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Current Stage</h3>
          <p>{job.current_stage || "Initializing"}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Progress</h3>
          <p>{Math.round(job.progress)}%</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Time Remaining</h3>
          <p>{job.eta || "Calculating..."}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Started</h3>
          <p>{new Date(job.created_at).toLocaleString()}</p>
        </div>
      </div>

      {jobIsActive && (
        <div className="mb-8">
          <ProgressBar progress={job.progress} />
          
          <div className="flex gap-4 mt-4">
            {job.is_paused ? (
              <Button onClick={() => handleJobAction('resume')}>Resume Job</Button>
            ) : (
              <Button onClick={() => handleJobAction('pause')}>Pause Job</Button>
            )}
            <Button variant="destructive" onClick={() => handleJobAction('cancel')}>
              Cancel Job
            </Button>
          </div>
        </div>
      )}

      <div className="bg-card p-4 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Processing Logs</h2>
        <LogDisplay 
          logs={logs.map(log => log.message)} 
          maxHeight="max-h-[400px]" 
        />
      </div>

      {job.status === 'completed' && (
        <div className="flex justify-center">
          <Button onClick={() => toast.success("Download started")}>Download Results</Button>
        </div>
      )}

      {job.error && (
        <div className="bg-destructive/10 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-medium text-destructive mb-2">Error</h3>
          <p>{job.error}</p>
        </div>
      )}
    </div>
  );
};

export default AEJobPage;
