
import React from "react";
import { Button, ButtonProps } from "../ui/button";
import { SaveIcon } from "lucide-react";
import SaveToFeedDialog from "../dialogs/SaveToFeedDialog";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { toast } from "../ui/use-toast";

interface SaveToFeedButtonProps extends Partial<ButtonProps> {
  data?: any[];
  source: string;
  feedType?: "plp" | "product"; // Make it optional with a default in the component
}

const SaveToFeedButton: React.FC<SaveToFeedButtonProps> = ({
  data = [], // Provide a default empty array
  source,
  feedType = "plp", // Default value
  className,
  variant = "default",
  size = "default",
  ...props
}) => {
  const [open, setOpen] = React.useState(false);
  const { settings, saveProjectSettings } = useProjectSettings();

  const handleAddFeed = (name: string, type: string, source: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to save to feed");
      return;
    }

    // Since addFeedToProjectSettings doesn't exist, we'll create a function to update settings
    // and save the feed data
    try {
      if (settings) {
        // Assume settings has a feeds property, if not, we'll create it
        const updatedSettings = {
          ...settings,
          feeds: settings.feeds || [],
        };
        
        // Add the new feed
        updatedSettings.feeds.push({
          name,
          type,
          source,
          data,
          createdAt: new Date().toISOString(),
        });
        
        // Save the updated settings
        saveProjectSettings(updatedSettings);
        toast.success("Feed saved successfully");
      } else {
        toast.error("Project settings not available");
      }
    } catch (error) {
      console.error("Error saving feed:", error);
      toast.error("Failed to save feed");
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className={`flex items-center gap-2 ${className}`}
        variant={variant}
        size={size}
        {...props}
      >
        <SaveIcon className="h-4 w-4" />
        Save to Feed
      </Button>
      <SaveToFeedDialog
        source={source}
        open={open}
        onOpenChange={setOpen}
        addFeedToList={handleAddFeed}
      />
    </>
  );
};

export default SaveToFeedButton;
