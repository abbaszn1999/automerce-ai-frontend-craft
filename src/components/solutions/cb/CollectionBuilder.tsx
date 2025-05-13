
import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { useProjectSettings } from "@/hooks/useProjectSettings";
import { useWorkspace } from "@/context/WorkspaceContext";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollectionBuilderService } from "@/hooks/api/useCollectionBuilderService";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

type CollectionBuilderProps = {
  solutionPrefix: string;
};

const CollectionBuilder: React.FC<CollectionBuilderProps> = ({
  solutionPrefix,
}) => {
  const { currentProject } = useAppContext();
  const { currentWorkspace } = useWorkspace();
  const { settings, isLoading: isLoadingSettings, saveProjectSettings } =
    useProjectSettings(solutionPrefix, currentProject?.name);
  const {
    useGetStages,
    useCreateStageMutation,
    useUpdateStageMutation,
    useDeleteStageMutation,
    useRunCollectionBuilderMutation,
    progress,
    isProcessing,
  } = useCollectionBuilderService();

  const {
    data: stages = [],
    isLoading: isLoadingStages,
    refetch: refetchStages,
  } = useGetStages(currentProject?.id);
  const createStageMutation = useCreateStageMutation();
  const updateStageMutation = useUpdateStageMutation();
  const deleteStageMutation = useDeleteStageMutation();
  const runCollectionBuilderMutation = useRunCollectionBuilderMutation();

  const [stageName, setStageName] = useState("");
  const [stageDescription, setStageDescription] = useState("");
  const [stageIndex, setStageIndex] = useState(stages.length + 1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStage, setSelectedStage] = useState<any>(null);
  
  // Simplified state management - removed excessive state variables
  const [stageConfig, setStageConfig] = useState<Record<string, string>>({});

  // Handle form submission
  const handleCreateStage = async () => {
    if (!stageName) {
      toast({
        title: "Error",
        description: "Please provide a stage name",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditMode && selectedStage) {
        await updateStageMutation.mutateAsync({
          id: selectedStage.id,
          name: stageName,
          description: stageDescription,
          index: Number(stageIndex),
          projectId: currentProject?.id || "",
        });
        toast({
          title: "Success",
          description: "Stage updated successfully",
        });
      } else {
        await createStageMutation.mutateAsync({
          name: stageName,
          description: stageDescription,
          index: Number(stageIndex),
          projectId: currentProject?.id || "",
        });
        toast({
          title: "Success",
          description: "Stage created successfully",
        });
      }
      
      // Reset form fields
      setStageName("");
      setStageDescription("");
      setStageIndex(stages.length + 1);
      setIsEditMode(false);
      setSelectedStage(null);
      setIsDialogOpen(false);
      
      // Refresh stages list
      refetchStages();
    } catch (error) {
      console.error("Error creating/updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to save stage",
        variant: "destructive",
      });
    }
  };

  // Handle stage deletion
  const handleDeleteStage = async (stageId: string) => {
    try {
      await deleteStageMutation.mutateAsync(stageId);
      toast({
        title: "Success",
        description: "Stage deleted successfully",
      });
      refetchStages();
    } catch (error) {
      console.error("Error deleting stage:", error);
      toast({
        title: "Error",
        description: "Failed to delete stage",
        variant: "destructive",
      });
    }
  };

  // Handle stage selection for editing
  const handleEditStage = (stage: any) => {
    setSelectedStage(stage);
    setStageName(stage.name);
    setStageDescription(stage.description || "");
    setStageIndex(stage.index);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Accepted files:", acceptedFiles);
    // Handle file upload logic here
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Run collection builder process
  const handleRunCollectionBuilder = async () => {
    if (!currentProject?.id) {
      toast({
        title: "Error",
        description: "No project selected",
        variant: "destructive",
      });
      return;
    }

    try {
      await runCollectionBuilderMutation.mutateAsync(currentProject.id);
      toast({
        title: "Success",
        description: "Collection builder process started",
      });
    } catch (error) {
      console.error("Error running collection builder:", error);
      toast({
        title: "Error",
        description: "Failed to start collection builder process",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const handleResetForm = () => {
    setStageName("");
    setStageDescription("");
    setStageIndex(stages.length + 1);
    setIsEditMode(false);
    setSelectedStage(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Collection Builder</CardTitle>
          <CardDescription>
            Define stages for building product collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Stages</h3>
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Stage
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isEditMode ? "Edit Stage" : "Add New Stage"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isEditMode
                        ? "Update the details for this stage."
                        : "Create a new stage for your collection building process."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stageName">Stage Name</Label>
                      <Input
                        id="stageName"
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        placeholder="Enter stage name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stageDescription">Description</Label>
                      <Input
                        id="stageDescription"
                        value={stageDescription}
                        onChange={(e) => setStageDescription(e.target.value)}
                        placeholder="Enter stage description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stageIndex">Order</Label>
                      <Input
                        id="stageIndex"
                        type="number"
                        value={stageIndex}
                        onChange={(e) => setStageIndex(parseInt(e.target.value))}
                        placeholder="Stage order"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleResetForm}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateStage}>
                      {isEditMode ? "Update" : "Create"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {isLoadingStages ? (
              <div className="text-center py-4">Loading stages...</div>
            ) : stages.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No stages defined yet. Click "Add Stage" to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {stages
                  .slice()
                  .sort((a, b) => Number(a.index) - Number(b.index))
                  .map((stage: any) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between border p-4 rounded-md"
                    >
                      <div>
                        <h4 className="font-medium">{stage.name}</h4>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground">
                            {stage.description}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStage(stage)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStage(stage.id)}
                          className="text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Feed File</h3>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300"
                )}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div className="space-y-2">
                    <p>Drag & drop files here, or click to select files</p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: CSV, Excel
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Run Collection Builder</h3>
              <Button
                disabled={isProcessing || stages.length === 0}
                onClick={handleRunCollectionBuilder}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Run Collection Builder"}
              </Button>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionBuilder;
