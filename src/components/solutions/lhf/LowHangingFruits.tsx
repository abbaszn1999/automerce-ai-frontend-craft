import React, { useState, useEffect } from "react";
import ToolViewHeader from "../../common/ToolViewHeader";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import DataTable from "../../ui/DataTable";
import { simulateProcessing } from "../../../utils/utils";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ModuleOutputActions from "../../common/ModuleOutputActions";

const LowHangingFruits: React.FC = () => {
  // Stage state
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);
  
  // Input stage states
  const [productFeedFile, setProductFeedFile] = useState<File | null>(null);
  const [plpFeedFile, setPlpFeedFile] = useState<File | null>(null);
  const [gscConnected, setGscConnected] = useState(false);
  const [productUrlParam, setProductUrlParam] = useState("");
  const [plpUrlParam, setPlpUrlParam] = useState("");
  
  // Processing stage states
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Results stage states
  const [productResults, setProductResults] = useState<any[]>([]);
  const [plpResults, setPlpResults] = useState<any[]>([]);

  // Check if input is complete to enable analysis start
  const isInputComplete = !!productFeedFile && !!plpFeedFile && gscConnected && 
                           !!productUrlParam && !!plpUrlParam;

  useEffect(() => {
    // Enable/disable the Start Analysis button
    const button = document.getElementById("lhf-start-analysis-btn");
    if (button) {
      if (isInputComplete) {
        button.removeAttribute("disabled");
        button.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        button.setAttribute("disabled", "true");
        button.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }, [isInputComplete]);

  // Stage navigation
  const goToStage = (stage: 1 | 2 | 3) => {
    // Only allow going forward if requirements are met
    if (stage > currentStage) {
      if (stage === 2 && !isInputComplete) {
        toast.error("Please complete all input requirements first.");
        return;
      }
      
      if (stage === 3 && !progress) {
        toast.error("Processing must be completed before viewing results.");
        return;
      }
    }
    
    setCurrentStage(stage);
    
    // If moving to stage 2, start processing
    if (stage === 2 && !isProcessing) {
      startProcessing();
    }
  };

  // File handlers
  const handleProductFeedChange = (file: File | null) => {
    setProductFeedFile(file);
  };
  
  const handlePlpFeedChange = (file: File | null) => {
    setPlpFeedFile(file);
  };
  
  const handleConnectGsc = () => {
    setGscConnected(!gscConnected);
    
    if (!gscConnected) {
      toast.success("Successfully connected to Google Search Console!");
    }
  };

  // Export handlers
  const handleExportProductResults = () => {
    toast.success("Exporting Product Fruits (CSV)");
    // Implementation would go here
  };

  const handleExportPlpResults = () => {
    toast.success("Exporting PLP Fruits (CSV)");
    // Implementation would go here
  };

  // Start processing analysis
  const startProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    
    // Disable back button during processing
    const backButton = document.getElementById("lhf-back-to-input-btn");
    if (backButton) {
      backButton.setAttribute("disabled", "true");
      backButton.classList.add("opacity-50", "cursor-not-allowed");
    }
    
    simulateProcessing(
      (currentProgress) => {
        setProgress(currentProgress);
        
        if (currentProgress === 100) {
          // Enable back button
          if (backButton) {
            backButton.removeAttribute("disabled");
            backButton.classList.remove("opacity-50", "cursor-not-allowed");
          }
          
          // Show results button
          const resultsButton = document.getElementById("lhf-view-results-btn");
          if (resultsButton) {
            resultsButton.style.display = "flex";
          }
          
          // Generate mock results
          generateMockResults();
          
          // Automatically navigate to results after a short delay
          setTimeout(() => {
            goToStage(3);
          }, 1000);
        }
      },
      (message) => {
        setLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("Low Hanging Fruits analysis completed successfully!");
      },
      10000 // 10 seconds for the whole process
    );
  };

  // Generate mock results
  const generateMockResults = () => {
    // Product results
    const mockProductResults = [
      {
        name: "Men's Classic White T-Shirt",
        urlSlug: "/products/mens-classic-white-tshirt",
        topQuery: "white t-shirt men",
        clicks: 245,
        impressions: 5840,
        position: 3.2,
        ctr: "4.2%"
      },
      {
        name: "Women's Black Leather Jacket",
        urlSlug: "/products/womens-black-leather-jacket",
        topQuery: "leather jacket women",
        clicks: 186,
        impressions: 3720,
        position: 4.1,
        ctr: "5.0%"
      },
      {
        name: "Unisex Canvas Sneakers",
        urlSlug: "/products/unisex-canvas-sneakers",
        topQuery: "casual canvas shoes",
        clicks: 132,
        impressions: 2950,
        position: 5.3,
        ctr: "4.5%"
      },
      {
        name: "Men's Slim Fit Jeans",
        urlSlug: "/products/mens-slim-fit-jeans",
        topQuery: "slim jeans men",
        clicks: 128,
        impressions: 3210,
        position: 6.2,
        ctr: "4.0%"
      },
      {
        name: "Women's Summer Dress",
        urlSlug: "/products/womens-summer-dress",
        topQuery: "summer dresses",
        clicks: 121,
        impressions: 2890,
        position: 7.4,
        ctr: "4.2%"
      }
    ];
    
    // PLP results
    const mockPlpResults = [
      {
        name: "Women's Dresses Collection",
        urlSlug: "/collections/womens-dresses",
        pageType: "Collection",
        primaryKeyword: "women's dresses",
        secondaryKeywords: "summer dresses, casual dresses, formal dresses",
        clicks: 520,
        impressions: 11540
      },
      {
        name: "Men's Accessories",
        urlSlug: "/collections/mens-accessories",
        pageType: "Collection",
        primaryKeyword: "men's accessories",
        secondaryKeywords: "men's watches, men's belts, men's wallets",
        clicks: 384,
        impressions: 8320
      },
      {
        name: "Summer Sale",
        urlSlug: "/collections/summer-sale",
        pageType: "Sale",
        primaryKeyword: "summer clothes sale",
        secondaryKeywords: "discount summer wear, summer fashion deals",
        clicks: 276,
        impressions: 6240
      },
      {
        name: "New Arrivals",
        urlSlug: "/collections/new-arrivals",
        pageType: "New In",
        primaryKeyword: "new fashion arrivals",
        secondaryKeywords: "latest clothing, new fashion trends",
        clicks: 215,
        impressions: 5110
      }
    ];
    
    setProductResults(mockProductResults);
    setPlpResults(mockPlpResults);
  };

  // Reset the analysis
  const resetAnalysis = () => {
    setCurrentStage(1);
    setProgress(0);
    setLogs([]);
    setIsProcessing(false);
    setProductResults([]);
    setPlpResults([]);
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="lhf" 
        solutionName="Low Hanging Fruits" 
      />

      {/* Stage Indicator */}
      <div id="lhf-stages" className="mb-8">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <div 
              className={`stage-item cursor-pointer ${currentStage === 1 ? "stage-active" : currentStage > 1 ? "stage-completed" : "stage-pending"}`}
              onClick={() => goToStage(1)}
            >
              <div className="stage-number">1</div>
              <div className="stage-label">Input & Config</div>
            </div>
            <div className={`stage-line ${currentStage > 1 ? "bg-green-500" : "bg-gray-200"}`}></div>
          </div>
          
          <div className="relative">
            <div 
              className={`stage-item cursor-pointer ${currentStage === 2 ? "stage-active" : currentStage > 2 ? "stage-completed" : "stage-pending"}`}
              onClick={() => currentStage >= 2 ? goToStage(2) : null}
            >
              <div className="stage-number">2</div>
              <div className="stage-label">Processing</div>
            </div>
            <div className={`stage-line ${currentStage > 2 ? "bg-green-500" : "bg-gray-200"}`}></div>
          </div>
          
          <div>
            <div 
              className={`stage-item cursor-pointer ${currentStage === 3 ? "stage-active" : currentStage > 3 ? "stage-completed" : "stage-pending"}`}
              onClick={() => currentStage >= 3 ? goToStage(3) : null}
            >
              <div className="stage-number">3</div>
              <div className="stage-label">Results</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input & Config Stage */}
      {currentStage === 1 && (
        <div id="lhf-input-content">
          <h2 className="text-xl font-semibold mb-4">Input Data & Configuration</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
            <p>Upload required files and set URL parameters to identify low hanging fruit opportunities.</p>
          </div>
          
          {/* Product Feed */}
          <FileUpload 
            id="lhf-file-product-feed"
            statusId="status-lhf-product-feed"
            acceptedTypes={[".csv", ".xlsx"]}
            label="1. Product Feed"
            requiredColumns={["Name", "URL Slug", "Description", "Short description", "Featured Image", "record_id"]}
            onFileChange={handleProductFeedChange}
            downloadTemplateLink="#template-lhf-products"
          />
          
          {/* PLP Feed */}
          <FileUpload 
            id="lhf-file-plp-feed"
            statusId="status-lhf-plp-feed"
            acceptedTypes={[".csv", ".xlsx"]}
            label="2. PLP Feed"
            requiredColumns={["Name", "URL Slug", "Page Type"]}
            onFileChange={handlePlpFeedChange}
            downloadTemplateLink="#template-lhf-plp"
          />
          
          {/* Google Search Console */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">3. Google Search Console</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                id="lhf-gsc-connect-btn"
                className={`btn ${gscConnected ? "btn-outline" : "btn-primary"}`}
                onClick={handleConnectGsc}
              >
                {gscConnected ? "Disconnect from GSC" : "Connect to GSC"}
              </button>
              
              <div className={`status-indicator ${gscConnected ? "status-uploaded" : "status-pending"}`} id="status-lhf-gsc">
                {gscConnected ? "Connected" : "Not Connected"}
              </div>
            </div>
          </div>
          
          {/* URL Structure Parameters */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">4. URL Structure Parameters</h3>
            <p className="text-sm text-gray-600 mb-4">
              These parameters help identify product and PLP pages in your analytics data.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="lhf-param-product-url" className="block text-sm font-medium mb-1">Product URL Structure Identifier</label>
                <input 
                  type="text" 
                  id="lhf-param-product-url"
                  value={productUrlParam}
                  onChange={(e) => setProductUrlParam(e.target.value)}
                  placeholder="e.g., /products/"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label htmlFor="lhf-param-plp-url" className="block text-sm font-medium mb-1">PLP URL Structure Identifier</label>
                <input 
                  type="text" 
                  id="lhf-param-plp-url"
                  value={plpUrlParam}
                  onChange={(e) => setPlpUrlParam(e.target.value)}
                  placeholder="e.g., /collections/"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          
          {/* Start Analysis Button */}
          <div className="flex justify-end mt-6">
            <button 
              id="lhf-start-analysis-btn"
              className="btn btn-primary flex items-center gap-1 opacity-50 cursor-not-allowed"
              disabled={!isInputComplete}
              onClick={() => goToStage(2)}
            >
              <span>Start Analysis</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Processing Stage */}
      {currentStage === 2 && (
        <div id="lhf-processing-content">
          <h2 className="text-xl font-semibold mb-4">Analyzing Data for Low Hanging Fruits</h2>
          
          {/* Progress */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">Overall Progress</h3>
            <ProgressBar progress={progress} id="lhf-overall-progress" />
            
            <div className="flex justify-between text-sm mt-1">
              <span>Progress: {progress}%</span>
              <span id="lhf-process-status">
                {progress < 25 && "Importing data from files..."}
                {progress >= 25 && progress < 50 && "Retrieving Search Console data..."}
                {progress >= 50 && progress < 75 && "Analyzing products and PLPs..."}
                {progress >= 75 && progress < 100 && "Identifying optimization opportunities..."}
                {progress === 100 && "Analysis complete!"}
              </span>
            </div>
          </div>
          
          {/* Log Display */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">Real-time Log</h3>
            <LogDisplay logs={logs} id="lhf-log-display" />
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button 
              id="lhf-back-to-input-btn"
              className="btn btn-outline flex items-center gap-1"
              onClick={() => goToStage(1)}
            >
              <ArrowLeft size={16} />
              <span>Back to Input</span>
            </button>
            
            <button 
              id="lhf-view-results-btn"
              className="btn btn-primary flex items-center gap-1"
              style={{ display: progress === 100 ? "flex" : "none" }}
              onClick={() => goToStage(3)}
            >
              <span>View Results</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Results Stage */}
      {currentStage === 3 && (
        <div id="lhf-results-content">
          <h2 className="text-xl font-semibold mb-4">Low Hanging Fruits Identified</h2>
          
          {/* Product Results */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Low Hanging Product Fruits</h3>
              <ModuleOutputActions
                moduleType="lhf"
                outputType="product"
                onExportResults={handleExportProductResults}
              />
            </div>
            
            <DataTable 
              id="lhf-product-results-table"
              data={productResults} 
              columns={[
                { key: 'name', label: 'Product Name' },
                { key: 'urlSlug', label: 'URL Slug' },
                { key: 'topQuery', label: 'Top Query' },
                { key: 'clicks', label: 'Clicks' },
                { key: 'impressions', label: 'Impressions' },
                { key: 'position', label: 'Avg. Position' },
                { key: 'ctr', label: 'CTR' }
              ]} 
            />
          </div>
          
          {/* PLP Results */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Low Hanging PLP Fruits</h3>
              <ModuleOutputActions
                moduleType="lhf"
                outputType="plp"
                onExportResults={handleExportPlpResults}
              />
            </div>
            
            <DataTable 
              id="lhf-plp-results-table"
              data={plpResults} 
              columns={[
                { key: 'name', label: 'PLP Name' },
                { key: 'urlSlug', label: 'URL Slug' },
                { key: 'pageType', label: 'Page Type' },
                { key: 'primaryKeyword', label: 'Primary Keyword' },
                { key: 'secondaryKeywords', label: 'Secondary Keywords' },
                { key: 'clicks', label: 'Clicks' },
                { key: 'impressions', label: 'Impressions' }
              ]} 
            />
          </div>
          
          {/* Start New Analysis Button */}
          <div className="flex justify-center mt-6">
            <button 
              className="btn btn-outline"
              onClick={resetAnalysis}
            >
              Start New LHF Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowHangingFruits;
