
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
  const { callEdgeFunction } = useSupabase();
  
  const [job, setJob] = useState<AEJob | null>(null);
  const [logs, setLogs] = useState<AEJobLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setIsLoading(true);
      const data = await callEdgeFunction("ae-jobs", {
        query: { jobId }
      });
      
      if (!data.job) {
        toast.error("Job not found");
        navigate("/");
        return;
      }
      
      setJob(data.job);
      setLogs(data.logs || []);
      setProjectId(data.job.project_id);
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
    
    const interval = setInterval(fetchJobDetails, 3000);
    
    return () => clearInterval(interval);
  }, [job, fetchJobDetails]);
  
  const handleJobAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!jobId || !projectId) return;
    
    try {
      await callEdgeFunction("ae-jobs", {
        method: "PUT",
        query: { projectId, jobId },
        body: { action }
      });
      
      fetchJobDetails();
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
          <p>{job.current_stage}</p>
        </div>
        <div className="bg-card p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Progress</h3>
          <p>{job.progress}%</p>
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
        <LogDisplay logs={logs.map(log => ({
          id: log.id,
          message: log.message,
          timestamp: new Date(log.created_at).toLocaleTimeString(),
          level: log.level
        }))} />
      </div>

      {job.status === 'completed' && (
        <div className="flex justify-center">
          <Button>Download Results</Button>
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
