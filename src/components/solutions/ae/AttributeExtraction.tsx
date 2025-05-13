
import React, { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { useProjectSettings, AEConfigType } from "@/hooks/useProjectSettings";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import FileUpload from "@/components/ui/FileUpload";
import { toast } from "@/components/ui/use-toast";
import AttributeManager from "./AttributeManager";
import DataTable from "@/components/ui/DataTable";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useAttributeExtractionService, ProductColumnMapping } from "@/hooks/api/useAttributeExtractionService";

type AttributeExtractionProps = {
  solutionPrefix: string;
};

const AttributeExtraction: React.FC<AttributeExtractionProps> = ({ solutionPrefix }) => {
  const { currentProject } = useAppContext();
  const { currentWorkspace } = useWorkspace();
  const { settings, isLoading: isLoadingSettings, saveProjectSettings } = useProjectSettings(
    solutionPrefix,
    currentProject?.name
  );

  const { processFile, isProcessing: isFileProcessing } = useFileProcessor();
  const { useProcessDataMutation, useExtractionRuns, progress, isProcessing } = useAttributeExtractionService();
  
  const processDataMutation = useProcessDataMutation();
  const { data: extractionRuns = [], isLoading: isLoadingRuns } = useExtractionRuns(
    currentProject?.id
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<Array<any>>([]);
  const [fileName, setFileName] = useState<string>("");
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isMappingValid, setIsMappingValid] = useState(false);

  // Updated required columns for product data
  const requiredColumns = [
    { key: "product_id", display: "Product ID", required: true },
    { key: "product_title", display: "Product Title", required: true },
    { key: "product_url", display: "Product URL", required: true },
    { key: "product_image_url", display: "Product Image URL", required: true },
    { key: "product_description", display: "Product Description", required: true }
  ];

  // Effect to update column mappings when settings change
  useEffect(() => {
    if (settings?.columnMappings) {
      setColumnMappings(settings.columnMappings);
    }
  }, [settings]);

  // Validate if all required mappings are present
  useEffect(() => {
    const requiredKeys = requiredColumns
      .filter(col => col.required)
      .map(col => col.key);
    
    const allRequiredMapped = requiredKeys.every(key => 
      columnMappings[key] && columnMappings[key].trim() !== ""
    );
    
    setIsMappingValid(allRequiredMapped);
  }, [columnMappings]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setSelectedFile(file);
      const { data, fileName } = await processFile(file);
      setFileData(data);
      setFileName(fileName);
      
      // Extract available columns from the first row
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        setAvailableColumns(columns);
      }
      
      toast.info(`File processed: ${fileName} (${data.length} rows)`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file. Please try again.");
    }
  };

  // Handle column mapping change
  const handleMappingChange = (targetColumn: string, sourceColumn: string) => {
    const newMappings = {
      ...columnMappings,
      [targetColumn]: sourceColumn
    };
    
    setColumnMappings(newMappings);
    
    // Save mappings to project settings
    if (settings) {
      const updatedSettings: AEConfigType = {
        ...settings,
        columnMappings: newMappings
      };
      saveProjectSettings(updatedSettings);
    }
  };

  // Start the extraction process
  const handleStartExtraction = async () => {
    if (!currentProject?.id) {
      toast.error("No project selected");
      return;
    }
    
    if (!isMappingValid) {
      toast.error("Please map all required columns before starting extraction");
      return;
    }
    
    if (fileData.length === 0) {
      toast.error("No data to process. Please upload a file first.");
      return;
    }
    
    try {
      // Process the data using our service
      await processDataMutation.mutateAsync({
        projectId: currentProject.id,
        fileName,
        rawData: fileData,
        columnMapping: columnMappings as ProductColumnMapping
      });
      
      toast.success("Extraction completed successfully!");
      
      // Switch to the Results tab
      setActiveTabIndex(1);
    } catch (error) {
      console.error("Error during extraction:", error);
      toast.error("Failed to complete extraction. Please try again.");
    }
  };

  // Render column mapping UI
  const renderColumnMappingUI = () => {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Map your spreadsheet columns to the required product fields. All required fields must be mapped before starting the extraction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {requiredColumns.map((column) => (
            <div key={column.key} className="flex items-center space-x-2">
              <div className="w-1/3">
                <span className="font-medium">{column.display}</span>
                {column.required && <span className="text-red-500 ml-1">*</span>}
              </div>
              <div className="w-2/3">
                <select
                  className="w-full p-2 border rounded-md"
                  value={columnMappings[column.key] || ""}
                  onChange={(e) => handleMappingChange(column.key, e.target.value)}
                >
                  <option value="">-- Select Column --</option>
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button 
            onClick={handleStartExtraction} 
            disabled={!isMappingValid || isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processing..." : "Start Extraction Process"}
          </Button>
          
          {isProcessing && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">
                Processing {progress}% complete...
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render extraction runs table
  const renderExtractionRuns = () => {
    if (isLoadingRuns) {
      return <p>Loading extraction runs...</p>;
    }
    
    if (extractionRuns.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No extraction runs yet. Upload a file and start extraction.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {extractionRuns.map((run) => (
          <Card key={run.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{run.file_name || "Unnamed extraction"}</CardTitle>
                <Badge className={`${
                  run.status === 'completed' ? 'bg-green-500' : 
                  run.status === 'processing' ? 'bg-blue-500' : 
                  run.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                }`}>
                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                </Badge>
              </div>
              <CardDescription>
                {new Date(run.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span>{run.processed_products} / {run.total_products}</span>
                </div>
                {run.status === 'processing' && (
                  <Progress 
                    value={(run.processed_products / (run.total_products || 1)) * 100} 
                    className="h-2"
                  />
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => alert('View details functionality will be implemented')}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render file preview table
  const renderFilePreview = () => {
    if (!fileData.length) return null;
    
    const columns = availableColumns.map(col => ({
      key: col,
      label: col
    }));
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">File Preview</h3>
        <div className="border rounded-md overflow-hidden">
          <DataTable 
            columns={columns} 
            data={fileData.slice(0, 10)} 
          />
          {fileData.length > 10 && (
            <div className="p-2 bg-gray-50 text-sm text-gray-500 text-right">
              Showing first 10 of {fileData.length} rows
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingSettings) {
    return <div>Loading project settings...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Tabs selectedIndex={activeTabIndex} onSelect={index => setActiveTabIndex(index)}>
        <TabList className="flex border-b mb-4">
          <Tab className="px-4 py-2 cursor-pointer border-b-2 border-transparent hover:text-blue-500 hover:border-blue-500 focus:outline-none aria-selected:border-blue-500 aria-selected:text-blue-500">
            Input
          </Tab>
          <Tab className="px-4 py-2 cursor-pointer border-b-2 border-transparent hover:text-blue-500 hover:border-blue-500 focus:outline-none aria-selected:border-blue-500 aria-selected:text-blue-500">
            Results
          </Tab>
          <Tab className="px-4 py-2 cursor-pointer border-b-2 border-transparent hover:text-blue-500 hover:border-blue-500 focus:outline-none aria-selected:border-blue-500 aria-selected:text-blue-500">
            Attributes
          </Tab>
        </TabList>

        <TabPanel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Product Data</CardTitle>
                  <CardDescription>
                    Upload your product data spreadsheet (CSV, Excel)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    onFileChange={handleFileUpload}
                    acceptedTypes={[".csv", ".xlsx", ".xls"]}
                    maxFileSizeMB={10}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Column Mapping</CardTitle>
                  <CardDescription>
                    Map your spreadsheet columns to our system fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fileData.length > 0 ? (
                    renderColumnMappingUI()
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-500">
                        Upload a file to start mapping columns
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {renderFilePreview()}
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Extraction Runs</CardTitle>
                  <CardDescription>
                    View your extraction history
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {renderExtractionRuns()}
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Products</CardTitle>
                  <CardDescription>
                    Select a run to view extracted products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Select an extraction run to view results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel>
          <AttributeManager 
            definitions={settings?.attributeDefinitions || []}
            onSave={(newDefinitions) => {
              if (settings) {
                saveProjectSettings({
                  ...settings,
                  attributeDefinitions: newDefinitions,
                });
              }
            }}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default AttributeExtraction;
