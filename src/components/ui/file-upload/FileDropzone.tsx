
import React from "react";
import { Upload } from "lucide-react";
import ChooseFromFeedButton from "@/components/common/ChooseFromFeedButton";

interface FileDropzoneProps {
  id: string;
  acceptedTypes: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFeedListOption?: boolean;
  onSelectFeed?: (feedId: string) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  id,
  acceptedTypes,
  onFileChange,
  showFeedListOption = true,
  onSelectFeed
}) => {
  const handleSelectFeed = (feedId: string) => {
    if (onSelectFeed) {
      onSelectFeed(feedId);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Upload className="h-8 w-8 text-gray-400 mb-2" />
      <label htmlFor={id} className="btn btn-outline cursor-pointer mb-4">
        Choose File
      </label>
      <input
        id={id}
        type="file"
        className="hidden"
        onChange={onFileChange}
        accept={acceptedTypes.join(",")}
      />
      <p className="mt-2 text-xs text-gray-500">
        {acceptedTypes.join(", ")} files up to 10MB
      </p>

      {showFeedListOption && onSelectFeed && (
        <div className="mt-4 w-full">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <div className="mt-4">
            <ChooseFromFeedButton 
              className="w-full" 
              onSelectFeed={handleSelectFeed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;
