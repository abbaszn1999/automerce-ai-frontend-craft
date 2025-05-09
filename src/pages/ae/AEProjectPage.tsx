
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";
import { ArrowLeft, Loader2 } from "lucide-react";

// Define project type
export interface AEProject {
  id: string;
  name: string;
  created_at: string;
}

const AEProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<AEProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("setup");

  // Mock project data without database connection
  useEffect(() => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }
    
    // Load project from localStorage or create a default one
    const loadProject = () => {
      try {
        const storedProject = localStorage.getItem(`ae-project-${projectId}`);
        if (storedProject) {
          setProject(JSON.parse(storedProject));
        } else {
          // Create a default project
          const newProject = {
            id: projectId,
            name: "Attribute Enrichment Project",
            created_at: new Date().toISOString()
          };
          
          // Store in localStorage
          localStorage.setItem(`ae-project-${projectId}`, JSON.stringify(newProject));
          setProject(newProject);
        }
      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin mr-2 text-primary" />
        <p className="text-lg">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Project not found</h2>
        <p className="mb-6 text-muted-foreground">
          We couldn't load the requested project. It may have been deleted.
        </p>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Attribute Enrichment</h1>
        <div className="flex items-center text-primary hover:underline mt-1">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <Link to="/">Back to AI Attribute Enrichment Projects</Link>
        </div>
        <h2 className="text-xl font-bold mt-4">Attribute Enrichment Project: {project.name}</h2>
      </div>

      <Tabs
        defaultValue="setup"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
            Setup
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs">2</span>
            Attributes
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs">3</span>
            Input
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs">4</span>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Attribute Enrichment Setup</h3>
          </div>
          <AESetupTab projectId={projectId!} />
        </TabsContent>
        
        <TabsContent value="attributes">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Attributes</h3>
          </div>
          <AEAttributesTab projectId={projectId!} />
        </TabsContent>
        
        <TabsContent value="input">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Input Data</h3>
          </div>
          <AEInputTab projectId={projectId!} onJobCreated={() => setActiveTab("results")} />
        </TabsContent>
        
        <TabsContent value="results">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Results</h3>
          </div>
          <AEResultsTab projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AEProjectPage;
