
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    prompt_2: "Are these two products visually similar? Answer with only yes or no.",
    batch_size: 100,
    max_concurrent_requests_2: 5,
    model_3: "gpt-4o",
    max_tokens_3: 2000,
    prompt_3: "Analyze and categorize the extracted product attributes...",
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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Enter your API keys for the various services used in the attribute extraction process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openai_api_key">OpenAI API Key</Label>
              <Input
                id="openai_api_key"
                type="password"
                placeholder="sk-..."
                value={config.openai_api_key || ''}
                onChange={(e) => handleConfigChange('openai_api_key', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="searchapi_api_key">SearchAPI.io API Key</Label>
              <Input
                id="searchapi_api_key"
                type="password"
                placeholder="Enter SearchAPI key"
                value={config.searchapi_api_key || ''}
                onChange={(e) => handleConfigChange('searchapi_api_key', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scrapingbee_api_key">ScrapingBee API Key</Label>
              <Input
                id="scrapingbee_api_key"
                type="password"
                placeholder="Enter ScrapingBee key"
                value={config.scrapingbee_api_key || ''}
                onChange={(e) => handleConfigChange('scrapingbee_api_key', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phase 1: Visual Product Discovery & Semantic Filtering</CardTitle>
          <CardDescription>
            Configure parameters for the first phase of the extraction process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embedding_model">Embedding Model</Label>
              <Input
                id="embedding_model"
                placeholder="text-embedding-3-small"
                value={config.embedding_model || ''}
                onChange={(e) => handleConfigChange('embedding_model', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="embedding_dimensions">Embedding Dimensions</Label>
              <Input
                id="embedding_dimensions"
                type="number"
                placeholder="256"
                value={config.embedding_dimensions || ''}
                onChange={(e) => handleConfigChange('embedding_dimensions', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_results_filter">Max Results Filter</Label>
              <Input
                id="max_results_filter"
                type="number"
                placeholder="7"
                value={config.max_results_filter || ''}
                onChange={(e) => handleConfigChange('max_results_filter', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="results">SearchAPI Results</Label>
              <Input
                id="results"
                type="number"
                placeholder="10"
                value={config.results || ''}
                onChange={(e) => handleConfigChange('results', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phase 2: Image Extraction & Visual Similarity Verification</CardTitle>
          <CardDescription>
            Configure parameters for the image extraction and visual similarity check.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_concurrent_requests_1">Max Concurrent Requests (ScrapingBee)</Label>
              <Input
                id="max_concurrent_requests_1"
                type="number"
                placeholder="5"
                value={config.max_concurrent_requests_1 || ''}
                onChange={(e) => handleConfigChange('max_concurrent_requests_1', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model_2">Visual Similarity Model</Label>
              <Input
                id="model_2"
                placeholder="gpt-4o"
                value={config.model_2 || ''}
                onChange={(e) => handleConfigChange('model_2', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens_2">Max Tokens</Label>
              <Input
                id="max_tokens_2"
                type="number"
                placeholder="8000"
                value={config.max_tokens_2 || ''}
                onChange={(e) => handleConfigChange('max_tokens_2', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch_size">Batch Size</Label>
              <Input
                id="batch_size"
                type="number"
                placeholder="100"
                value={config.batch_size || ''}
                onChange={(e) => handleConfigChange('batch_size', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prompt_2">Image Similarity Prompt</Label>
              <Input
                id="prompt_2"
                placeholder="Are these two products visually similar? Answer with only yes or no."
                value={config.prompt_2 || ''}
                onChange={(e) => handleConfigChange('prompt_2', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phase 3 & 4: Attribute Scraping and Final AI Enrichment</CardTitle>
          <CardDescription>
            Configure parameters for attribute scraping and AI-based enrichment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_concurrent_requests_2">Max Concurrent Requests (ScrapingBee)</Label>
              <Input
                id="max_concurrent_requests_2"
                type="number"
                placeholder="5"
                value={config.max_concurrent_requests_2 || ''}
                onChange={(e) => handleConfigChange('max_concurrent_requests_2', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model_3">Final Attributes Model</Label>
              <Input
                id="model_3"
                placeholder="gpt-4o"
                value={config.model_3 || ''}
                onChange={(e) => handleConfigChange('model_3', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_tokens_3">Max Tokens</Label>
              <Input
                id="max_tokens_3"
                type="number"
                placeholder="2000"
                value={config.max_tokens_3 || ''}
                onChange={(e) => handleConfigChange('max_tokens_3', parseInt(e.target.value))}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prompt_3">Final Attribute Extraction Prompt</Label>
              <Input
                id="prompt_3"
                placeholder="Analyze and categorize the extracted product attributes..."
                value={config.prompt_3 || ''}
                onChange={(e) => handleConfigChange('prompt_3', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveConfig} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
};

export default AESetupTab;
