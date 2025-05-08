
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";
import ToolViewHeader from "../../common/ToolViewHeader";
import FileUpload from "../../ui/FileUpload";
import ProgressBar from "../../ui/ProgressBar";
import LogDisplay from "../../ui/LogDisplay";
import DataTable from "../../ui/DataTable";
import { simulateProcessing } from "../../../utils/utils";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";

const OnPageBoosting: React.FC = () => {
  const { opbCurrentSubTab, setOpbCurrentSubTab } = useAppContext();
  
  // POP (Product On-Page Boosting) states
  const [popSection, setPopSection] = useState<"input" | "processing" | "output">("input");
  const [popEnableIl, setPopEnableIl] = useState(false);
  const [popProductFeedFile, setPopProductFeedFile] = useState<File | null>(null);
  const [popPagesDetailsFile, setPopPagesDetailsFile] = useState<File | null>(null);
  const [popProgress, setPopProgress] = useState(0);
  const [popLogs, setPopLogs] = useState<string[]>([]);
  const [popResults, setPopResults] = useState<any[]>([]);
  
  // PLOP (PLP On-Page Boosting) states
  const [plopSection, setPlopSection] = useState<"input" | "processing" | "output">("input");
  const [plopEnableIl, setPlopEnableIl] = useState(false);
  const [plopSheetFile, setPlopSheetFile] = useState<File | null>(null);
  const [plopProgress, setPlopProgress] = useState(0);
  const [plopLogs, setPlopLogs] = useState<string[]>([]);
  const [plopResults, setPlopResults] = useState<any[]>([]);

  // Switch between subtabs
  const goToSubTab = (tabId: "pop" | "plop") => {
    setOpbCurrentSubTab(tabId);
  };

  // POP file handlers
  const handlePopProductFeedChange = (file: File | null) => {
    setPopProductFeedFile(file);
  };
  
  const handlePopPagesDetailsChange = (file: File | null) => {
    setPopPagesDetailsFile(file);
  };
  
  // PLOP file handler
  const handlePlopSheetChange = (file: File | null) => {
    setPlopSheetFile(file);
  };

  // Start POP (Product On-Page Boosting)
  const startPopBoosting = () => {
    if (!popProductFeedFile) {
      toast.error("Please upload the product feed file.");
      return;
    }
    
    if (popEnableIl && !popPagesDetailsFile) {
      toast.error("Pages details file is required when internal linking is enabled.");
      return;
    }
    
    setPopSection("processing");
    setPopProgress(0);
    setPopLogs([]);
    
    simulateProcessing(
      (progress) => {
        setPopProgress(progress);
        
        if (progress === 100) {
          // Generate mock results
          generatePopResults();
          
          // Show output section
          setTimeout(() => {
            setPopSection("output");
          }, 500);
        }
      },
      (message) => {
        setPopLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("Product on-page boosting completed successfully!");
      },
      8000
    );
  };
  
  // Generate mock POP results
  const generatePopResults = () => {
    const popResultsData = [
      {
        name: "Men's Classic White T-Shirt",
        url: "/products/mens-classic-white-tshirt",
        titleTag: "Classic Men's White T-Shirt | 100% Cotton | Brand Name",
        metaDescription: "Shop our premium classic men's white t-shirt made from 100% cotton. Perfect for casual wear with superior comfort and durability.",
        productDescription: popEnableIl 
          ? "Our classic white t-shirt is a wardrobe essential. Made from 100% premium cotton for superior comfort and durability. Layer it under our <a href='/products/mens-denim-jacket'>denim jacket</a> or wear it solo for a timeless casual look. Explore our <a href='/collections/mens-essentials'>Men's Essentials Collection</a> for more wardrobe staples."
          : "Our classic white t-shirt is a wardrobe essential. Made from 100% premium cotton for superior comfort and durability. Layer it under a denim jacket or wear it solo for a timeless casual look.",
        faqContent: "Q: How does this t-shirt fit?\nA: This t-shirt has a regular fit that's true to size.\n\nQ: What material is it made from?\nA: It's made from 100% premium cotton for breathability and comfort.\n\nQ: How should I care for this t-shirt?\nA: Machine wash cold with like colors and tumble dry low for best results."
      },
      {
        name: "Women's Black Leather Jacket",
        url: "/products/womens-black-leather-jacket",
        titleTag: "Women's Premium Black Leather Jacket | Brand Name",
        metaDescription: "Elevate your wardrobe with our premium women's black leather jacket. Crafted with genuine leather and featuring a modern silhouette.",
        productDescription: popEnableIl
          ? "This premium black leather jacket is crafted from genuine leather with a buttery-soft feel. Featuring a modern silhouette with zippered pockets and adjustable waist tabs for the perfect fit. Style it with our <a href='/products/womens-skinny-jeans'>skinny jeans</a> and <a href='/products/womens-ankle-boots'>ankle boots</a> for an effortlessly cool look. Check out our <a href='/collections/womens-outerwear'>Women's Outerwear Collection</a>."
          : "This premium black leather jacket is crafted from genuine leather with a buttery-soft feel. Featuring a modern silhouette with zippered pockets and adjustable waist tabs for the perfect fit. Style it with skinny jeans and ankle boots for an effortlessly cool look.",
        faqContent: "Q: Is this genuine leather?\nA: Yes, this jacket is made from 100% genuine leather.\n\nQ: How should I care for my leather jacket?\nA: We recommend professional leather cleaning only. Avoid water exposure and store on a padded hanger.\n\nQ: Does it run true to size?\nA: This jacket has a slightly fitted silhouette. If you prefer a roomier fit, we recommend sizing up."
      },
      {
        name: "Unisex Canvas Sneakers",
        url: "/products/unisex-canvas-sneakers",
        titleTag: "Unisex Canvas Sneakers | Comfortable & Stylish | Brand Name",
        metaDescription: "Step into comfort with our versatile unisex canvas sneakers. Featuring durable construction, cushioned insoles, and timeless style for any casual outfit.",
        productDescription: popEnableIl
          ? "Our versatile canvas sneakers feature a durable construction with cushioned insoles for all-day comfort. The lightweight design makes them perfect for everyday wear. Pair them with <a href='/products/denim-shorts'>denim shorts</a> or <a href='/products/casual-pants'>casual pants</a> for an effortless look. Check out our <a href='/collections/footwear'>complete footwear collection</a> for more styles."
          : "Our versatile canvas sneakers feature a durable construction with cushioned insoles for all-day comfort. The lightweight design makes them perfect for everyday wear. Pair them with denim shorts or casual pants for an effortless look.",
        faqContent: "Q: Are these sneakers suitable for wide feet?\nA: Yes, these sneakers have a roomy toe box that accommodates wider feet comfortably.\n\nQ: Are these machine washable?\nA: Yes, they can be machine washed on a gentle cycle. Air dry only.\n\nQ: Do these sneakers have arch support?\nA: They feature moderate arch support with cushioned insoles for comfort."
      }
    ];
    
    setPopResults(popResultsData);
  };

  // Start PLOP (PLP On-Page Boosting)
  const startPlopBoosting = () => {
    if (!plopSheetFile) {
      toast.error("Please upload the PLP sheet file.");
      return;
    }
    
    setPlopSection("processing");
    setPlopProgress(0);
    setPlopLogs([]);
    
    simulateProcessing(
      (progress) => {
        setPlopProgress(progress);
        
        if (progress === 100) {
          // Generate mock results
          generatePlopResults();
          
          // Show output section
          setTimeout(() => {
            setPlopSection("output");
          }, 500);
        }
      },
      (message) => {
        setPlopLogs(prev => [...prev, message]);
      },
      () => {
        toast.success("PLP on-page boosting completed successfully!");
      },
      8000
    );
  };
  
  // Generate mock PLOP results
  const generatePlopResults = () => {
    const plopResultsData = [
      {
        name: "Women's Dresses Collection",
        url: "/collections/womens-dresses",
        pageType: "Collection",
        titleTag: "Women's Dresses Collection | Shop Casual to Formal Styles",
        metaDescription: "Discover our extensive collection of women's dresses for every occasion. From casual day dresses to elegant evening wear, find your perfect style.",
        pageDescription: plopEnableIl
          ? "Explore our curated collection of women's dresses designed for every occasion. From casual <a href='/collections/day-dresses'>day dresses</a> to elegant <a href='/collections/evening-wear'>evening wear</a>, our selection offers versatile styles crafted with quality fabrics and thoughtful details. Find the perfect dress to express your unique style, whether you're heading to the office, attending a special event, or enjoying a weekend brunch. Pair with our <a href='/collections/womens-shoes'>women's shoes</a> and <a href='/collections/accessories'>accessories</a> for a complete look."
          : "Explore our curated collection of women's dresses designed for every occasion. From casual day dresses to elegant evening wear, our selection offers versatile styles crafted with quality fabrics and thoughtful details. Find the perfect dress to express your unique style, whether you're heading to the office, attending a special event, or enjoying a weekend brunch.",
        faqContent: "Q: What size range do your dresses come in?\nA: Our dresses are available in sizes XS to XXL, with select styles offering extended sizing.\n\nQ: Do you offer petite or tall sizing?\nA: Yes, many of our dress styles come in petite and tall options to ensure the perfect fit.\n\nQ: What is your return policy for dresses?\nA: We offer free returns within 30 days on all unworn dresses with original tags attached."
      },
      {
        name: "Men's Accessories",
        url: "/collections/mens-accessories",
        pageType: "Collection",
        titleTag: "Men's Accessories | Watches, Belts, Wallets & More",
        metaDescription: "Complete your look with our premium men's accessories. Shop our selection of watches, belts, wallets, and more to elevate your everyday style.",
        pageDescription: plopEnableIl
          ? "Elevate your everyday style with our premium men's accessories collection. From sophisticated <a href='/collections/mens-watches'>watches</a> and <a href='/collections/mens-belts'>belts</a> to functional <a href='/collections/mens-wallets'>wallets</a> and statement <a href='/collections/mens-ties'>ties</a>, our accessories are designed to add the perfect finishing touch to any outfit. Crafted with attention to detail and quality materials, these pieces are built to last while enhancing your personal style. Check out our <a href='/collections/mens-essentials'>Men's Essentials</a> for more wardrobe staples."
          : "Elevate your everyday style with our premium men's accessories collection. From sophisticated watches and belts to functional wallets and statement ties, our accessories are designed to add the perfect finishing touch to any outfit. Crafted with attention to detail and quality materials, these pieces are built to last while enhancing your personal style.",
        faqContent: "Q: Are your leather accessories made from genuine leather?\nA: Yes, all our leather accessories are crafted from genuine leather for quality and durability.\n\nQ: Do your watches come with warranties?\nA: All watches include a 2-year manufacturer's warranty against defects.\n\nQ: What metals are used in your jewelry items?\nA: Our men's jewelry pieces feature stainless steel, sterling silver, and select gold-plated options."
      },
      {
        name: "Home Decor Collection",
        url: "/collections/home-decor",
        pageType: "Collection",
        titleTag: "Home Decor | Stylish Accessories for Every Room",
        metaDescription: "Transform your space with our curated home decor collection. Find stylish accessories, textiles, and accent pieces to refresh every room.",
        pageDescription: plopEnableIl
          ? "Transform your living space with our thoughtfully curated home decor collection. From cozy <a href='/collections/throw-pillows'>throw pillows</a> and elegant <a href='/collections/wall-art'>wall art</a> to unique <a href='/collections/decorative-objects'>decorative objects</a> and ambient <a href='/collections/lighting'>lighting</a>, we offer pieces that add personality and style to every room. Our collection features diverse aesthetics to complement any interior design vision, whether you prefer minimalist, contemporary, or eclectic styles. Visit our <a href='/collections/seasonal-decor'>seasonal decor</a> section for timely updates to your home."
          : "Transform your living space with our thoughtfully curated home decor collection. From cozy throw pillows and elegant wall art to unique decorative objects and ambient lighting, we offer pieces that add personality and style to every room. Our collection features diverse aesthetics to complement any interior design vision, whether you prefer minimalist, contemporary, or eclectic styles.",
        faqContent: "Q: Do you offer design consultation services?\nA: Yes, we offer complimentary virtual design consultations to help you select the perfect pieces for your space.\n\nQ: How often do you update your home decor collection?\nA: We refresh our collection seasonally, with new pieces arriving every 6-8 weeks.\n\nQ: Do you offer international shipping for home decor items?\nA: Yes, we ship to select international destinations. Shipping costs and delivery times vary by location."
      }
    ];
    
    setPlopResults(plopResultsData);
  };

  // Reset to input sections
  const resetPopSection = () => {
    setPopSection("input");
    setPopEnableIl(false);
    setPopProductFeedFile(null);
    setPopPagesDetailsFile(null);
    setPopProgress(0);
    setPopLogs([]);
    setPopResults([]);
  };
  
  const resetPlopSection = () => {
    setPlopSection("input");
    setPlopEnableIl(false);
    setPlopSheetFile(null);
    setPlopProgress(0);
    setPlopLogs([]);
    setPlopResults([]);
  };

  return (
    <div>
      <ToolViewHeader 
        solutionPrefix="opb" 
        solutionName="On-Page Boosting" 
      />

      {/* Sub-tabs Navigation */}
      <div className="mb-6 border-b">
        <div className="flex">
          <button
            className={`sub-tab ${opbCurrentSubTab === "pop" ? "active" : ""}`}
            onClick={() => goToSubTab("pop")}
          >
            Product On-Page Boosting
          </button>
          <button
            className={`sub-tab ${opbCurrentSubTab === "plop" ? "active" : ""}`}
            onClick={() => goToSubTab("plop")}
          >
            PLP On-Page Boosting
          </button>
        </div>
      </div>

      {/* Product On-Page Boosting (POP) */}
      {opbCurrentSubTab === "pop" && (
        <div id="opb-pop-content">
          {/* Input Section */}
          {popSection === "input" && (
            <div id="opb-pop-input-section">
              <h2 className="text-xl font-semibold mb-4">Product On-Page Boosting - Input</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
                <p>Upload your product feed to optimize titles, meta descriptions, and product descriptions for better SEO performance.</p>
              </div>
              
              {/* IL Checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="opb-pop-enable-il"
                    checked={popEnableIl}
                    onChange={() => setPopEnableIl(!popEnableIl)}
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  <span>Enable Internal Links Embedding?</span>
                </label>
              </div>
              
              {/* Product Feed */}
              <FileUpload 
                id="opb-file-pop-product-feed"
                statusId="status-opb-pop-product-feed"
                acceptedTypes={[".csv", ".xlsx"]}
                label="1. Product Feed Sheet"
                requiredColumns={popEnableIl 
                  ? ["Page Name", "URL", "Image", "Descriptions", "Attributes", "Keywords", "Suggested Products/Pages Links"]
                  : ["Page Name", "URL", "Image", "Descriptions", "Attributes", "Keywords"]
                }
                onFileChange={handlePopProductFeedChange}
                downloadTemplateLink="#template-pop-product"
              />
              
              {/* Pages Details (conditional) */}
              {popEnableIl && (
                <FileUpload 
                  id="opb-file-pop-pages-details"
                  statusId="status-opb-pop-pages-details"
                  acceptedTypes={[".csv", ".xlsx"]}
                  label="2. Pages Details Sheet (for Internal Linking)"
                  requiredColumns={["Page Name", "URL", "Page Type", "Primary/Secondary Keywords"]}
                  onFileChange={handlePopPagesDetailsChange}
                  downloadTemplateLink="#template-pop-pages"
                />
              )}
              
              <div className="flex justify-end mt-6">
                <button 
                  className={`btn btn-primary flex items-center gap-1 ${!popProductFeedFile || (popEnableIl && !popPagesDetailsFile) ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!popProductFeedFile || (popEnableIl && !popPagesDetailsFile)}
                  onClick={startPopBoosting}
                >
                  Start Product On-Page Boosting →
                </button>
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {popSection === "processing" && (
            <div id="opb-pop-processing-section">
              <h2 className="text-xl font-semibold mb-4">Processing Product On-Page Boosting</h2>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-3">Optimizing Product Content</h3>
                <ProgressBar progress={popProgress} id="opb-pop-progress" />
                <div className="text-sm mt-1">Progress: {popProgress}%</div>
                
                <div className="mt-4">
                  <LogDisplay logs={popLogs} id="opb-pop-log" />
                </div>
              </div>
            </div>
          )}
          
          {/* Output Section */}
          {popSection === "output" && (
            <div id="opb-pop-output-section">
              <h2 className="text-xl font-semibold mb-4">Product On-Page Boosting Results</h2>
              
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Optimized Product Content</h3>
                  <button className="btn btn-sm btn-outline">Export Results (CSV)</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="data-table" id="opb-pop-output-table">
                    <thead>
                      <tr>
                        <th>Page Name</th>
                        <th>URL</th>
                        <th>New Title Tag</th>
                        <th>New Meta Description</th>
                        <th>New Product Description (Excerpt)</th>
                        <th>FAQ Content (Excerpt)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {popResults.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.url}</td>
                          <td>{item.titleTag}</td>
                          <td>{item.metaDescription}</td>
                          <td dangerouslySetInnerHTML={{ __html: item.productDescription }} />
                          <td><pre className="text-xs whitespace-pre-wrap">{item.faqContent.substring(0, 100)}...</pre></td>
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
                  onClick={resetPopSection}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Product Input</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLP On-Page Boosting (PLOP) */}
      {opbCurrentSubTab === "plop" && (
        <div id="opb-plop-content">
          {/* Input Section */}
          {plopSection === "input" && (
            <div id="opb-plop-input-section">
              <h2 className="text-xl font-semibold mb-4">PLP On-Page Boosting - Input</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-blue-700">
                <p>Upload your PLP data to optimize collection pages for better search visibility and user engagement.</p>
              </div>
              
              {/* IL Checkbox */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="opb-plop-enable-il"
                    checked={plopEnableIl}
                    onChange={() => setPlopEnableIl(!plopEnableIl)}
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  <span>Enable Internal Links Embedding?</span>
                </label>
              </div>
              
              {/* PLP Sheet */}
              <FileUpload 
                id="opb-file-plop-plp-sheet"
                statusId="status-opb-plop-plp-sheet"
                acceptedTypes={[".csv", ".xlsx"]}
                label="1. PLP Sheet"
                requiredColumns={plopEnableIl 
                  ? ["Page Name", "URL", "Page Type", "Keywords", "Suggested Links"]
                  : ["Page Name", "URL", "Page Type", "Keywords"]
                }
                onFileChange={handlePlopSheetChange}
                downloadTemplateLink="#template-plop"
              />
              
              <div className="flex justify-end mt-6">
                <button 
                  className={`btn btn-primary flex items-center gap-1 ${!plopSheetFile ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!plopSheetFile}
                  onClick={startPlopBoosting}
                >
                  Start PLP On-Page Boosting →
                </button>
              </div>
            </div>
          )}
          
          {/* Processing Section */}
          {plopSection === "processing" && (
            <div id="opb-plop-processing-section">
              <h2 className="text-xl font-semibold mb-4">Processing PLP On-Page Boosting</h2>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-3">Optimizing PLP Content</h3>
                <ProgressBar progress={plopProgress} id="opb-plop-progress" />
                <div className="text-sm mt-1">Progress: {plopProgress}%</div>
                
                <div className="mt-4">
                  <LogDisplay logs={plopLogs} id="opb-plop-log" />
                </div>
              </div>
            </div>
          )}
          
          {/* Output Section */}
          {plopSection === "output" && (
            <div id="opb-plop-output-section">
              <h2 className="text-xl font-semibold mb-4">PLP On-Page Boosting Results</h2>
              
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Optimized PLP Content</h3>
                  <button className="btn btn-sm btn-outline">Export Results (CSV)</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="data-table" id="opb-plop-output-table">
                    <thead>
                      <tr>
                        <th>Page Name</th>
                        <th>URL</th>
                        <th>Page Type</th>
                        <th>New Title Tag</th>
                        <th>New Meta Description</th>
                        <th>New Page Description (Excerpt)</th>
                        <th>FAQ Content (Excerpt)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plopResults.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.url}</td>
                          <td>{item.pageType}</td>
                          <td>{item.titleTag}</td>
                          <td>{item.metaDescription}</td>
                          <td dangerouslySetInnerHTML={{ __html: item.pageDescription }} />
                          <td><pre className="text-xs whitespace-pre-wrap">{item.faqContent.substring(0, 100)}...</pre></td>
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
                  onClick={resetPlopSection}
                >
                  <ArrowLeft size={16} />
                  <span>Back to PLP Input</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnPageBoosting;
