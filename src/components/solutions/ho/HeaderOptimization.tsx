
import React, { useState, useEffect } from "react";
import ToolViewHeader from "../../common/ToolViewHeader";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import { simulateProcessing } from "../../../utils/utils";
import { toast } from "@/components/ui/sonner";
import { Copy, Check } from "lucide-react";

const HeaderOptimization: React.FC = () => {
  // File upload states
  const [newCollectionsFile, setNewCollectionsFile] = useState<File | null>(null);
  const [wellPerformingFile, setWellPerformingFile] = useState<File | null>(null);
  const [finalOutputFile, setFinalOutputFile] = useState<File | null>(null);
  const [competitorsFile, setCompetitorsFile] = useState<File | null>(null);
  
  // UI states
  const [currentSection, setCurrentSection] = useState<"input" | "processing" | "output">("input");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  // Output mock data
  const [siteStructure, setSiteStructure] = useState<string>("");
  const [clusteredCollections, setClusteredCollections] = useState<string>("");

  // Check if all files are uploaded for proceeding
  const areAllFilesUploaded = !!newCollectionsFile && !!wellPerformingFile && 
                              !!finalOutputFile && !!competitorsFile;

  useEffect(() => {
    // Enable/disable the Start Optimization button based on file uploads
    const button = document.getElementById("ho-start-optimization-btn");
    if (button) {
      if (areAllFilesUploaded) {
        button.removeAttribute("disabled");
        button.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        button.setAttribute("disabled", "true");
        button.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }, [areAllFilesUploaded]);

  // File handlers
  const handleNewCollectionsChange = (file: File | null) => {
    setNewCollectionsFile(file);
  };
  
  const handleWellPerformingChange = (file: File | null) => {
    setWellPerformingFile(file);
  };
  
  const handleFinalOutputChange = (file: File | null) => {
    setFinalOutputFile(file);
  };
  
  const handleCompetitorsChange = (file: File | null) => {
    setCompetitorsFile(file);
  };

  // Start optimization process
  const startOptimization = () => {
    if (!areAllFilesUploaded) {
      toast.error("Please upload all required files first.");
      return;
    }
    
    setCurrentSection("processing");
    setProgress(0);
    setLogs([]);
    
    simulateProcessing(
      (currentProgress) => {
        setProgress(currentProgress);
        
        if (currentProgress === 100) {
          // Generate mock output data
          generateMockOutput();
          // Show output section
          setTimeout(() => {
            setCurrentSection("output");
          }, 500);
        }
      },
      (message) => {
        setLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("Header optimization completed successfully!");
      },
      12000 // 12 seconds for the whole process
    );
  };

  // Generate mock output
  const generateMockOutput = () => {
    // Mock optimized site structure output
    const mockStructure = `
# Optimized Site Structure

## Main Navigation
1. Women
   - Clothing
     - Dresses
     - Tops
     - Bottoms
     - Outerwear
   - Accessories
     - Jewelry
     - Bags
     - Shoes
   - Collections
     - Summer Essentials
     - Office Attire
     - Casual Basics

2. Men
   - Clothing
     - Shirts
     - Pants
     - Suits
     - Outerwear
   - Accessories
     - Watches
     - Bags
     - Shoes
   - Collections
     - Active Sportswear
     - Business Casual

3. Kids
   - Girls
     - Dresses
     - Tops
     - Bottoms
   - Boys
     - Shirts
     - Pants
     - Outerwear
   - Collections
     - Back to School
     - Kids Playground

4. Home
   - Living Room
   - Bedroom
   - Kitchen
   - Bath

5. Sale
   - Women's Sale
   - Men's Sale
   - Kids' Sale
   - Home Sale

## Footer Navigation
- About Us
- Contact
- Shipping & Returns
- FAQ
- Terms & Conditions
- Privacy Policy
`;

    // Mock clustered collections sheet preview
    const mockClusteredCollections = `
COLLECTION_NAME,PARENT_CATEGORY,URL,META_TITLE,META_DESCRIPTION,IS_NEW
Summer Essentials,Women,/collections/summer-essentials,Summer Essentials Collection | Brand Name,Discover our curated Summer Essentials collection featuring lightweight fabrics and breathable styles for the warm season.,TRUE
Office Attire,Women,/collections/office-attire,Professional Office Attire | Brand Name,Elevate your work wardrobe with our Office Attire collection designed for comfort and professionalism.,TRUE
Casual Basics,Women,/collections/casual-basics,Everyday Casual Basics | Brand Name,Build your wardrobe foundation with our timeless Casual Basics collection for everyday style.,TRUE
Active Sportswear,Men,/collections/active-sportswear,Performance Active Sportswear | Brand Name,Engineered for performance: discover our Active Sportswear collection for your workout needs.,TRUE
Business Casual,Men,/collections/business-casual,Men's Business Casual Collection | Brand Name,Perfect the smart-casual look with our Business Casual collection for the modern professional.,TRUE
Back to School,Kids,/collections/back-to-school,Back to School Collection for Kids | Brand Name,Get them ready for the new school year with our durable and stylish Back to School collection.,TRUE
Kids Playground,Kids,/collections/kids-playground,Kids Playground Collection | Brand Name,Designed for active play and adventure: explore our Kids Playground collection.,TRUE
`;

    setSiteStructure(mockStructure);
    setClusteredCollections(mockClusteredCollections);
  };

  // Copy JS snippet to clipboard
  const copyJsSnippet = () => {
    const snippet = `// Header Navigation Implementation
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mega menu
  const megaMenu = new MegaMenu({
    container: '#main-navigation',
    breakpoint: 1024,
    openOnHover: true,
    animationDuration: 250
  });
  
  // Apply optimized structure
  megaMenu.render();
});`;

    navigator.clipboard.writeText(snippet).then(() => {
      setIsCopied(true);
      toast.success("Snippet copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy snippet. Please try again.");
    });
  };

  // Reset to input section
  const resetToInput = () => {
    setCurrentSection("input");
    setNewCollectionsFile(null);
    setWellPerformingFile(null);
    setFinalOutputFile(null);
    setCompetitorsFile(null);
    setProgress(0);
    setLogs([]);
    setSiteStructure("");
    setClusteredCollections("");
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="ho" 
        solutionName="Header Optimization" 
      />

      {/* Input Section */}
      {currentSection === "input" && (
        <div id="ho-input-content">
          <h2 className="text-xl font-semibold mb-4">Input Data for Header Optimization</h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
            <p>Please upload all required files to optimize your site header structure.</p>
          </div>
          
          {/* New Collections File */}
          <FileUpload 
            id="ho-file-new-collections"
            statusId="status-ho-new-collections"
            acceptedTypes={[".csv", ".xlsx"]}
            label="1. New Collections to Add sheet"
            onFileChange={handleNewCollectionsChange}
            downloadTemplateLink="#template-new-collections"
          />
          
          {/* Well-Performing Categories */}
          <FileUpload 
            id="ho-file-well-performing"
            statusId="status-ho-well-performing"
            acceptedTypes={[".csv", ".xlsx"]}
            label="2. Well-Performing Categories/Brand sheet"
            onFileChange={handleWellPerformingChange}
            downloadTemplateLink="#template-well-performing"
          />
          
          {/* Final Output */}
          <FileUpload 
            id="ho-file-final-output"
            statusId="status-ho-final-output"
            acceptedTypes={[".csv", ".xlsx"]}
            label="3. Final Output sheet (Collections to be renamed/kept)"
            onFileChange={handleFinalOutputChange}
            downloadTemplateLink="#template-final-output"
          />
          
          {/* Competitors */}
          <FileUpload 
            id="ho-file-competitors"
            statusId="status-ho-competitors"
            acceptedTypes={[".csv", ".xlsx"]}
            label="4. Competitors/Client Site sheet"
            onFileChange={handleCompetitorsChange}
            downloadTemplateLink="#template-competitors"
          />
          
          {/* Start Button */}
          <div className="flex justify-end mt-6">
            <button 
              id="ho-start-optimization-btn"
              className="btn btn-primary flex items-center gap-1 opacity-50 cursor-not-allowed"
              disabled={!areAllFilesUploaded}
              onClick={startOptimization}
            >
              Start Optimization Process →
            </button>
          </div>
        </div>
      )}
      
      {/* Processing Section */}
      {currentSection === "processing" && (
        <div id="ho-processing-content">
          <h2 className="text-xl font-semibold mb-4">Processing Header Optimization</h2>
          
          <div className="card">
            <h3 className="text-lg font-medium mb-3">Overall Progress</h3>
            
            <ProgressBar progress={progress} id="ho-overall-progress" />
            
            <div className="flex justify-between text-sm mt-1">
              <span>Progress: {progress}%</span>
              <span id="ho-process-status">
                {progress < 30 && "Reading input files..."}
                {progress >= 30 && progress < 60 && "Generating optimized site structure (AI Step)..."}
                {progress >= 60 && progress < 90 && "Clustering collections by category..."}
                {progress >= 90 && progress < 100 && "Finalizing results..."}
                {progress === 100 && "Processing complete!"}
              </span>
            </div>
            
            <div className="mt-4">
              <LogDisplay logs={logs} id="ho-log-display" />
            </div>
          </div>
        </div>
      )}
      
      {/* Output Section */}
      {currentSection === "output" && (
        <div id="ho-output-content">
          <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
          
          {/* Optimized Structure */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">Optimized Recommended Site Structure</h3>
            <div 
              id="ho-optimized-structure-output" 
              className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm overflow-x-auto whitespace-pre-line"
            >
              {siteStructure}
            </div>
          </div>
          
          {/* Clustered Collections */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Clustered Collections Sheet</h3>
              <button className="btn btn-sm btn-outline">Download CSV</button>
            </div>
            <div 
              id="ho-clustered-collections-output" 
              className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm overflow-x-auto whitespace-pre-line"
            >
              {clusteredCollections}
            </div>
          </div>
          
          {/* JavaScript Snippet */}
          <div className="card">
            <h3 className="text-lg font-medium mb-3">Implementation JavaScript Snippet</h3>
            <div className="relative">
              <pre className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm overflow-x-auto">
{`// Header Navigation Implementation
document.addEventListener('DOMContentLoaded', function() {
  // Initialize mega menu
  const megaMenu = new MegaMenu({
    container: '#main-navigation',
    breakpoint: 1024,
    openOnHover: true,
    animationDuration: 250
  });
  
  // Apply optimized structure
  megaMenu.render();
});`}
              </pre>
              <button 
                onClick={copyJsSnippet}
                className="absolute top-2 right-2 p-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
                title="Copy to clipboard"
              >
                {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
          
          {/* Button */}
          <div className="flex justify-center mt-6">
            <button 
              className="btn btn-outline flex items-center gap-1"
              onClick={resetToInput}
            >
              ← Back to Input / Start New
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderOptimization;
