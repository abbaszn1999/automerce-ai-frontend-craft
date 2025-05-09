
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { toast } from "@/components/ui/sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveToFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedType: "plp" | "product";
  source?: string;
}

const SaveToFeedDialog: React.FC<SaveToFeedDialogProps> = ({ 
  open, 
  onOpenChange, 
  feedType, 
  source 
}) => {
  const [feedName, setFeedName] = useState<string>("");
  const { addFeedToList } = useAppContext();

  const handleSave = () => {
    if (!feedName.trim()) {
      toast.error("Please enter a name for the feed");
      return;
    }

    addFeedToList(feedName, feedType, source);
    toast.success("Feed saved successfully");
    setFeedName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Feed List</DialogTitle>
          <DialogDescription>
            Enter a name to save this {feedType === "plp" ? "PLP" : "Product"} feed to your feed list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Feed name"
            value={feedName}
            onChange={(e) => setFeedName(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToFeedDialog;
