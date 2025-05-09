
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppContext } from "@/context/AppContext";

// Define project type
export interface AEProject {
  id: string;
  name: string;
  created_at: string;
  workspace_id?: string;
  module_type?: string;
}

const AEProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { aeCurrentStage, setAeCurrentStage } = useAppContext();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [activeTab, setActiveTab] = useState("setup");

  // Load project from localStorage
  useEffect(() => {
    if (!projectId) {
      return;
    }
    
    // Try to get project from localStorage
    const savedProjects = localStorage.getItem("ae-projects");
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        const foundProject = projects.find((p: AEProject) => p.id === projectId);
        
        if (foundProject) {
          setProject(foundProject);
          return;
        }
      } catch (error) {
        console.error("Error parsing saved projects:", error);
      }
    }
    
    // Fallback: create a mock project
    const mockProject: AEProject = {
      id: projectId,
      name: projectId.startsWith("local-") ? `Project ${projectId.slice(6)}` : `Project ${projectId}`,
      created_at: new Date().toISOString()
    };
    
    setProject(mockProject);
  }, [projectId]);
  
  // Stage navigation similar to Collection Builder
  const goToStage = (stage: number) => {
    // Only allow moving forward one stage at a time or backward from any stage
    if (stage > aeCurrentStage && stage !== aeCurrentStage + 1) {
      toast.error("Please complete the current stage first.");
      return;
    }
    
    setAeCurrentStage(stage);
    
    // Map stages to tabs
    if (stage === 1) setActiveTab("setup");
    if (stage === 2) setActiveTab("attributes");
    if (stage === 3) setActiveTab("input");
    if (stage === 4) setActiveTab("results");
  };
  
  // Update aeCurrentStage when active tab changes
  useEffect(() => {
    if (activeTab === "setup") setAeCurrentStage(1);
    if (activeTab === "attributes") setAeCurrentStage(2);
    if (activeTab === "input") setAeCurrentStage(3);
    if (activeTab === "results") setAeCurrentStage(4);
  }, [activeTab, setAeCurrentStage]);

  // Stage indicator component similar to Collection Builder
  const renderStageIndicator = () => {
    const stages = [
      { num: 1, name: "Setup" },
      { num: 2, name: "Attributes" },
      { num: 3, name: "Input" },
      { num: 4, name: "Results" }
    ];
    
    return (
      <div id="ae-stages" className="mb-8">
        <div className="flex flex-wrap gap-2">
          {stages.map((stage, index) => {
            const isActive = aeCurrentStage === stage.num;
            const isCompleted = aeCurrentStage > stage.num;
            const isPending = aeCurrentStage < stage.num;
            
            const stageClass = isActive ? "stage-active" : isCompleted ? "stage-completed" : "stage-pending";
            
            return (
              <div key={stage.num} className="relative">
                <div 
                  className={`stage-item ${stageClass} cursor-pointer`}
                  onClick={() => goToStage(stage.num)}
                >
                  <div className="stage-number">{stage.num}</div>
                  <div className="stage-label">{stage.name}</div>
                </div>
                {index < stages.length - 1 && (
                  <div className={`stage-line ${isCompleted ? "bg-green-500" : "bg-gray-200"}`}></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!project) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error loading project</AlertTitle>
          <AlertDescription>
            Project not found
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4">
          <Button onClick={() => navigate("/")} variant="outline" className="w-fit">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            Attribute Enrichment Project
          </p>
        </div>
      </div>
      
      {/* Stage Indicator */}
      {renderStageIndicator()}

      <Tabs
        defaultValue="setup"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <AESetupTab projectId={projectId!} />
        </TabsContent>
        <TabsContent value="attributes">
          <AEAttributesTab projectId={projectId!} />
        </TabsContent>
        <TabsContent value="input">
          <AEInputTab projectId={projectId!} onJobCreated={() => setActiveTab("results")} />
        </TabsContent>
        <TabsContent value="results">
          <AEResultsTab projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AEProjectPage;
