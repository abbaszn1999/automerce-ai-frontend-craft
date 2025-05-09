
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Download, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  name: string;
  status: string;
  progress: number;
  current_stage: string;
  created_at: string;
  completed_at: string | null;
}

interface AEResultsTabProps {
  projectId: string;
}

const AEResultsTab = ({ projectId }: AEResultsTabProps) => {
  const { callEdgeFunction } = useSupabase();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        const data = await callEdgeFunction("ae-jobs", {
          query: { projectId }
        });
        
        if (data.jobs) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
    
    // Periodically update job status if there are active jobs
    const interval = setInterval(() => {
      if (jobs.some(job => ['pending', 'processing'].includes(job.status))) {
        fetchJobs();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [projectId, callEdgeFunction]);

  const handleViewJob = (jobId: string) => {
    navigate(`/ae/job/${jobId}`);
  };
  
  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading && jobs.length === 0) {
    return <div className="p-4">Loading jobs...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Extraction Jobs</CardTitle>
          <CardDescription>
            View and manage your attribute extraction jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs created yet. Go to the Input tab to start a new extraction job.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map(job => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        {job.name || `Job ${new Date(job.created_at).toLocaleDateString()}`}
                      </TableCell>
                      <TableCell>
                        {getJobStatusBadge(job.status)}
                      </TableCell>
                      <TableCell>
                        {['pending', 'processing'].includes(job.status) ? (
                          <div className="w-20">
                            <ProgressBar progress={job.progress} height="h-2" />
                          </div>
                        ) : (
                          <span>{job.progress}%</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {job.completed_at ? new Date(job.completed_at).toLocaleString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewJob(job.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          
                          {job.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AEResultsTab;
