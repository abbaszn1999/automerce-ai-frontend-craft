
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import ToolViewHeader from "../../common/ToolViewHeader";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import DataTable from "../../ui/DataTable";
import { simulateProcessing, copyToClipboard } from "../../../utils/utils";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, Copy, Check } from "lucide-react";

const InternalLinks: React.FC = () => {
  const { ilCurrentSubTab, setIlCurrentSubTab } = useAppContext();
  
  // PLP Internal Linking states
  const [plpSection, setPlpSection] = useState<"input" | "processing" | "output">("input");
  const [plpFile, setPlpFile] = useState<File | null>(null);
  const [plpProgress, setPlpProgress] = useState(0);
  const [plpLogs, setPlpLogs] = useState<string[]>([]);
  const [plpContextualLinks, setPlpContextualLinks] = useState<any[]>([]);
  const [plpWidgetLinks, setPlpWidgetLinks] = useState<any[]>([]);
  const [isJsSnippetCopied, setIsJsSnippetCopied] = useState(false);
  
  // Product Internal Linking states
  const [productSection, setProductSection] = useState<"input" | "processing" | "output">("input");
  const [productFeedFile, setProductFeedFile] = useState<File | null>(null);
  const [targetPagesFile, setTargetPagesFile] = useState<File | null>(null);
  const [productProgress, setProductProgress] = useState(0);
  const [productLogs, setProductLogs] = useState<string[]>([]);
  const [productLinks, setProductLinks] = useState<any[]>([]);

  // Switch between subtabs
  const goToSubTab = (tabId: "plp" | "product") => {
    setIlCurrentSubTab(tabId);
  };

  // PLP File handler
  const handlePlpFileChange = (file: File | null) => {
    setPlpFile(file);
  };

  // Product File handlers
  const handleProductFeedChange = (file: File | null) => {
    setProductFeedFile(file);
  };
  
  const handleTargetPagesChange = (file: File | null) => {
    setTargetPagesFile(file);
  };

  // Start PLP Internal Link Boosting
  const startPlpLinkBoosting = () => {
    if (!plpFile) {
      toast.error("Please upload the PLP data sheet first.");
      return;
    }
    
    setPlpSection("processing");
    setPlpProgress(0);
    setPlpLogs([]);
    
    simulateProcessing(
      (progress) => {
        setPlpProgress(progress);
        
        if (progress === 100) {
          // Generate mock results
          generatePlpResults();
          
          // Show output section
          setTimeout(() => {
            setPlpSection("output");
          }, 500);
        }
      },
      (message) => {
        setPlpLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("PLP internal link boosting completed!");
      },
      8000
    );
  };

  // Generate mock PLP results
  const generatePlpResults = () => {
    // Contextual links
    const contextualLinks = [
      {
        pageName: "Women's Dresses",
        url: "/collections/womens-dresses",
        pageType: "Collection",
        suggestedLinks: "Summer Dresses, Casual Dresses, Evening Dresses",
        reason: "Keyword relevance and complementary product categories"
      },
      {
        pageName: "Men's Shoes",
        url: "/collections/mens-shoes",
        pageType: "Collection",
        suggestedLinks: "Men's Sneakers, Men's Formal Shoes, Men's Boots",
        reason: "Sub-category linking improves navigation and SEO"
      },
      {
        pageName: "Home Decor",
        url: "/collections/home-decor",
        pageType: "Collection",
        suggestedLinks: "Living Room Decor, Bedroom Decor, Kitchen Accessories",
        reason: "Room-specific categorization improves user experience"
      },
      {
        pageName: "Summer Sale",
        url: "/collections/summer-sale",
        pageType: "Sale",
        suggestedLinks: "Women's Summer Collection, Men's Summer Collection, Beach Accessories",
        reason: "Seasonal relevance and increased conversion opportunity"
      }
    ];
    
    // Widget links
    const widgetLinks = [
      {
        pageName: "Women's Dresses",
        url: "/collections/womens-dresses",
        pageType: "Collection",
        relatedPages: "Women's Tops, Women's Accessories, Women's Shoes",
        reason: "Cross-category promotion increases AOV"
      },
      {
        pageName: "Men's Shoes",
        url: "/collections/mens-shoes",
        pageType: "Collection",
        relatedPages: "Men's Socks, Men's Pants, Men's Accessories",
        reason: "Related items completion increases conversion rate"
      },
      {
        pageName: "Home Decor",
        url: "/collections/home-decor",
        pageType: "Collection",
        relatedPages: "Furniture, Lighting, Home Textiles",
        reason: "Home category completion increases discovery"
      },
      {
        pageName: "Summer Sale",
        url: "/collections/summer-sale",
        pageType: "Sale",
        relatedPages: "New Arrivals, Clearance, Gift Cards",
        reason: "Strategic promotion of high-margin categories"
      }
    ];
    
    setPlpContextualLinks(contextualLinks);
    setPlpWidgetLinks(widgetLinks);
  };

  // Handle JS snippet copy
  const handleCopyJsSnippet = () => {
    const jsSnippet = `// Related Products Widget Implementation
document.addEventListener('DOMContentLoaded', function() {
  // Function to render related products widget
  function renderRelatedProductsWidget(collectionUrl, containerSelector) {
    fetch('/api/get-related-products?collection=' + encodeURIComponent(collectionUrl))
      .then(response => response.json())
      .then(data => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const heading = document.createElement('h3');
        heading.classList.add('related-products-heading');
        heading.textContent = 'You May Also Like';
        container.appendChild(heading);
        
        const productsGrid = document.createElement('div');
        productsGrid.classList.add('related-products-grid');
        
        data.products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');
          productCard.innerHTML = \`
            <a href="\${product.url}">
              <img src="\${product.image}" alt="\${product.name}">
              <div class="product-name">\${product.name}</div>
              <div class="product-price">\${product.price}</div>
            </a>
          \`;
          productsGrid.appendChild(productCard);
        });
        
        container.appendChild(productsGrid);
      });
  }
  
  // Initialize on collection pages
  const collectionUrl = window.location.pathname;
  if (collectionUrl.includes('/collections/')) {
    renderRelatedProductsWidget(collectionUrl, '#related-products-container');
  }
});`;

    copyToClipboard(jsSnippet).then((success) => {
      if (success) {
        setIsJsSnippetCopied(true);
        setTimeout(() => setIsJsSnippetCopied(false), 2000);
      }
    });
  };

  // Start Product Internal Link Boosting
  const startProductLinkBoosting = () => {
    if (!productFeedFile || !targetPagesFile) {
      toast.error("Please upload both required files first.");
      return;
    }
    
    setProductSection("processing");
    setProductProgress(0);
    setProductLogs([]);
    
    simulateProcessing(
      (progress) => {
        setProductProgress(progress);
        
        if (progress === 100) {
          // Generate mock results
          generateProductResults();
          
          // Show output section
          setTimeout(() => {
            setProductSection("output");
          }, 500);
        }
      },
      (message) => {
        setProductLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("Product internal link boosting completed!");
      },
      8000
    );
  };

  // Generate mock product results
  const generateProductResults = () => {
    const productResults = [
      {
        productName: "Men's Classic White T-Shirt",
        productUrl: "/products/mens-classic-white-tshirt",
        targetProductLinks: "Blue Jeans, Casual Jackets, Canvas Sneakers",
        targetPagesLinks: "Men's Essentials, Summer Collection",
        newDescriptions: "Our classic white t-shirt pairs perfectly with our <a href='/products/mens-blue-jeans'>Blue Jeans</a> and <a href='/products/canvas-sneakers'>Canvas Sneakers</a> for a timeless casual look."
      },
      {
        productName: "Women's Black Leather Jacket",
        productUrl: "/products/womens-black-leather-jacket",
        targetProductLinks: "Skinny Jeans, Ankle Boots, White T-Shirt",
        targetPagesLinks: "Women's Outerwear, Fall Collection",
        newDescriptions: "This premium black leather jacket is a staple in any wardrobe. Layer it over a <a href='/products/womens-white-tshirt'>White T-Shirt</a> and pair with <a href='/products/womens-skinny-jeans'>Skinny Jeans</a> for an effortless cool look."
      },
      {
        productName: "Unisex Canvas Sneakers",
        productUrl: "/products/unisex-canvas-sneakers",
        targetProductLinks: "Casual Pants, Denim Shorts, Crew Socks",
        targetPagesLinks: "Footwear Collection, Summer Essentials",
        newDescriptions: "Our versatile canvas sneakers go with everything from <a href='/products/denim-shorts'>Denim Shorts</a> to <a href='/products/casual-pants'>Casual Pants</a>. Check out our <a href='/collections/summer-essentials'>Summer Essentials</a> for more styling ideas."
      }
    ];
    
    setProductLinks(productResults);
  };

  // Reset to input sections
  const resetPlpSection = () => {
    setPlpSection("input");
    setPlpFile(null);
    setPlpProgress(0);
    setPlpLogs([]);
    setPlpContextualLinks([]);
    setPlpWidgetLinks([]);
  };
  
  const resetProductSection = () => {
    setProductSection("input");
    setProductFeedFile(null);
    setTargetPagesFile(null);
    setProductProgress(0);
    setProductLogs([]);
    setProductLinks([]);
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="il" 
        solutionName="Internal Links" 
      />

      {/* Sub-tabs Navigation */}
      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`sub-tab ${ilCurrentSubTab === "plp" ? "active" : ""}`}
            onClick={() => goToSubTab("plp")}
          >
            PLP Internal Link Boosting
          </button>
          <button
            className={`sub-tab ${ilCurrentSubTab === "product" ? "active" : ""}`}
            onClick={() => goToSubTab("product")}
          >
            Product Internal Link Boosting
          </button>
        </div>
      </div>

      {/* PLP Internal Link Boosting */}
      {ilCurrentSubTab === "plp" && (
        <div id="il-plp-content">
          {/* Input Section */}
          {plpSection === "input" && (
            <div id="il-plp-input-section">
              <h2 className="text-xl font-semibold mb-4">PLP Internal Link Boosting - Input</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
                <p>Upload your PLP data sheet to identify internal linking opportunities between collection pages.</p>
              </div>
              
              <FileUpload 
                id="il-file-plp-sheet"
                statusId="status-il-plp-sheet"
                acceptedTypes={[".csv", ".xlsx"]}
                label="1. PLP Data Sheet"
                requiredColumns={["Page Name", "Parent Categories", "Url", "Description", "Page Type", "Page Description"]}
                onFileChange={handlePlpFileChange}
                downloadTemplateLink="#template-plp"
              />
              
              <div className="flex justify-end mt-6">
                <button 
                  id="il-start-pilb-btn"
                  className={`btn btn-primary flex items-center gap-1 ${!plpFile ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!plpFile}
                  onClick={startPlpLinkBoosting}
                >
                  Start PLP Link Boosting →
                </button>
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {plpSection === "processing" && (
            <div id="il-plp-processing-section">
              <h2 className="text-xl font-semibold mb-4">Processing PLP Internal Link Boosting</h2>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-3">Analyzing PLP Link Opportunities</h3>
                <ProgressBar progress={plpProgress} id="il-pilb-progress" />
                <div className="text-sm mt-1">Progress: {plpProgress}%</div>
                
                <div className="mt-4">
                  <LogDisplay logs={plpLogs} id="il-pilb-log" />
                </div>
              </div>
            </div>
          )}
          
          {/* Output Section */}
          {plpSection === "output" && (
            <div id="il-plp-output-section">
              <h2 className="text-xl font-semibold mb-4">PLP Boosting Results</h2>
              
              {/* Contextual Links */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Contextual Links Outcome</h3>
                  <button className="btn btn-sm btn-outline">Export Results</button>
                </div>
                
                <DataTable 
                  id="il-pilb-contextual-table"
                  data={plpContextualLinks} 
                  columns={[
                    { key: 'pageName', label: 'Page Name' },
                    { key: 'url', label: 'URL' },
                    { key: 'pageType', label: 'Page Type' },
                    { key: 'suggestedLinks', label: 'Suggested Links' },
                    { key: 'reason', label: 'Reason' }
                  ]} 
                />
              </div>
              
              {/* Widget Links */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Widget Links Outcome</h3>
                  <button className="btn btn-sm btn-outline">Export Results</button>
                </div>
                
                <DataTable 
                  id="il-pilb-widget-table"
                  data={plpWidgetLinks} 
                  columns={[
                    { key: 'pageName', label: 'Page Name' },
                    { key: 'url', label: 'URL' },
                    { key: 'pageType', label: 'Page Type' },
                    { key: 'relatedPages', label: 'Related Pages (for Widget)' },
                    { key: 'reason', label: 'Reason' }
                  ]} 
                />
              </div>
              
              {/* JavaScript Snippet */}
              <div className="card">
                <h3 className="text-lg font-medium mb-3">JavaScript Snippet for Widget</h3>
                <div className="relative">
                  <textarea 
                    id="il-pilb-js-snippet"
                    className="w-full h-40 p-3 font-mono text-sm bg-gray-50 border rounded"
                    readOnly
                    defaultValue={`// Related Products Widget Implementation
document.addEventListener('DOMContentLoaded', function() {
  // Function to render related products widget
  function renderRelatedProductsWidget(collectionUrl, containerSelector) {
    fetch('/api/get-related-products?collection=' + encodeURIComponent(collectionUrl))
      .then(response => response.json())
      .then(data => {
        const container = document.querySelector(containerSelector);
        if (!container) return;
        
        const heading = document.createElement('h3');
        heading.classList.add('related-products-heading');
        heading.textContent = 'You May Also Like';
        container.appendChild(heading);
        
        const productsGrid = document.createElement('div');
        productsGrid.classList.add('related-products-grid');
        
        data.products.forEach(product => {
          const productCard = document.createElement('div');
          productCard.classList.add('product-card');
          productCard.innerHTML = \`
            <a href="\${product.url}">
              <img src="\${product.image}" alt="\${product.name}">
              <div class="product-name">\${product.name}</div>
              <div class="product-price">\${product.price}</div>
            </a>
          \`;
          productsGrid.appendChild(productCard);
        });
        
        container.appendChild(productsGrid);
      });
  }
  
  // Initialize on collection pages
  const collectionUrl = window.location.pathname;
  if (collectionUrl.includes('/collections/')) {
    renderRelatedProductsWidget(collectionUrl, '#related-products-container');
  }
});`}
                  />
                  <button
                    onClick={handleCopyJsSnippet}
                    className="absolute top-2 right-2 p-2 bg-white border rounded shadow-sm hover:bg-gray-50"
                  >
                    {isJsSnippetCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="text-center mt-2 text-sm text-gray-500">
                  Add a div with id="related-products-container" to your collection template to display the widget.
                </div>
              </div>
              
              {/* Back Button */}
              <div className="flex justify-center mt-6">
                <button 
                  className="btn btn-outline flex items-center gap-1"
                  onClick={resetPlpSection}
                >
                  <ArrowLeft size={16} />
                  <span>Back to PLP Input</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Internal Link Boosting */}
      {ilCurrentSubTab === "product" && (
        <div id="il-product-content">
          {/* Input Section */}
          {productSection === "input" && (
            <div id="il-product-input-section">
              <h2 className="text-xl font-semibold mb-4">Product Internal Link Boosting - Input</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
                <p>Upload the product feed and target pages to enhance product descriptions with strategic internal links.</p>
              </div>
              
              {/* Product Feed */}
              <FileUpload 
                id="il-file-product-feed"
                statusId="status-il-product-feed"
                acceptedTypes={[".csv", ".xlsx"]}
                label="1. Product Feed"
                requiredColumns={["Product Name", "Product URL", "Product Description", "Categories", "Sub-Categories", "Collections", "Brand"]}
                onFileChange={handleProductFeedChange}
                downloadTemplateLink="#template-product-feed"
              />
              
              {/* Target Pages Sheet */}
              <FileUpload 
                id="il-file-target-pages"
                statusId="status-il-target-pages"
                acceptedTypes={[".csv", ".xlsx"]}
                label="2. Target Pages Sheet"
                requiredColumns={["Page Name", "URL", "Page Type", "Categories", "Sub-Categories", "Brand", "Collections", "N.b Of Internal Links Needed"]}
                onFileChange={handleTargetPagesChange}
                downloadTemplateLink="#template-target-pages"
              />
              
              <div className="flex justify-end mt-6">
                <button 
                  id="il-start-pintlb-btn"
                  className={`btn btn-primary flex items-center gap-1 ${!productFeedFile || !targetPagesFile ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!productFeedFile || !targetPagesFile}
                  onClick={startProductLinkBoosting}
                >
                  Start Product Link Boosting →
                </button>
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {productSection === "processing" && (
            <div id="il-product-processing-section">
              <h2 className="text-xl font-semibold mb-4">Processing Product Internal Link Boosting</h2>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-3">Analyzing Product Link Opportunities</h3>
                <ProgressBar progress={productProgress} id="il-pintlb-progress" />
                <div className="text-sm mt-1">Progress: {productProgress}%</div>
                
                <div className="mt-4">
                  <LogDisplay logs={productLogs} id="il-pintlb-log" />
                </div>
              </div>
            </div>
          )}
          
          {/* Output Section */}
          {productSection === "output" && (
            <div id="il-product-output-section">
              <h2 className="text-xl font-semibold mb-4">Product Boosting Results</h2>
              
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Internal Linking Output</h3>
                  <button className="btn btn-sm btn-outline">Export Results</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="data-table" id="il-pintlb-output-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Product URL</th>
                        <th>Target Product Links</th>
                        <th>Target Pages Links</th>
                        <th>New Descriptions (Excerpt)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productLinks.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.productUrl}</td>
                          <td>{item.targetProductLinks}</td>
                          <td>{item.targetPagesLinks}</td>
                          <td dangerouslySetInnerHTML={{ __html: item.newDescriptions }} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Back Button */}
              <div className="flex justify-center mt-6">
                <button 
                  className="btn btn-outline flex items-center gap-1"
                  onClick={resetProductSection}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Product Input</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternalLinks;
