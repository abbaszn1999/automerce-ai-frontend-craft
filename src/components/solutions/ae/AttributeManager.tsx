
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";

interface AttributeDefinition {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  options?: string[];
}

interface AttributeManagerProps {
  definitions: AttributeDefinition[];
  onSave: (definitions: AttributeDefinition[]) => void;
}

const AttributeManager: React.FC<AttributeManagerProps> = ({ definitions, onSave }) => {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>(definitions);
  const [newAttributeName, setNewAttributeName] = useState<string>("");
  const [newAttributeDescription, setNewAttributeDescription] = useState<string>("");
  const [newAttributeType, setNewAttributeType] = useState<string>("text");
  
  const addNewAttribute = () => {
    if (!newAttributeName.trim()) return;
    
    const newAttribute: AttributeDefinition = {
      id: Date.now().toString(),
      name: newAttributeName,
      description: newAttributeDescription,
      dataType: newAttributeType,
      options: newAttributeType === "select" ? ["Option 1"] : undefined
    };
    
    const updatedAttributes = [...attributes, newAttribute];
    setAttributes(updatedAttributes);
    onSave(updatedAttributes);
    
    // Reset form
    setNewAttributeName("");
    setNewAttributeDescription("");
    setNewAttributeType("text");
  };
  
  const deleteAttribute = (id: string) => {
    const updatedAttributes = attributes.filter(attr => attr.id !== id);
    setAttributes(updatedAttributes);
    onSave(updatedAttributes);
  };
  
  const addOption = (attributeId: string) => {
    const updatedAttributes = attributes.map(attr => {
      if (attr.id === attributeId) {
        const options = attr.options || [];
        return {
          ...attr,
          options: [...options, `Option ${options.length + 1}`]
        };
      }
      return attr;
    });
    
    setAttributes(updatedAttributes);
    onSave(updatedAttributes);
  };
  
  const updateOption = (attributeId: string, optionIndex: number, value: string) => {
    const updatedAttributes = attributes.map(attr => {
      if (attr.id === attributeId && attr.options) {
        const newOptions = [...attr.options];
        newOptions[optionIndex] = value;
        return { ...attr, options: newOptions };
      }
      return attr;
    });
    
    setAttributes(updatedAttributes);
    onSave(updatedAttributes);
  };
  
  const deleteOption = (attributeId: string, optionIndex: number) => {
    const updatedAttributes = attributes.map(attr => {
      if (attr.id === attributeId && attr.options) {
        const newOptions = attr.options.filter((_, index) => index !== optionIndex);
        return { ...attr, options: newOptions };
      }
      return attr;
    });
    
    setAttributes(updatedAttributes);
    onSave(updatedAttributes);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Product Attributes</h2>
      </div>
      
      {/* Add New Attribute Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Attribute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="attribute-name">Attribute Name*</Label>
              <Input
                id="attribute-name"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                placeholder="e.g., Color, Size, Material"
              />
            </div>
            
            <div>
              <Label htmlFor="attribute-description">Description</Label>
              <Input
                id="attribute-description"
                value={newAttributeDescription}
                onChange={(e) => setNewAttributeDescription(e.target.value)}
                placeholder="Describe this attribute"
              />
            </div>
            
            <div>
              <Label htmlFor="attribute-type">Data Type</Label>
              <select
                id="attribute-type"
                className="w-full p-2 border rounded"
                value={newAttributeType}
                onChange={(e) => setNewAttributeType(e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="select">Select (Options)</option>
              </select>
            </div>
          </div>
          
          <Button 
            onClick={addNewAttribute} 
            className="mt-4"
            disabled={!newAttributeName.trim()}
          >
            Add Attribute
          </Button>
        </CardContent>
      </Card>
      
      {/* Attribute List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Defined Attributes</h3>
        
        {attributes.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 border rounded-md">
            <p className="text-gray-500">No attributes defined yet. Add your first attribute above.</p>
          </div>
        ) : (
          attributes.map((attr) => (
            <Card key={attr.id} className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <h4 className="font-medium">{attr.name}</h4>
                  <p className="text-sm text-gray-500">{attr.description || "No description"}</p>
                  <p className="text-xs text-gray-400">Type: {attr.dataType}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteAttribute(attr.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              
              {attr.dataType === "select" && (
                <div className="mt-3 border-t pt-3">
                  <h5 className="text-sm font-medium mb-2">Options</h5>
                  <div className="space-y-2">
                    {attr.options?.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(attr.id, index, e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOption(attr.id, index)}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(attr.id)}
                      className="text-sm mt-2"
                    >
                      <PlusCircle className="h-3 w-3 mr-1" /> Add Option
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AttributeManager;
