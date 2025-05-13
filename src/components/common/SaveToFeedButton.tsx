
import React from "react";
import { Button } from "../ui/button";
import { SaveIcon } from "lucide-react";
import SaveToFeedDialog from "../dialogs/SaveToFeedDialog";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { toast } from "@/components/ui/use-toast";

interface SaveToFeedButtonProps {
  data: any[];
  source: string;
}

const SaveToFeedButton: React.FC<SaveToFeedButtonProps> = ({ data, source }) => {
  const [open, setOpen] = React.useState(false);
  const { addFeedToProjectSettings } = useProjectSettings();

  const handleAddFeed = (name: string, type: string, source: string) => {
    if (!data || data.length === 0) {
      toast.error("No data to save to feed");
      return;
    }

    addFeedToProjectSettings(name, type, source, data);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="ml-auto flex items-center gap-2">
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
