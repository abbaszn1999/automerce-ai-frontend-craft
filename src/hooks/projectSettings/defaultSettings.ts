
import { AEConfigType } from './types';

export const getDefaultProjectSettings = (): AEConfigType => ({
  aiSettings: {
    embeddingModel: "text-embedding-3-small",
    embeddingDimensions: 256,
    maxResultsFilter: 7,
    model2: "gpt-4o",
    maxTokens2: 8000,
    prompt2: "You are an AI assistant identifying product attributes.",
    batchSize: 100,
    model3: "gpt-4o",
    maxTokens3: 2000,
    prompt3: "Analyze and categorize the extracted product attributes into their respective attribute types."
  },
  searchApiSettings: {
    results: 10
  },
  scrapingSettings: {
    maxConcurrentRequests1: 5,
    maxConcurrentRequests2: 5
  },
  attributes: [
    { id: "attr1", name: "Material", values: ["Cotton", "Polyester", "Wool", "Silk"] },
    { id: "attr2", name: "Color", values: ["Red", "Blue", "Green", "Black", "White"] }
  ]
});
