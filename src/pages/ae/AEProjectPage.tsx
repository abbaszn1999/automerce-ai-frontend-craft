
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";

// Define project type
export interface AEProject {
  id: string;
  name: string;
  created_at: string;
}

const AEProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { callEdgeFunction } = useSupabase();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");

  // Fetch project details
  useEffect(() => {
    if (!projectId) return;
    
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const data = await callEdgeFunction("ae-projects", {
          query: { projectId }
        });
        
        if (!data.projects || data.projects.length === 0) {
          toast.error("Project not found");
          navigate("/");
          return;
        }
        
        setProject(data.projects[0]);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, callEdgeFunction, navigate]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Project not found</h2>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>
        <Button onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </div>

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
