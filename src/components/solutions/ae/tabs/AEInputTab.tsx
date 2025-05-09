
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/FileUpload";
import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AEInputTabProps {
  projectId: string;
  onJobCreated?: (jobId: string) => void;
}

const AEInputTab = ({ projectId, onJobCreated }: AEInputTabProps) => {
  const { callEdgeFunction } = useSupabase();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [jobName, setJobName] = useState("");
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  
  // Column mapping
  const [recordIdColumn, setRecordIdColumn] = useState("");
  const [titleColumn, setTitleColumn] = useState("");
  const [urlColumn, setUrlColumn] = useState("");
  const [imageUrlColumn, setImageUrlColumn] = useState("");
  const [descriptionColumn, setDescriptionColumn] = useState("");
  
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsProcessingCsv(true);
    
    try {
      // Read the first few lines of the CSV to extract headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        if (lines.length > 0) {
          // Parse headers (first line)
          const headers = lines[0].split(',').map(header => 
            header.trim().replace(/^"|"$/g, '') // Remove surrounding quotes
          );
          
          setCsvColumns(headers);
          
          // Try to guess column mappings based on common names
          const findColumnByPattern = (patterns: RegExp[]) => {
            return headers.find(header => 
              patterns.some(pattern => pattern.test(header.toLowerCase()))
            );
          };
          
          const idPatterns = [/id/i, /record/i, /sku/i];
          const titlePatterns = [/title/i, /name/i, /product.*name/i];
          const urlPatterns = [/url/i, /link/i, /product.*url/i];
          const imagePatterns = [/image/i, /picture/i, /photo/i, /img/i];
          const descPatterns = [/desc/i, /description/i, /details/i];
          
          setRecordIdColumn(findColumnByPattern(idPatterns) || "");
          setTitleColumn(findColumnByPattern(titlePatterns) || "");
          setUrlColumn(findColumnByPattern(urlPatterns) || "");
          setImageUrlColumn(findColumnByPattern(imagePatterns) || "");
          setDescriptionColumn(findColumnByPattern(descPatterns) || "");
        }
        
        setIsProcessingCsv(false);
      };
      
      reader.readAsText(uploadedFile);
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV file");
      setIsProcessingCsv(false);
    }
  };
  
  const handleCreateJob = async () => {
    if (!file) {
      toast.error("Please upload a CSV file");
      return;
    }
    
    if (!recordIdColumn || !titleColumn) {
      toast.error("Record ID and Title columns are required");
      return;
    }
    
    try {
      setIsCreatingJob(true);
      
      // First create a job
      const jobData = await callEdgeFunction("ae-jobs", {
        method: "POST",
        query: { projectId },
        body: {
          name: jobName || `Job ${new Date().toLocaleString()}`
        }
      });
      
      if (!jobData.job || !jobData.job.id) {
        throw new Error("Failed to create job");
      }
      
      const jobId = jobData.job.id;
      
      // TODO: Next steps would be:
      // 1. Upload the CSV file to Supabase Storage
      // 2. Start processing the file on the backend
      // 3. Update job status as processing begins
      
      toast.success("Job created successfully!");
      
      // For now, we'll just navigate to the job page
      if (onJobCreated) {
        onJobCreated(jobId);
      } else {
        navigate(`/ae/job/${jobId}`);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to create job");
    } finally {
      setIsCreatingJob(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Products</CardTitle>
          <CardDescription>
            Upload a CSV file containing product data to process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="job_name">Job Name (Optional)</Label>
              <Input
                id="job_name"
                placeholder="Enter a name for this extraction job"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
              />
            </div>
            
            <div>
              <FileUpload 
                onChange={handleFileUpload} 
                acceptedFileTypes={[".csv"]}
                maxSizeInMB={10}
              />
            </div>
            
            {isProcessingCsv && (
              <div className="text-center py-4">
                Processing CSV file...
              </div>
            )}
            
            {csvColumns.length > 0 && (
              <div className="space-y-4">
                <Separator />
                
                <h3 className="text-lg font-medium">Column Mapping</h3>
                <p className="text-sm text-muted-foreground">
                  Map the columns from your CSV to the required fields
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="record_id_column" className="flex items-center">
                      Record ID <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Select value={recordIdColumn} onValueChange={setRecordIdColumn}>
                      <SelectTrigger id="record_id_column">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvColumns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title_column" className="flex items-center">
                      Product Title <span className="ml-1 text-red-500">*</span>
                    </Label>
                    <Select value={titleColumn} onValueChange={setTitleColumn}>
                      <SelectTrigger id="title_column">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {csvColumns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url_column">
                      Product URL (Optional)
                    </Label>
                    <Select value={urlColumn} onValueChange={setUrlColumn}>
                      <SelectTrigger id="url_column">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvColumns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image_url_column">
                      Image URL (Optional)
                    </Label>
                    <Select value={imageUrlColumn} onValueChange={setImageUrlColumn}>
                      <SelectTrigger id="image_url_column">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvColumns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description_column">
                      Product Description (Optional)
                    </Label>
                    <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
                      <SelectTrigger id="description_column">
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {csvColumns.map(column => (
                          <SelectItem key={column} value={column}>{column}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setFile(null)}>
            Reset
          </Button>
          <Button 
            onClick={handleCreateJob} 
            disabled={!file || !recordIdColumn || !titleColumn || isCreatingJob}
          >
            {isCreatingJob ? "Creating..." : "Start Extraction Process"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AEInputTab;
