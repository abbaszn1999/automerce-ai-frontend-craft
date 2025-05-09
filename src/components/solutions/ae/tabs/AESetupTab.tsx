
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AEConfig {
  openai_api_key: string;
  searchapi_api_key: string;
  scrapingbee_api_key: string;
  embedding_model: string;
  embedding_dimensions: number;
  max_results_filter: number;
  results: number;
  max_concurrent_requests_1: number;
  model_2: string;
  max_tokens_2: number;
  prompt_2: string;
  batch_size: number;
  max_concurrent_requests_2: number;
  model_3: string;
  max_tokens_3: number;
  prompt_3: string;
}

interface AESetupTabProps {
  projectId: string;
}

const AESetupTab = ({ projectId }: AESetupTabProps) => {
  const [config, setConfig] = useState<Partial<AEConfig>>({
    embedding_model: "text-embedding-3-small",
    embedding_dimensions: 256,
    max_results_filter: 7,
    results: 10,
    max_concurrent_requests_1: 5,
    model_2: "gpt-4o",
    max_tokens_2: 8000,
    prompt_2: "You are an AI assistant identifying product attributes.",
    batch_size: 100,
    max_concurrent_requests_2: 5,
    model_3: "gpt-4o",
    max_tokens_3: 2000,
    prompt_3: "Analyze and categorize the extracted product attributes into their respective attribute types.",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = () => {
      try {
        setIsLoading(true);
        const savedConfig = localStorage.getItem(`ae-config-${projectId}`);
        if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
        }
      } catch (error) {
        console.error("Error loading configuration:", error);
        toast.error("Failed to load project configuration");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [projectId]);
  
  const handleConfigChange = (key: keyof AEConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleSaveConfig = async () => {
    try {
      setIsSaving(true);
      localStorage.setItem(`ae-config-${projectId}`, JSON.stringify(config));
      toast.success("Configuration saved successfully");
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading configuration...</div>;
  }

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Attribute Extraction - Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Integration - Filtering SERP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai_api_key">OPENAI_API_KEY</Label>
              <Input
                id="openai_api_key"
                type="password"
                placeholder="Enter your OpenAI API key"
                value={config.openai_api_key || ''}
                onChange={(e) => handleConfigChange('openai_api_key', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embedding_model">embedding_model</Label>
              <Input
                id="embedding_model"
                placeholder="text-embedding-3-small"
                value={config.embedding_model || ''}
                onChange={(e) => handleConfigChange('embedding_model', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embedding_dimensions">embedding_dimensions</Label>
              <Input
                id="embedding_dimensions"
                type="number"
                placeholder="256"
                value={config.embedding_dimensions || ''}
                onChange={(e) => handleConfigChange('embedding_dimensions', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_results_filter">max_results_filter</Label>
              <Input
                id="max_results_filter"
                type="number"
                placeholder="7"
                value={config.max_results_filter || ''}
                onChange={(e) => handleConfigChange('max_results_filter', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Google Lens API - Search API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchapi_api_key">SEARCHAPI_API_KEY</Label>
              <Input
                id="searchapi_api_key"
                type="password"
                placeholder="Enter your SearchAPI key"
                value={config.searchapi_api_key || ''}
                onChange={(e) => handleConfigChange('searchapi_api_key', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="results">results</Label>
              <Input
                id="results"
                type="number"
                placeholder="10"
                value={config.results || ''}
                onChange={(e) => handleConfigChange('results', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Scraping Integration - Extract Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scrapingbee_api_key">SCRAPINGBEE_API_KEY</Label>
              <Input
                id="scrapingbee_api_key"
                type="password"
                placeholder="Enter your ScrapingBee API key"
                value={config.scrapingbee_api_key || ''}
                onChange={(e) => handleConfigChange('scrapingbee_api_key', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_concurrent_requests_1">MAX_CONCURRENT_REQUESTS-1</Label>
              <Input
                id="max_concurrent_requests_1"
                type="number"
                placeholder="5"
                value={config.max_concurrent_requests_1 || ''}
                onChange={(e) => handleConfigChange('max_concurrent_requests_1', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Integration - Similarity Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model_2">model-2</Label>
              <Select 
                value={config.model_2} 
                onValueChange={(value) => handleConfigChange('model_2', value)}
              >
                <SelectTrigger id="model_2">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens_2">max_tokens-2</Label>
              <Input
                id="max_tokens_2"
                type="number"
                placeholder="8000"
                value={config.max_tokens_2 || ''}
                onChange={(e) => handleConfigChange('max_tokens_2', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt_2">prompt-2</Label>
              <Textarea
                id="prompt_2"
                placeholder="You are an AI assistant identifying product attributes."
                value={config.prompt_2 || ''}
                onChange={(e) => handleConfigChange('prompt_2', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch_size">batch_size</Label>
              <Input
                id="batch_size"
                type="number"
                placeholder="100"
                value={config.batch_size || ''}
                onChange={(e) => handleConfigChange('batch_size', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Scraping Integration - Extract Attributes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_concurrent_requests_2">MAX_CONCURRENT_REQUESTS-2</Label>
              <Input
                id="max_concurrent_requests_2"
                type="number"
                placeholder="5"
                value={config.max_concurrent_requests_2 || ''}
                onChange={(e) => handleConfigChange('max_concurrent_requests_2', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Integration - Finalizing Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model_3">model-3</Label>
              <Select 
                value={config.model_3} 
                onValueChange={(value) => handleConfigChange('model_3', value)}
              >
                <SelectTrigger id="model_3">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens_3">max_tokens-3</Label>
              <Input
                id="max_tokens_3"
                type="number"
                placeholder="2000"
                value={config.max_tokens_3 || ''}
                onChange={(e) => handleConfigChange('max_tokens_3', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prompt_3">prompt-3</Label>
              <Textarea
                id="prompt_3"
                placeholder="Analyze and categorize the extracted product attributes into their respective attribute types."
                value={config.prompt_3 || ''}
                onChange={(e) => handleConfigChange('prompt_3', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Attribute Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex justify-between items-center">
                  Material
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2 py-1 rounded text-sm">Cotton</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Polyester</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Wool</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Silk</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex justify-between items-center">
                  Color
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Delete</Button>
                  </div>
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2 py-1 rounded text-sm">Red</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Blue</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Green</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">Black</span>
                  <span className="bg-muted px-2 py-1 rounded text-sm">White</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default AESetupTab;
