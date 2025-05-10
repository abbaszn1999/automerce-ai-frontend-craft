
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import AESetupTab from "@/components/solutions/ae/tabs/AESetupTab";
import AEInputTab from "@/components/solutions/ae/tabs/AEInputTab";
import AEAttributesTab from "@/components/solutions/ae/tabs/AEAttributesTab";
import AEResultsTab from "@/components/solutions/ae/tabs/AEResultsTab";
import { ArrowLeft } from "lucide-react";
import AppLayout from "@/components/AppLayout";

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
          toast.error("Project not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, navigate]);

  const content = () => {
    if (isLoading) {
      return (
        <div className="p-8 flex justify-center items-center">
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
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">AI Attribute Enrichment</h1>
          <div className="flex items-center text-primary hover:underline mt-1">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <Link to="/">Back to AI Attribute Enrichment Projects</Link>
          </div>
          <h2 className="text-xl font-bold mt-4">Attribute Extraction Project: {project.name}</h2>
        </div>
  
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <TabItem 
              isActive={activeTab === "setup"} 
              onClick={() => setActiveTab("setup")}
              number={1}
              label="Setup"
            />
            <TabItem 
              isActive={activeTab === "input"} 
              onClick={() => setActiveTab("input")}
              number={2}
              label="Input"
            />
            <TabItem 
              isActive={activeTab === "processing"} 
              onClick={() => setActiveTab("processing")}
              number={3}
              label="Processing"
            />
            <TabItem 
              isActive={activeTab === "results"} 
              onClick={() => setActiveTab("results")}
              number={4}
              label="Results"
            />
          </div>
        </div>
  
        {activeTab === "setup" && (
          <AESetupTab projectId={projectId!} />
        )}
        
        {activeTab === "input" && (
          <AEInputTab projectId={projectId!} onJobCreated={() => setActiveTab("processing")} />
        )}
        
        {activeTab === "processing" && (
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-6">Processing Data</h3>
            <AEResultsTab projectId={projectId!} />
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setActiveTab("input")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Input
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === "results" && (
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-6">Extraction Results</h3>
            <AEResultsTab projectId={projectId!} />
          </div>
        )}
      </div>
    );
  };

  // Use the AppLayout to make sure the project page is rendered within the app's layout
  return <AppLayout>{content()}</AppLayout>;
};

// Helper component for tabs
const TabItem = ({ 
  isActive, 
  onClick, 
  number, 
  label 
}: { 
  isActive: boolean, 
  onClick: () => void, 
  number: number, 
  label: string 
}) => {
  return (
    <button
      className={`flex items-center space-x-2 pb-2 border-b-2 px-1 ${
        isActive 
          ? "border-primary text-primary font-medium" 
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
      onClick={onClick}
    >
      <span>{number}. {label}</span>
    </button>
  );
};

export default AEProjectPage;
