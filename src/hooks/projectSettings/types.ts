
// Define types for the project settings
export type AEConfigType = {
  aiSettings: {
    openAiApiKey?: string;
    embeddingModel?: string;
    embeddingDimensions?: number;
    maxResultsFilter?: number;
    model2?: string;
    maxTokens2?: number;
    prompt2?: string;
    batchSize?: number;
    model3?: string;
    maxTokens3?: number;
    prompt3?: string;
  };
  searchApiSettings: {
    searchApiKey?: string;
    results?: number;
  };
  scrapingSettings: {
    scrapingBeeApiKey?: string;
    maxConcurrentRequests1?: number;
    maxConcurrentRequests2?: number;
  };
  attributes: Array<{ id: string; name: string; values: string[] }>;
  feeds?: Array<{
    name: string;
    type: string;
    source: string;
    data: any[];
    createdAt: string;
  }>;
};
