
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import LogDisplay from "@/components/ui/LogDisplay";

interface Job {
  id: string;
  name: string;
  status: string;
  progress: number;
  current_stage: string;
  created_at: string;
  completed_at?: string;
}

interface ExtractedAttribute {
  productId: string;
  productName: string;
  material?: string;
  color?: string;
}

interface AEResultsTabProps {
  projectId: string;
}

const AEResultsTab = ({ projectId }: AEResultsTabProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [extractedAttributes, setExtractedAttributes] = useState<ExtractedAttribute[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  
  useEffect(() => {
    const fetchJobs = () => {
      try {
        setIsLoading(true);
        // Get jobs from localStorage
        const savedJobs = localStorage.getItem(`ae-jobs-${projectId}`);
        const jobsList = savedJobs ? JSON.parse(savedJobs) : [];
        
        if (jobsList.length > 0) {
          setJobs(jobsList);
          setActiveJob(jobsList[0]);
          
          // If job is completed, show completed view
          if (jobsList[0].status === "completed" || jobsList[0].progress >= 100) {
            setIsCompleted(true);
            // Generate mock extracted attributes
            generateMockAttributes();
          }
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJobs();
    
    // Setup log messages for demo
    const demoLogs = [
      "[Process started]",
      "[Initializing process...]",
      "[Loading configuration...]",
      "[Connecting to API...]",
      "[Retrieving product data...]",
      "[Processing products...]",
      "[Extracting attributes...]",
      "[Finalizing results...]"
    ];
    
    setLogs(demoLogs);
    
    // Simulate job progress
    const interval = setInterval(() => {
      setJobs(prevJobs => {
        if (prevJobs.length === 0) return prevJobs;
        
        const updatedJobs = [...prevJobs];
        const jobToUpdate = {...updatedJobs[0]};
        
        if (jobToUpdate.progress < 100) {
          const newProgress = Math.min(jobToUpdate.progress + 2, 100);
          jobToUpdate.progress = newProgress;
          
          // Update stage based on progress
          if (newProgress < 20) {
            jobToUpdate.current_stage = "Data Preprocessing";
          } else if (newProgress < 40) {
            jobToUpdate.current_stage = "Finding Similar Products";
          } else if (newProgress < 60) {
            jobToUpdate.current_stage = "Extracting Attributes";
          } else if (newProgress < 80) {
            jobToUpdate.current_stage = "Analyzing Attributes";
          } else {
            jobToUpdate.current_stage = "Finalizing Results";
          }
          
          if (newProgress >= 100) {
            jobToUpdate.status = "completed";
            jobToUpdate.completed_at = new Date().toISOString();
            setIsCompleted(true);
            generateMockAttributes();
          }
          
          updatedJobs[0] = jobToUpdate;
          setActiveJob(jobToUpdate);
          
          // Save updated jobs to localStorage
          localStorage.setItem(`ae-jobs-${projectId}`, JSON.stringify(updatedJobs));
        }
        
        return updatedJobs;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [projectId]);
  
  const generateMockAttributes = () => {
    const attributes = [
      { productId: "PROD-1001", productName: "Cotton T-Shirt", material: "Cotton", color: "Green" },
      { productId: "PROD-1002", productName: "Silk Blouse", material: "Silk", color: "Black" },
      { productId: "PROD-1003", productName: "Wool Sweater", material: "Wool", color: "Red" },
      { productId: "PROD-1004", productName: "Polyester Pants", material: "Polyester", color: "Blue" },
    ];
    setExtractedAttributes(attributes);
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const renderProcessingStatus = () => (
    <div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Progress: {activeJob?.progress ? Math.round(activeJob.progress) : 0}%</span>
                <span>ETA: 8:12</span>
              </div>
              <Progress value={activeJob?.progress || 0} className="h-2" />
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span>Current Stage: {activeJob?.current_stage}</span>
                <span>55%</span>
              </div>
              <Progress value={55} className="h-2" />
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button variant="outline">Pause</Button>
              <Button variant="outline">Cancel Process</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Real-time Log</CardTitle>
          </CardHeader>
          <CardContent>
            <LogDisplay logs={logs} maxHeight={200} />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-green-600">50</div>
              <div className="text-sm text-green-700 mt-2">Products Processed</div>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-600">2</div>
              <div className="text-sm text-blue-700 mt-2">Attributes Extracted</div>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-yellow-600">0</div>
              <div className="text-sm text-yellow-700 mt-2">Products Skipped</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Extracted Attributes</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Filter results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="outline">
              Export CSV
            </Button>
            <Button variant="outline">
              Export Excel
            </Button>
            <Button>
              Push to CMS
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">
                    <div className="flex items-center gap-1">
                      Product ID
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium">
                    <div className="flex items-center gap-1">
                      Product Name
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left p-3 font-medium">Material</th>
                  <th className="text-left p-3 font-medium">Color</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {extractedAttributes.map(attr => (
                  <tr key={attr.productId}>
                    <td className="p-3">{attr.productId}</td>
                    <td className="p-3">{attr.productName}</td>
                    <td className="p-3">{attr.material}</td>
                    <td className="p-3">{attr.color}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return isCompleted ? renderResults() : renderProcessingStatus();
};

export default AEResultsTab;
