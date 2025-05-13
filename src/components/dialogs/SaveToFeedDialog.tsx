
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "../ui/use-toast";

interface SaveToFeedDialogProps {
  source: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addFeedToList: (name: string, type: string, source: string) => void;
}

const SaveToFeedDialog: React.FC<SaveToFeedDialogProps> = ({
  source,
  open,
  onOpenChange,
  addFeedToList,
}) => {
  const [feedName, setFeedName] = useState("");
  const [feedType, setFeedType] = useState("google");

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save to Feed</DialogTitle>
          <DialogDescription>
            Create a new feed with the current data or add to an existing feed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feed-name" className="text-right">
              Name
            </Label>
            <Input
              id="feed-name"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              className="col-span-3"
              placeholder="Enter feed name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="feed-type" className="text-right">
              Type
            </Label>
            <Select value={feedType} onValueChange={setFeedType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select feed type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveToFeedDialog;
