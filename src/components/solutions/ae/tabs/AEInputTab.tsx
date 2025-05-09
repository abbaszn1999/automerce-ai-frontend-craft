
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/FileUpload";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

interface AEInputTabProps {
  projectId: string;
  onJobCreated?: (jobId: string) => void;
}

const AEInputTab = ({ projectId, onJobCreated }: AEInputTabProps) => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [isProcessingCsv, setIsProcessingCsv] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [sourceColumns, setSourceColumns] = useState<string[]>([
    'product_id', 
    'product_name', 
    'description', 
    'short_description',
    'image_url',
    'price',
    'category'
  ]);
  
  // Column mapping
  const [productIdMapping, setProductIdMapping] = useState("product_id");
  const [productNameMapping, setProductNameMapping] = useState("product_name");
  const [descriptionMapping, setDescriptionMapping] = useState("description");
  const [imageUrlMapping, setImageUrlMapping] = useState("image_url");
  
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    toast.success("File uploaded successfully");
    
    setIsProcessingCsv(true);
    
    // Simulate loading columns from CSV
    setTimeout(() => {
      // In a real implementation, we would parse the CSV file here
      setCsvColumns(['product_id', 'product_name', 'description', 'image_url', 'price', 'category']);
      setIsProcessingCsv(false);
    }, 1000);
  };
  
  const handleStartExtraction = async () => {
    try {
      setIsCreatingJob(true);
      
      // Create a new job with local storage
      const jobId = `job_${Date.now()}`;
      const job = {
        id: jobId,
        name: `Job ${new Date().toLocaleString()}`,
        status: "processing",
        progress: 5,
        current_stage: "Data Preprocessing",
        created_at: new Date().toISOString(),
        projectId,
        columnMapping: {
          productId: productIdMapping,
          productName: productNameMapping,
          description: descriptionMapping,
          imageUrl: imageUrlMapping
        },
        fileName: file?.name || "products.csv"
      };
      
      // Save job to localStorage
      const jobs = JSON.parse(localStorage.getItem(`ae-jobs-${projectId}`) || "[]");
      jobs.push(job);
      localStorage.setItem(`ae-jobs-${projectId}`, JSON.stringify(jobs));
      
      toast.success("Extraction process started");
      
      if (onJobCreated) {
        onJobCreated(jobId);
      }
      
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Failed to start extraction process");
    } finally {
      setIsCreatingJob(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Input Product Data</h3>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-800">
          Upload your product data file to begin the attribute extraction process. The file should contain product information including names, descriptions, and images.
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onChange={handleFileUpload}
            acceptedFileTypes={[".csv", ".xlsx"]}
            maxSizeInMB={10}
          />
          <div className="text-xs text-muted-foreground mt-2">
            .csv, .xlsx files up to 10MB
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connect to Store</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Import your product data directly from your e-commerce store.</p>
          <Button variant="outline" disabled>
            Connect (Coming Soon)
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Column Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessingCsv ? (
            <div className="text-center py-4">
              Processing file...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-4">Source Columns (Your File)</h4>
                <ul className="border rounded-md divide-y">
                  {sourceColumns.map(column => (
                    <li key={column} className="p-2">
                      {column}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">Required Fields (Autommerce.ai)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">
                      product_id* 
                    </label>
                    <Select 
                      value={productIdMapping} 
                      onValueChange={setProductIdMapping}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceColumns.map(column => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">
                      product_name* 
                    </label>
                    <Select 
                      value={productNameMapping} 
                      onValueChange={setProductNameMapping}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceColumns.map(column => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">
                      description
                    </label>
                    <Select 
                      value={descriptionMapping} 
                      onValueChange={setDescriptionMapping}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceColumns.map(column => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">
                      image_url*
                    </label>
                    <Select 
                      value={imageUrlMapping} 
                      onValueChange={setImageUrlMapping}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sourceColumns.map(column => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    * Required fields
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate(`/ae/project/${projectId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Setup
        </Button>
        
        <Button 
          className="flex items-center gap-2"
          onClick={handleStartExtraction}
          disabled={!file || isCreatingJob}
        >
          Start Extraction Process
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AEInputTab;
