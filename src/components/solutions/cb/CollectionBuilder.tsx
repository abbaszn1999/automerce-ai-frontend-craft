
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import ToolViewHeader from "../../common/ToolViewHeader";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import DataTable from "../../ui/DataTable";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { simulateProcessing } from "../../../utils/utils";
import { toast } from "@/components/ui/use-toast";
import SaveToFeedButton from "../../common/SaveToFeedButton";

const CollectionBuilder: React.FC = () => {
  const { cbCurrentStage, setCbCurrentStage } = useAppContext();
  
  // Convert cbCurrentStage to number for proper comparisons
  const currentStage = typeof cbCurrentStage === 'string' ? parseInt(cbCurrentStage, 10) : cbCurrentStage || 1;
  
  // File upload states
  const [productFeedFile, setProductFeedFile] = useState<File | null>(null);
  const [keywordsFile, setKeywordsFile] = useState<File | null>(null);
  const [performanceFile, setPerformanceFile] = useState<File | null>(null);
  const [mappedColumn, setMappedColumn] = useState("");
  
  // Processing states
  const [process1Progress, setProcess1Progress] = useState(0);
  const [process1Logs, setProcess1Logs] = useState<string[]>([]);
  const [process1Complete, setProcess1Complete] = useState(false);
  
  // Mock data states
  const [potentialCollections, setPotentialCollections] = useState<any[]>([]);
  const [wellPerformingCategories, setWellPerformingCategories] = useState<any[]>([]);
  const [underperformingCategories, setUnderperformingCategories] = useState<any[]>([]);
  const [replacementSuggestions, setReplacementSuggestions] = useState<any[]>([]);
  const [approvedReplacements, setApprovedReplacements] = useState<any[]>([]);

  // Stage navigation
  const goToStage = (stage: number) => {
    // Only allow moving forward one stage at a time or backward from any stage
    if (stage > currentStage && stage !== currentStage + 1) {
      toast({
        title: "Error",
        description: "Please complete the current stage first."
      });
      return;
    }
    
    setCbCurrentStage(stage.toString());
    
    // If moving to stage 3, simulate process1
    if (stage === 3 && currentStage === 2) {
      startCollectionAnalysis();
    } 
    
    // If moving to stage 4, generate performance data
    if (stage === 4) {
      generateMockPerformanceData();
    }
    
    // If moving to stage 5, generate replacement suggestions
    if (stage === 5) {
      generateMockReplacements();
    }
    
    // If moving to stage 6, process approved replacements
    if (stage === 6) {
      processApprovedReplacements();
    }
  };

  // Check if all files are uploaded for proceeding to analysis
  useEffect(() => {
    const allUploaded = productFeedFile && keywordsFile && performanceFile;
    const startButton = document.getElementById("cb-start-analysis-btn");
    if (startButton) {
      if (allUploaded) {
        startButton.removeAttribute("disabled");
        startButton.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        startButton.setAttribute("disabled", "true");
        startButton.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }, [productFeedFile, keywordsFile, performanceFile]);

  // Handle file uploads
  const handleProductFeedChange = (file: File | null) => {
    setProductFeedFile(file);
  };
  
  const handleKeywordsChange = (file: File | null) => {
    setKeywordsFile(file);
  };
  
  const handlePerformanceChange = (file: File | null) => {
    setPerformanceFile(file);
  };

  // Simulate collection analysis process
  const startCollectionAnalysis = () => {
    // Reset states
    setProcess1Progress(0);
    setProcess1Logs([]);
    setProcess1Complete(false);
    setPotentialCollections([]);
    
    simulateProcessing(
      (progress) => {
        setProcess1Progress(progress);
        if (progress === 100) {
          setProcess1Complete(true);
          generateMockCollections();
          
          // Enable the next button
          const nextButton = document.getElementById("cb-goto-process2-btn");
          if (nextButton) {
            nextButton.removeAttribute("disabled");
            nextButton.classList.remove("opacity-50", "cursor-not-allowed");
          }
        }
      },
      (message) => {
        setProcess1Logs(prev => [...prev, message]);
      },
      () => {
        toast({
          title: "Success",
          description: "Collection analysis completed successfully!"
        });
      },
      10000
    );
  };

  // Generate mock data
  const generateMockCollections = () => {
    const mockCollections = [
      { name: "Summer Essentials", keywords: "summer clothing, beach wear, summer fashion", matchingProducts: 24, searchVolume: 8500 },
      { name: "Office Attire", keywords: "business casual, office clothes, professional wear", matchingProducts: 36, searchVolume: 6200 },
      { name: "Winter Collection", keywords: "winter coats, scarves, winter fashion", matchingProducts: 18, searchVolume: 5400 },
      { name: "Active Sportswear", keywords: "gym clothes, workout gear, sports apparel", matchingProducts: 42, searchVolume: 7800 },
      { name: "Evening Wear", keywords: "formal dresses, evening gowns, tuxedo", matchingProducts: 15, searchVolume: 4100 },
      { name: "Casual Basics", keywords: "t-shirts, jeans, casual clothing", matchingProducts: 56, searchVolume: 9300 },
      { name: "Kids Playground", keywords: "children's play clothes, kids outdoor wear", matchingProducts: 28, searchVolume: 3600 },
      { name: "Sustainable Fashion", keywords: "eco-friendly clothing, sustainable fashion", matchingProducts: 21, searchVolume: 4800 }
    ];
    
    setPotentialCollections(mockCollections);
  };
  
  const generateMockPerformanceData = () => {
    const wellPerforming = [
      { name: "Summer Dresses", metrics: "CTR: 4.2%, Conv Rate: 2.8%", revenue: "$24,560" },
      { name: "Men's Sneakers", metrics: "CTR: 3.8%, Conv Rate: 3.1%", revenue: "$31,240" },
      { name: "Women's Activewear", metrics: "CTR: 4.5%, Conv Rate: 2.5%", revenue: "$19,780" },
      { name: "Designer Watches", metrics: "CTR: 3.6%, Conv Rate: 4.2%", revenue: "$45,620" }
    ];
    
    const underperforming = [
      { name: "Winter Accessories", metrics: "CTR: 1.2%, Conv Rate: 0.8%", revenue: "$5,390" },
      { name: "Formal Suits", metrics: "CTR: 1.5%, Conv Rate: 1.1%", revenue: "$8,720" },
      { name: "Kids' Pajamas", metrics: "CTR: 1.8%, Conv Rate: 0.7%", revenue: "$3,450" },
      { name: "Home Decor", metrics: "CTR: 1.3%, Conv Rate: 0.5%", revenue: "$2,890" }
    ];
    
    setWellPerformingCategories(wellPerforming);
    setUnderperformingCategories(underperforming);
  };
  
  const generateMockReplacements = () => {
    const replacements = [
      { 
        underperforming: "Winter Accessories", 
        replacements: "Winter Essentials, Cold Weather Gear", 
        reason: "Broader appeal, higher search volume",
        approved: false
      },
      { 
        underperforming: "Formal Suits", 
        replacements: "Professional Attire, Business Wear", 
        reason: "More inclusive terminology, matches search trends",
        approved: false
      },
      { 
        underperforming: "Kids' Pajamas", 
        replacements: "Children's Sleepwear, Kids' Bedtime Collection", 
        reason: "Expanded product range, aligns with search intent",
        approved: false
      },
      { 
        underperforming: "Home Decor", 
        replacements: "Home Accents, Interior Styling", 
        reason: "Modern terminology, matches higher-performing keywords",
        approved: false
      }
    ];
    
    setReplacementSuggestions(replacements);
  };
  
  const handleApprovalChange = (index: number, approved: boolean) => {
    const updatedSuggestions = [...replacementSuggestions];
    updatedSuggestions[index].approved = approved;
    setReplacementSuggestions(updatedSuggestions);
  };
  
  const processApprovedReplacements = () => {
    const approved = replacementSuggestions.filter(item => item.approved);
    setApprovedReplacements(approved);
    
    toast.success(`${approved.length} replacements approved for processing.`);
  };

  // Stage components
  const renderSetupStage = () => (
    <div id="cb-setup-content">
      <h2 className="text-xl font-semibold mb-4">Collection Builder Setup</h2>
      
      {/* API Keys */}
      <div className="card">
        <h3 className="text-lg font-medium mb-3">API Keys</h3>
        <div>
          <label htmlFor="openai-api-key-cb" className="block text-sm font-medium mb-1">OpenAI API Key</label>
          <input type="password" id="openai-api-key-cb" className="w-full p-2 border rounded" placeholder="Enter your OpenAI API key" />
        </div>
      </div>
      
      {/* Parameters */}
      <div className="card">
        <h3 className="text-lg font-medium mb-3">Parameters</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="max-collections" className="block text-sm font-medium mb-1">Max New Collections to Suggest</label>
            <input type="number" id="max-collections" className="w-full p-2 border rounded" defaultValue="50" />
          </div>
          <div>
            <label htmlFor="min-products" className="block text-sm font-medium mb-1">Minimum Products Per New Collection</label>
            <input type="number" id="min-products" className="w-full p-2 border rounded" defaultValue="5" />
          </div>
          <div>
            <label htmlFor="keyword-source" className="block text-sm font-medium mb-1">Keyword Source for Analysis</label>
            <select id="keyword-source" className="w-full p-2 border rounded">
              <option>Search Console Data</option>
              <option>Product Feed Analysis</option>
              <option>Both</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end mt-6">
        <button 
          className="btn btn-primary flex items-center gap-1"
          onClick={() => goToStage(2)}
        >
          <span>Save & Proceed to Input</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
  
  const renderInputStage = () => (
    <div id="cb-input-content">
      <h2 className="text-xl font-semibold mb-4">Input Required Data Sheets</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
        <p>Please upload the following data files to begin the collection building process.</p>
      </div>
      
      {/* Product Feed */}
      <FileUpload 
        id="cb-file-product-feed"
        statusId="status-feed"
        acceptedTypes={[".csv", ".xlsx"]}
        label="1. Product Feed"
        requiredColumns={["Name", "URL Slug", "Description", "Short description", "Featured Image", "record_id"]}
        onFileChange={handleProductFeedChange}
        downloadTemplateLink="#template-feed"
        mapColumn={true}
      />
      
      {/* Keywords */}
      <FileUpload 
        id="cb-file-keywords"
        statusId="status-keywords"
        acceptedTypes={[".csv", ".xlsx"]}
        label="2. Search Console Data (Keywords)"
        onFileChange={handleKeywordsChange}
        downloadTemplateLink="#template-keywords"
      />
      
      {/* Performance */}
      <FileUpload 
        id="cb-file-performance"
        statusId="status-performance"
        acceptedTypes={[".csv", ".xlsx"]}
        label="3. Category Performance Data"
        onFileChange={handlePerformanceChange}
        downloadTemplateLink="#template-performance"
      />
      
      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline flex items-center gap-1"
          onClick={() => goToStage(1)}
        >
          <ArrowLeft size={16} />
          <span>Back to Setup</span>
        </button>
        <button 
          id="cb-start-analysis-btn"
          className="btn btn-primary flex items-center gap-1 opacity-50 cursor-not-allowed"
          disabled
          onClick={() => goToStage(3)}
        >
          <span>Start Collection Analysis</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
  
  const renderProcess1Stage = () => (
    <div id="cb-process1-content">
      <h2 className="text-xl font-semibold mb-4">Process 1: Collection Analysis</h2>
      
      {/* Progress */}
      <div className="card">
        <h3 className="text-lg font-medium mb-3">Analyzing Keywords & Product Data</h3>
        <ProgressBar progress={process1Progress} id="cb-process1-progress" />
        <div className="text-sm mt-1">Progress: {process1Progress}%</div>
        
        <div className="mt-4">
          <h4 className="text-base font-medium mb-2">Process Log</h4>
          <LogDisplay logs={process1Logs} id="cb-process1-log" />
        </div>
      </div>
      
      {/* Results */}
      {potentialCollections.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-3">Preliminary Results: Potential New Collections</h3>
          <DataTable 
            data={potentialCollections} 
            columns={[
              { key: 'name', label: 'Potential Collection Name' },
              { key: 'keywords', label: 'Based on Keywords' },
              { key: 'matchingProducts', label: 'Matching Products' },
              { key: 'searchVolume', label: 'Est. Search Volume' }
            ]} 
          />
        </div>
      )}
      
      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline flex items-center gap-1"
          onClick={() => goToStage(2)}
        >
          <ArrowLeft size={16} />
          <span>Back to Input</span>
        </button>
        <button 
          id="cb-goto-process2-btn"
          className="btn btn-primary flex items-center gap-1 opacity-50 cursor-not-allowed"
          disabled={!process1Complete}
          onClick={() => goToStage(4)}
        >
          <span>Proceed to Performance Analysis</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
  
  const renderProcess2Stage = () => (
    <div id="cb-process2-content">
      <h2 className="text-xl font-semibold mb-4">Process 2: Performance Analysis</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
        <p>Analysis of your current collection performance. This data will inform the collection replacement strategy.</p>
      </div>
      
      <div className="split-view">
        {/* Well Performing */}
        <div className="card" id="cb-well-performing">
          <h3 className="text-lg font-medium mb-3">Well-Performing Categories</h3>
          <ul className="divide-y">
            {wellPerformingCategories.map((category, index) => (
              <li key={index} className="py-3">
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-gray-500">{category.metrics}</div>
                <div className="text-sm text-green-600 font-medium mt-1">Revenue: {category.revenue}</div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Underperforming */}
        <div className="card" id="cb-underperforming">
          <h3 className="text-lg font-medium mb-3">Underperforming / Cannibalizing</h3>
          <ul className="divide-y">
            {underperformingCategories.map((category, index) => (
              <li key={index} className="py-3">
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-gray-500">{category.metrics}</div>
                <div className="text-sm text-red-600 font-medium mt-1">Revenue: {category.revenue}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline flex items-center gap-1"
          onClick={() => goToStage(3)}
        >
          <ArrowLeft size={16} />
          <span>Back to Collection Analysis</span>
        </button>
        <button 
          className="btn btn-primary flex items-center gap-1"
          onClick={() => goToStage(5)}
        >
          <span>Proceed to Replacement Optimization</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
  
  const renderProcess3Stage = () => (
    <div id="cb-process3-content">
      <h2 className="text-xl font-semibold mb-4">Process 3: Replacement Optimization</h2>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
        <p>Review and approve suggested replacements for underperforming collections.</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-3">Suggested Replacements</h3>
        <div className="overflow-x-auto">
          <table className="data-table" id="cb-replacements-table">
            <thead>
              <tr>
                <th>Underperforming Category</th>
                <th>Suggested Replacement(s)</th>
                <th>Reason</th>
                <th>Approve?</th>
              </tr>
            </thead>
            <tbody>
              {replacementSuggestions.map((item, index) => (
                <tr key={index}>
                  <td>{item.underperforming}</td>
                  <td>{item.replacements}</td>
                  <td>{item.reason}</td>
                  <td>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.approved}
                        onChange={(e) => handleApprovalChange(index, e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline flex items-center gap-1"
          onClick={() => goToStage(4)}
        >
          <ArrowLeft size={16} />
          <span>Back to Performance Analysis</span>
        </button>
        <button 
          className="btn btn-primary flex items-center gap-1"
          onClick={() => goToStage(6)}
        >
          <span>Finalize and View Results</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
  
  const renderResultsStage = () => (
    <div id="cb-results-content">
      <h2 className="text-xl font-semibold mb-4">Collection Builder Results</h2>
      
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 text-green-700 flex items-start gap-2">
        <Check className="h-5 w-5 mt-0.5" />
        <p>Collection building process completed successfully. The suggested collections and replacements are ready for implementation.</p>
      </div>
      
      <div className="results-grid">
        {/* New Collections */}
        <div className="card">
          <h3 className="text-lg font-medium mb-3">New Collections to Add</h3>
          <div className="text-3xl font-bold text-primary mb-3">{potentialCollections.length}</div>
          <ul className="text-sm divide-y max-h-40 overflow-y-auto mb-3">
            {potentialCollections.map((collection, index) => (
              <li key={index} className="py-1.5">{collection.name}</li>
            ))}
          </ul>
          <div className="space-y-2">
            <button className="btn btn-sm btn-outline w-full">Export List</button>
            <SaveToFeedButton 
              feedType="plp"
              source="cb"
              variant="outline"
              size="sm"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Replacements */}
        <div className="card">
          <h3 className="text-lg font-medium mb-3">Replacements Approved</h3>
          <div className="text-3xl font-bold text-primary mb-3">{approvedReplacements.length}</div>
          <ul className="text-sm divide-y max-h-40 overflow-y-auto mb-3">
            {approvedReplacements.map((replacement, index) => (
              <li key={index} className="py-1.5">
                {replacement.underperforming} → {replacement.replacements.split(',')[0]}
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <button className="btn btn-sm btn-outline w-full">Export List</button>
            <SaveToFeedButton 
              feedType="plp"
              source="cb"
              variant="outline"
              size="sm"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Updated Product Feed */}
        <div className="card">
          <h3 className="text-lg font-medium mb-3">Updated Product Feed</h3>
          <div className="text-3xl font-bold text-primary mb-3">
            {Math.floor(Math.random() * 500) + 500} Products
          </div>
          <div className="space-y-2">
            <button className="btn btn-sm btn-outline w-full">Download Updated Feed</button>
            <SaveToFeedButton 
              feedType="product"
              source="cb"
              variant="outline"
              size="sm"
              className="w-full"
            />
            <button className="btn btn-sm btn-primary w-full">Push to CMS</button>
          </div>
        </div>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          className="btn btn-outline flex items-center gap-1"
          onClick={() => goToStage(5)}
        >
          <ArrowLeft size={16} />
          <span>Back to Optimization</span>
        </button>
        <button 
          className="btn btn-outline"
          onClick={() => {
            // Reset the process and go back to stage 1
            setCbCurrentStage(1);
            
            // Reset all state
            setProductFeedFile(null);
            setKeywordsFile(null);
            setPerformanceFile(null);
            setProcess1Progress(0);
            setProcess1Logs([]);
            setPotentialCollections([]);
            setWellPerformingCategories([]);
            setUnderperformingCategories([]);
            setReplacementSuggestions([]);
            setApprovedReplacements([]);
          }}
        >
          Start New Collection Build
        </button>
      </div>
    </div>
  );
  
  // Stage indicator component
  const renderStageIndicator = () => {
    const stages = [
      { num: 1, name: "Setup" },
      { num: 2, name: "Input Data" },
      { num: 3, name: "Collection Analysis" },
      { num: 4, name: "Performance Analysis" },
      { num: 5, name: "Replacement Optimization" },
      { num: 6, name: "Results" }
    ];
    
    return (
      <div id="cb-stages" className="mb-8">
        <div className="flex flex-wrap gap-2">
          {stages.map((stage, index) => {
            const isActive = currentStage === stage.num;
            const isCompleted = currentStage > stage.num;
            const isPending = currentStage < stage.num;
            
            const stageClass = isActive ? "stage-active" : isCompleted ? "stage-completed" : "stage-pending";
            
            return (
              <div key={stage.num} className="relative">
                <div 
                  className={`stage-item ${stageClass} cursor-pointer`}
                  onClick={() => goToStage(stage.num)}
                >
                  <div className="stage-number">{stage.num}</div>
                  <div className="stage-label">{stage.name}</div>
                </div>
                {index < stages.length - 1 && (
                  <div className={`stage-line ${isCompleted ? "bg-green-500" : "bg-gray-200"}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="cb" 
        solutionName="Collection Builder" 
      />

      {/* Stage Indicator */}
      {renderStageIndicator()}

      {/* Stage Content */}
      {currentStage === 1 && renderSetupStage()}
      {currentStage === 2 && renderInputStage()}
      {currentStage === 3 && renderProcess1Stage()}
      {currentStage === 4 && renderProcess2Stage()}
      {currentStage === 5 && renderProcess3Stage()}
      {currentStage === 6 && renderResultsStage()}
    </div>
  );
};

export default CollectionBuilder;
