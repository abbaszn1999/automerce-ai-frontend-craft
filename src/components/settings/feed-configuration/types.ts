
export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

export type FeedModeType = "plp" | "product";

export interface FeedConfigProps {
  selectedFeedMode: FeedModeType;
  setFeedMappingColumns: (columns: ColumnMapping[]) => void;
  setSettingsCurrentTab: (tab: string) => void;
  addFeedToList: (name: string, type: string) => void;
  feedList: Array<any>;
}
