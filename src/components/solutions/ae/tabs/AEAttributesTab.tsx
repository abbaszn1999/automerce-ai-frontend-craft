
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  description: string | null;
  ae_attribute_values: AttributeValue[];
}

interface AEAttributesTabProps {
  projectId: string;
}

const AEAttributesTab = ({ projectId }: AEAttributesTabProps) => {
  const { callEdgeFunction } = useSupabase();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New attribute form state
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeDescription, setNewAttributeDescription] = useState("");
  const [newAttributeValues, setNewAttributeValues] = useState<string[]>([]);
  const [newAttributeValueInput, setNewAttributeValueInput] = useState("");
  const [isCreatingAttribute, setIsCreatingAttribute] = useState(false);

  const fetchAttributes = async () => {
    try {
      setIsLoading(true);
      const data = await callEdgeFunction("ae-attributes", {
        query: { projectId }
      });
      
      if (data.attributes) {
        setAttributes(data.attributes);
      }
    } catch (error) {
      console.error("Error fetching attributes:", error);
      toast.error("Failed to load attributes");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAttributes();
  }, [projectId, callEdgeFunction]);
  
  const handleAddAttributeValue = () => {
    if (!newAttributeValueInput.trim()) return;
    
    if (!newAttributeValues.includes(newAttributeValueInput.trim())) {
      setNewAttributeValues([...newAttributeValues, newAttributeValueInput.trim()]);
    }
    
    setNewAttributeValueInput("");
  };
  
  const handleRemoveAttributeValue = (value: string) => {
    setNewAttributeValues(newAttributeValues.filter(v => v !== value));
  };
  
  const handleCreateAttribute = async () => {
    if (!newAttributeName.trim()) {
      toast.error("Attribute name is required");
      return;
    }
    
    try {
      setIsCreatingAttribute(true);
      
      await callEdgeFunction("ae-attributes", {
        method: "POST",
        query: { projectId },
        body: {
          name: newAttributeName.trim(),
          description: newAttributeDescription.trim() || null,
          predefinedValues: newAttributeValues
        }
      });
      
      toast.success("Attribute created successfully");
      
      // Reset form
      setNewAttributeName("");
      setNewAttributeDescription("");
      setNewAttributeValues([]);
      
      // Refresh attributes
      fetchAttributes();
    } catch (error) {
      console.error("Error creating attribute:", error);
      toast.error("Failed to create attribute");
    } finally {
      setIsCreatingAttribute(false);
    }
  };
  
  const handleDeleteAttribute = async (attributeId: string) => {
    try {
      await callEdgeFunction("ae-attributes", {
        method: "DELETE",
        query: { projectId, attributeId }
      });
      
      toast.success("Attribute deleted successfully");
      
      // Refresh attributes
      fetchAttributes();
    } catch (error) {
      console.error("Error deleting attribute:", error);
      toast.error("Failed to delete attribute");
    }
  };

  if (isLoading && attributes.length === 0) {
    return <div className="p-4">Loading attributes...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Managed Attributes</CardTitle>
          <CardDescription>
            Define the attributes you want to extract from similar products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attributes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attributes defined yet. Create your first attribute below.
            </div>
          ) : (
            <div className="space-y-4">
              {attributes.map(attribute => (
                <div key={attribute.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-medium">{attribute.name}</h3>
                      {attribute.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {attribute.description}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteAttribute(attribute.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {attribute.ae_attribute_values.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Predefined Values:</p>
                      <div className="flex flex-wrap gap-2">
                        {attribute.ae_attribute_values.map(value => (
                          <Badge key={value.id} variant="outline">
                            {value.value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Attribute</CardTitle>
          <CardDescription>
            Create a new attribute to extract from product data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attribute_name">Attribute Name</Label>
              <Input
                id="attribute_name"
                placeholder="Color, Size, Material, etc."
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attribute_description">Description (Optional)</Label>
              <Textarea
                id="attribute_description"
                placeholder="Describe this attribute..."
                value={newAttributeDescription}
                onChange={(e) => setNewAttributeDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="attribute_values">Predefined Values (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="attribute_values"
                  placeholder="Enter a value and press Add..."
                  value={newAttributeValueInput}
                  onChange={(e) => setNewAttributeValueInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttributeValue())}
                />
                <Button type="button" onClick={handleAddAttributeValue}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Press Enter or click Add to add each value
              </p>
            </div>
            
            {newAttributeValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {newAttributeValues.map((value, index) => (
                  <Badge key={index} variant="secondary" className="pl-2">
                    {value}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttributeValue(value)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                onClick={handleCreateAttribute}
                disabled={isCreatingAttribute || !newAttributeName.trim()}
              >
                {isCreatingAttribute ? "Creating..." : "Create Attribute"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AEAttributesTab;
