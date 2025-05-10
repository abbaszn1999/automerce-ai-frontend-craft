import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import ToolViewHeader from "../../common/ToolViewHeader";
import AttributeManager from "./AttributeManager";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import DataTable from "../../ui/DataTable";
import { ArrowLeft, ArrowRight, Pause, Play, XCircle } from "lucide-react";
import { simulateProcessing } from "../../../utils/utils";
import { toast } from "@/components/ui/sonner";
import ModuleOutputActions from "../../common/ModuleOutputActions";

const AttributeExtraction: React.FC = () => {
  const { aeCurrentTab, setAeCurrentTab, aeAttributes, setCurrentView, setSelectedProjectName } = useAppContext();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState("Initializing");
  const [stageProgress, setStageProgress] = useState(0);
  const [eta, setEta] = useState("Calculating...");
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [processingControls, setProcessingControls] = useState<{
    stop: () => void;
    pause: () => void;
    resume: () => void;
  } | null>(null);
  
  // Mock data for results
  const [resultsData, setResultsData] = useState<any[]>([]);

  // Effect to update ETA based on progress
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const minutes = Math.floor((100 - progress) / 10);
      const seconds = Math.floor(((100 - progress) % 10) * 6);
      setEta(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
    } else if (progress === 100) {
      setEta("Completed");
    }
  }, [progress]);

  // Effect to update the stage based on progress
  useEffect(() => {
    const stages = ["Data Preprocessing", "Attribute Extraction (AI)", "Validation & Formatting"];
    if (progress < 33) {
      setCurrentStage(stages[0]);
      setStageProgress((progress / 33) * 100);
    } else if (progress < 66) {
      setCurrentStage(stages[1]);
      setStageProgress(((progress - 33) / 33) * 100);
    } else {
      setCurrentStage(stages[2]);
      setStageProgress(((progress - 66) / 34) * 100);
    }
  }, [progress]);

  // Populate mock results when processing completes
  useEffect(() => {
    if (isComplete) {
      const mockResults = [];
      
      // Generate random products
      for (let i = 1; i <= 50; i++) {
        const product: any = {
          id: `PROD-${1000 + i}`,
          name: `Product ${i}`,
        };
        
        // Add attribute values to products
        aeAttributes.forEach(attr => {
          const randomValueIndex = Math.floor(Math.random() * attr.values.length);
          product[attr.name.toLowerCase()] = attr.values[randomValueIndex];
        });
        
        mockResults.push(product);
      }
      
      setResultsData(mockResults);
    }
  }, [isComplete, aeAttributes]);

  const goToTab = (tabId: string) => {
    setAeCurrentTab(tabId);
  };

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleStartProcess = () => {
    if (!uploadedFile) {
      toast.error("Please upload a file before starting extraction.");
      return;
    }
    
    // Enable processing tab and navigate to it
    goToTab("attr-processing-content");
    
    // Reset processing state
    setProgress(0);
    setLogs([]);
    setCurrentStage("Initializing");
    setStageProgress(0);
    setEta("Calculating...");
    setIsComplete(false);
    setIsPaused(false);
    
    // Start simulating processing
    const controls = simulateProcessing(
      (currentProgress) => {
        setProgress(currentProgress);
        if (currentProgress === 100) {
          setIsComplete(true);
          // Enable results tab
          const resultsTabElement = document.getElementById("attr-results-tab");
          if (resultsTabElement) {
            resultsTabElement.classList.remove("opacity-50", "cursor-not-allowed");
            resultsTabElement.removeAttribute("disabled");
          }
        }
      },
      (message) => {
        setLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("Attribute extraction completed successfully!");
      },
      15000, // 15 seconds for the whole process
      ["Data Preprocessing", "Attribute Extraction (AI)", "Validation & Formatting"]
    );
    
    setProcessingControls(controls);
  };

  const handlePauseResumeProcess = () => {
    if (!processingControls) return;
    
    if (isPaused) {
      processingControls.resume();
      setIsPaused(false);
    } else {
      processingControls.pause();
      setIsPaused(true);
    }
  };

  const handleCancelProcess = () => {
    if (!processingControls) return;
    
    processingControls.stop();
    setLogs(prev => [...prev, "Process cancelled by user"]);
    setProgress(0);
    setIsComplete(false);
  };

  const handleDeleteResult = (row: any) => {
    setResultsData(prev => prev.filter(p => p.id !== row.id));
    toast.success(`Product ${row.id} removed from results.`);
  };

  const handleEditResult = (row: any) => {
    // In a real application, this would open an editing modal or form
    toast.info(`Edit functionality would open a modal for product ${row.id}`);
  };
  
  // Create columns for the results table
  const getResultsColumns = () => {
    const baseColumns = [
      { key: "id", label: "Product ID" },
      { key: "name", label: "Product Name" }
    ];
    
    // Add a column for each attribute
    const attributeColumns = aeAttributes.map(attr => ({
      key: attr.name.toLowerCase(),
      label: attr.name
    }));
    
    return [...baseColumns, ...attributeColumns];
  };
  
  // Actions for results table rows
  const resultsActions = [
    {
      label: "Edit",
      onClick: handleEditResult,
      className: "btn-outline"
    },
    {
      label: "Delete",
      onClick: handleDeleteResult,
      className: "btn-outline"
    }
  ];

  // Export handlers
  const handleExportCSV = () => {
    toast.success("Exporting attributes to CSV...");
  };

  const handleExportExcel = () => {
    toast.success("Exporting attributes to Excel...");
  };

  const handlePushToCMS = () => {
    toast.success("Pushing attributes to CMS...");
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="ae" 
        solutionName="Attribute Extraction" 
      />

      {/* Tabs Navigation */}
      <div className="tabs mb-6">
        <div className="border-b flex overflow-x-auto">
          <button 
            id="attr-setup-tab"
            className={`solution-tab ${aeCurrentTab === "attr-setup-content" ? "active" : ""}`}
            onClick={() => goToTab("attr-setup-content")}
          >
            1. Setup
          </button>
          <button 
            id="attr-input-tab"
            className={`solution-tab ${aeCurrentTab === "attr-input-content" ? "active" : ""}`}
            onClick={() => goToTab("attr-input-content")}
          >
            2. Input
          </button>
          <button 
            id="attr-processing-tab"
            className={`solution-tab ${aeCurrentTab === "attr-processing-content" ? "active" : ""} ${isComplete ? "" : "opacity-50 cursor-not-allowed"}`}
            onClick={() => {
              if (uploadedFile || isComplete) {
                goToTab("attr-processing-content");
              } else {
                toast.error("Please complete the input step first.");
              }
            }}
          >
            3. Processing
          </button>
          <button 
            id="attr-results-tab"
            className={`solution-tab ${aeCurrentTab === "attr-results-content" ? "active" : ""} ${isComplete ? "" : "opacity-50 cursor-not-allowed"}`}
            disabled={!isComplete}
            onClick={() => {
              if (isComplete) {
                goToTab("attr-results-content");
              } else {
                toast.error("Processing must complete before viewing results.");
              }
            }}
          >
            4. Results
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="tab-content">
        {/* Setup Tab */}
        {aeCurrentTab === "attr-setup-content" && (
          <div id="attr-setup-content">
            <h2 className="text-xl font-semibold mb-4">Attribute Extraction - Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Integration - Filtering SERP */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">AI Integration - Filtering SERP</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="openai-api-key" className="block text-sm font-medium mb-1">OPENAI_API_KEY</label>
                    <input type="password" id="openai-api-key" className="w-full p-2 border rounded" placeholder="Enter your OpenAI API key" />
                  </div>
                  <div>
                    <label htmlFor="embedding-model" className="block text-sm font-medium mb-1">embedding_model</label>
                    <input type="text" id="embedding-model" className="w-full p-2 border rounded" defaultValue="text-embedding-3-small" />
                  </div>
                  <div>
                    <label htmlFor="embedding-dimensions" className="block text-sm font-medium mb-1">embedding_dimensions</label>
                    <input type="number" id="embedding-dimensions" className="w-full p-2 border rounded" defaultValue="256" />
                  </div>
                  <div>
                    <label htmlFor="max-results-filter" className="block text-sm font-medium mb-1">max_results_filter</label>
                    <input type="number" id="max-results-filter" className="w-full p-2 border rounded" defaultValue="7" />
                  </div>
                </div>
              </div>

              {/* Google Lens API - Search API */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">Google Lens API - Search API</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="searchapi-api-key" className="block text-sm font-medium mb-1">SEARCHAPI_API_KEY</label>
                    <input type="password" id="searchapi-api-key" className="w-full p-2 border rounded" placeholder="Enter your SearchAPI API key" />
                  </div>
                  <div>
                    <label htmlFor="results" className="block text-sm font-medium mb-1">results</label>
                    <input type="number" id="results" className="w-full p-2 border rounded" defaultValue="10" />
                  </div>
                </div>
              </div>

              {/* Scraping Integration - Extract Images */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">Scraping Integration - Extract Images</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="scrapingbee-api-key" className="block text-sm font-medium mb-1">SCRAPINGBEE_API_KEY</label>
                    <input type="password" id="scrapingbee-api-key" className="w-full p-2 border rounded" placeholder="Enter your ScrapingBee API key" />
                  </div>
                  <div>
                    <label htmlFor="max-concurrent-1" className="block text-sm font-medium mb-1">MAX_CONCURRENT_REQUESTS-1</label>
                    <input type="number" id="max-concurrent-1" className="w-full p-2 border rounded" defaultValue="5" />
                  </div>
                </div>
              </div>

              {/* AI Integration - Similarity Check */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">AI Integration - Similarity Check</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="model-2" className="block text-sm font-medium mb-1">model-2</label>
                    <select id="model-2" className="w-full p-2 border rounded">
                      <option>gpt-4o</option>
                      <option>gpt-4-turbo</option>
                      <option>gpt-3.5-turbo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="max-tokens-2" className="block text-sm font-medium mb-1">max_tokens-2</label>
                    <input type="number" id="max-tokens-2" className="w-full p-2 border rounded" defaultValue="8000" />
                  </div>
                  <div>
                    <label htmlFor="prompt-2" className="block text-sm font-medium mb-1">prompt-2</label>
                    <textarea id="prompt-2" className="w-full p-2 border rounded" rows={3} defaultValue="You are an AI assistant identifying product attributes." />
                  </div>
                  <div>
                    <label htmlFor="batch-size" className="block text-sm font-medium mb-1">batch_size</label>
                    <input type="number" id="batch-size" className="w-full p-2 border rounded" defaultValue="100" />
                  </div>
                </div>
              </div>

              {/* Scraping Integration - Extract Attributes */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">Scraping Integration - Extract Attributes</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="max-concurrent-2" className="block text-sm font-medium mb-1">MAX_CONCURRENT_REQUESTS-2</label>
                    <input type="number" id="max-concurrent-2" className="w-full p-2 border rounded" defaultValue="5" />
                  </div>
                </div>
              </div>

              {/* AI Integration - Finalizing Results */}
              <div className="card col-span-1">
                <h3 className="text-lg font-medium mb-3">AI Integration - Finalizing Results</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="model-3" className="block text-sm font-medium mb-1">model-3</label>
                    <select id="model-3" className="w-full p-2 border rounded">
                      <option>gpt-4o</option>
                      <option>gpt-4-turbo</option>
                      <option>gpt-3.5-turbo</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="max-tokens-3" className="block text-sm font-medium mb-1">max_tokens-3</label>
                    <input type="number" id="max-tokens-3" className="w-full p-2 border rounded" defaultValue="2000" />
                  </div>
                  <div>
                    <label htmlFor="prompt-3" className="block text-sm font-medium mb-1">prompt-3</label>
                    <textarea id="prompt-3" className="w-full p-2 border rounded" rows={3} defaultValue="Analyze and categorize the extracted product attributes into their respective attribute types." />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Attribute Management */}
            <AttributeManager />
            
            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button className="btn btn-secondary">Save Configuration</button>
              <button 
                className="btn btn-primary flex items-center gap-1"
                onClick={() => goToTab("attr-input-content")}
              >
                <span>Proceed to Input</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Input Tab */}
        {aeCurrentTab === "attr-input-content" && (
          <div id="attr-input-content">
            <h2 className="text-xl font-semibold mb-4">Input Product Data</h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
              <p>Upload your product data file to begin the attribute extraction process. The file should contain product information including names, descriptions, and images.</p>
            </div>
            
            <FileUpload 
              id="attr-file-upload"
              acceptedTypes={[".csv", ".xlsx"]}
              label="Upload File"
              onFileChange={handleFileChange}
            />
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Connect to Store</h3>
              <p className="text-gray-600 mb-3">Import your product data directly from your e-commerce store.</p>
              <button disabled className="btn btn-outline opacity-50 cursor-not-allowed">
                Connect (Coming Soon)
              </button>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Column Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Source Columns (Your File)</h4>
                  <ul className="bg-gray-50 p-3 rounded text-sm">
                    <li className="py-1">product_id</li>
                    <li className="py-1">product_name</li>
                    <li className="py-1">description</li>
                    <li className="py-1">short_description</li>
                    <li className="py-1">image_url</li>
                    <li className="py-1">price</li>
                    <li className="py-1">category</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Required Fields (Autommerce.ai)</h4>
                  <ul className="bg-gray-50 p-3 rounded text-sm">
                    <li className="py-1">product_id*</li>
                    <li className="py-1">product_name*</li>
                    <li className="py-1">description</li>
                    <li className="py-1">image_url*</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">* Required fields</p>
                </div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button 
                className="btn btn-outline flex items-center gap-1"
                onClick={() => goToTab("attr-setup-content")}
              >
                <ArrowLeft size={16} />
                <span>Back to Setup</span>
              </button>
              <button 
                className="btn btn-primary flex items-center gap-1"
                onClick={handleStartProcess}
                disabled={!uploadedFile}
              >
                <span>Start Extraction Process</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {aeCurrentTab === "attr-processing-content" && (
          <div id="attr-processing-content">
            <h2 className="text-xl font-semibold mb-4">Processing Data</h2>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Overall Progress</h3>
              <ProgressBar progress={progress} id="attr-overall-progress" />
              
              <div className="flex justify-between text-sm mt-1">
                <span>Progress: {progress}%</span>
                <span>ETA: {eta}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium">Current Stage: <span id="attr-current-stage">{currentStage}</span></h4>
                  <span className="text-sm">{Math.round(stageProgress)}%</span>
                </div>
                <ProgressBar progress={stageProgress} id="attr-stage-progress" />
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  id="attr-pause-btn"
                  className="btn btn-outline flex items-center gap-1"
                  onClick={handlePauseResumeProcess}
                  disabled={isComplete}
                >
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>
                <button
                  id="attr-cancel-btn"
                  className="btn btn-outline flex items-center gap-1"
                  onClick={handleCancelProcess}
                  disabled={isComplete}
                >
                  <XCircle size={16} />
                  <span>Cancel Process</span>
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Real-time Log</h3>
              <LogDisplay logs={logs} id="attr-log" />
            </div>
            
            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button
                id="attr-back-to-input-btn"
                className="btn btn-outline flex items-center gap-1"
                onClick={() => goToTab("attr-input-content")}
                disabled={progress > 0 && !isComplete}
              >
                <ArrowLeft size={16} />
                <span>Back to Input</span>
              </button>
              
              {isComplete && (
                <button
                  id="attr-view-results-btn"
                  className="btn btn-primary flex items-center gap-1"
                  onClick={() => goToTab("attr-results-content")}
                >
                  <span>View Results</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {aeCurrentTab === "attr-results-content" && (
          <div id="attr-results-content">
            <h2 className="text-xl font-semibold mb-4">Extraction Results</h2>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-3">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{resultsData.length}</div>
                  <div className="text-sm text-green-700">Products Processed</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{aeAttributes.length}</div>
                  <div className="text-sm text-blue-700">Attributes Extracted</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">0</div>
                  <div className="text-sm text-yellow-700">Products Skipped</div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex flex-col sm:flex-row justify-between mb-3 gap-3">
                <h3 className="text-lg font-medium">Extracted Attributes</h3>
                
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Filter results..."
                    className="border rounded px-3 py-1 text-sm w-full sm:w-auto"
                  />
                  
                  <ModuleOutputActions
                    moduleType="ae"
                    outputType="product"
                    onExportCSV={handleExportCSV}
                    onExportExcel={handleExportExcel}
                    onPushToCMS={handlePushToCMS}
                  />
                </div>
              </div>
              
              <DataTable 
                data={resultsData} 
                columns={getResultsColumns()} 
                actions={resultsActions}
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {Math.min(resultsData.length, 10)} of {resultsData.length} items
                </div>
                
                <div className="flex">
                  <button className="btn btn-sm btn-outline rounded-r-none border-r-0">Previous</button>
                  <button className="btn btn-sm btn-outline rounded-l-none">Next</button>
                </div>
              </div>
            </div>
            
            {/* Button */}
            <div className="flex justify-center mt-6">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setCurrentView("project");
                  setSelectedProjectName(null);
                }}
              >
                Start New Extraction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeExtraction;
