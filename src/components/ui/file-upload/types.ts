
export interface FileUploadProps {
  id: string;
  statusId?: string;
  acceptedTypes: string[];
  label: string;
  requiredColumns?: string[];
  onFileChange: (file: File | null) => void;
  downloadTemplateLink?: string;
  mapColumn?: boolean;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
  onColumnMappingComplete?: (columnMapping: Record<string, string>) => void;
  foundationColumns?: string[];
  onColumnsExtracted?: (columns: string[]) => void;
}

export interface ColumnMappingProps {
  sourceColumns: string[];
  targetColumns: string[];
  columnMapping: Record<string, string>;
  onColumnMappingChange: (sourceColumn: string, targetColumn: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  requiredColumns?: string[];
}

export type FileUploadStatus = "pending" | "uploaded" | "error" | "mapping";
