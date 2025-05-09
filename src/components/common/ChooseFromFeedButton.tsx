
import React, { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { List } from "lucide-react";
import ChooseFromFeedDialog from "@/components/dialogs/ChooseFromFeedDialog";

interface ChooseFromFeedButtonProps extends ButtonProps {
  feedType?: "plp" | "product";
  onSelectFeed: (feedId: string) => void;
  variant?: "default" | "outline" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  iconOnly?: boolean;
}

const ChooseFromFeedButton: React.FC<ChooseFromFeedButtonProps> = ({ 
  feedType, 
  onSelectFeed, 
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
        <List className={iconOnly ? "" : "mr-2"} size={16} />
        {!iconOnly && "Choose from Feed"}
      </Button>
      
      <ChooseFromFeedDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        feedType={feedType}
        onSelectFeed={onSelectFeed}
      />
    </>
  );
};

export default ChooseFromFeedButton;
