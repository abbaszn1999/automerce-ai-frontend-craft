
import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { BookmarkPlus } from "lucide-react";
import SaveToFeedDialog from "@/components/dialogs/SaveToFeedDialog";
import { toast } from "@/components/ui/sonner";

interface SaveToFeedButtonProps extends ButtonProps {
  feedType: "plp" | "product";
  source?: string;
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  iconOnly?: boolean;
}

const SaveToFeedButton: React.FC<SaveToFeedButtonProps> = ({ 
  feedType, 
  source, 
  variant = "outline",
  size = "default",
  iconOnly = false,
  ...props 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Button 
        onClick={handleOpenDialog} 
        variant={variant} 
        size={size}
        {...props}
      >
        <BookmarkPlus className={iconOnly ? "" : "mr-2"} size={16} />
        {!iconOnly && "Save to Feed"}
      </Button>
      
      <SaveToFeedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feedType={feedType}
        source={source}
      />
    </>
  );
};

export default SaveToFeedButton;
