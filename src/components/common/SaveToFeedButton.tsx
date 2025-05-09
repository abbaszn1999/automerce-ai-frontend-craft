
import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Save } from "lucide-react";
import SaveToFeedDialog from "@/components/dialogs/SaveToFeedDialog";

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
  
  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        variant={variant} 
        size={size}
        {...props}
      >
        <Save className={iconOnly ? "" : "mr-2"} size={16} />
        {!iconOnly && "Save to Feed List"}
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
