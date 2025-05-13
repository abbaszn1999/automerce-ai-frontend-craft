
// Define default settings for projects
import { AEConfigType } from './types';

export const getDefaultProjectSettings = (): AEConfigType => {
  return {
    aiSettings: {
      openAiApiKey: '',
      embeddingModel: 'text-embedding-3-small',
      embeddingDimensions: 1536,
      maxResultsFilter: 20,
      model2: 'gpt-3.5-turbo',
      maxTokens2: 1000,
      prompt2: '',
      batchSize: 5,
      model3: 'gpt-4',
      maxTokens3: 2000,
      prompt3: '',
    },
    searchApiSettings: {
      searchApiKey: '',
      results: 10,
    },
    scrapingSettings: {
      scrapingBeeApiKey: '',
      maxConcurrentRequests1: 5,
      maxConcurrentRequests2: 2,
    },
    attributes: [],
    feeds: [],
    columnMappings: {},
    attributeDefinitions: [],
  };
};

export default getDefaultProjectSettings;
