
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, X, CheckCircle, XCircle } from "lucide-react";

interface AttributeManagerProps {
  attributes: Array<{ id: string; name: string; values: string[] }>;
  addAttribute: (name: string, values: string[]) => void;
  updateAttribute: (id: string, name: string, values: string[]) => void;
  deleteAttribute: (id: string) => void;
}

const AttributeManager: React.FC<AttributeManagerProps> = ({ 
  attributes, 
  addAttribute, 
  updateAttribute,
  deleteAttribute
}) => {
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValues, setNewAttributeValues] = useState("");
  
  const [editMode, setEditMode] = useState<{ id: string; name: string; values: string[] } | null>(null);
  const [newValue, setNewValue] = useState("");

  const handleAddAttribute = () => {
    if (!newAttributeName.trim()) {
      toast.error("Please enter an attribute name.");
      return;
    }

    // Parse values from the textarea
    const values = newAttributeValues
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);

    if (values.length === 0) {
      toast.error("Please enter at least one attribute value.");
      return;
    }

    addAttribute(newAttributeName, values);
    setNewAttributeName("");
    setNewAttributeValues("");
    
    toast.success("Attribute added successfully");
  };

  const handleStartEdit = (id: string, name: string, values: string[]) => {
    setEditMode({ id, name, values: [...values] });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setNewValue("");
  };

  const handleSaveEdit = () => {
    if (!editMode) return;
    
    if (!editMode.name.trim()) {
      toast.error("Attribute name cannot be empty");
      return;
    }
    
    if (editMode.values.length === 0) {
      toast.error("Attribute must have at least one value");
      return;
    }
    
    updateAttribute(editMode.id, editMode.name, editMode.values);
    setEditMode(null);
    setNewValue("");
    
    toast.success("Attribute updated successfully");
  };

  const handleDeleteAttribute = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the attribute "${name}"?`)) {
      deleteAttribute(id);
      toast.success("Attribute deleted successfully");
    }
  };

  const handleAddValueToEdit = () => {
    if (!editMode || !newValue.trim()) return;
    
    const trimmedValue = newValue.trim();
    if (editMode.values.includes(trimmedValue)) {
      toast.error("This value already exists");
      return;
    }
    
    setEditMode({
      ...editMode,
      values: [...editMode.values, trimmedValue]
    });
    
    setNewValue("");
  };

  const handleRemoveValueFromEdit = (value: string) => {
    if (!editMode) return;
    
    setEditMode({
      ...editMode,
      values: editMode.values.filter(v => v !== value)
    });
  };

  return (
    <div className="card" id="attribute-management-card">
      <h3 className="text-lg font-medium mb-4">Attribute Management</h3>
      
      {/* Attribute List */}
      <div id="attribute-list-container" className="mb-6">
        {attributes.length === 0 ? (
          <div id="no-attributes-message" className="text-gray-500 mb-4">
            No attributes have been defined yet. Add your first attribute below.
          </div>
        ) : (
          attributes.map(attribute => (
            <div key={attribute.id} className="attribute-block">
              {editMode && editMode.id === attribute.id ? (
                // Edit Mode
                <div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Attribute Name</label>
                    <input
                      type="text"
                      value={editMode.name}
                      onChange={(e) => setEditMode({ ...editMode, name: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Values</label>
                    <div className="flex flex-wrap gap-1 p-2 border rounded mb-2 min-h-[80px]">
                      {editMode.values.map((value, index) => (
                        <div key={index} className="value-tag">
                          {value}
                          <button
                            onClick={() => handleRemoveValueFromEdit(value)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex">
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Add new value"
                        className="flex-1 p-2 border rounded-l"
                      />
                      <button
                        onClick={handleAddValueToEdit}
                        className="btn btn-outline rounded-l-none"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-outline flex items-center gap-1"
                    >
                      <XCircle size={16} />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="btn btn-primary flex items-center gap-1"
                    >
                      <CheckCircle size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-medium">{attribute.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartEdit(attribute.id, attribute.name, attribute.values)}
                        className="btn btn-sm btn-outline p-1 h-8 w-8 flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteAttribute(attribute.id, attribute.name)}
                        className="btn btn-sm btn-outline p-1 h-8 w-8 flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {attribute.values.map((value, index) => (
                      <span key={index} className="value-tag">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add New Attribute */}
      <div className="border-t pt-4">
        <h4 className="text-base font-medium mb-3">Add New Attribute</h4>
        <div className="space-y-3">
          <div>
            <label htmlFor="new-attribute-name" className="block text-sm font-medium mb-1">
              Attribute Name
            </label>
            <input
              id="new-attribute-name"
              type="text"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g., Size, Color, Material"
            />
          </div>
          
          <div>
            <label htmlFor="new-attribute-values" className="block text-sm font-medium mb-1">
              Attribute Values (comma-separated)
            </label>
            <textarea
              id="new-attribute-values"
              value={newAttributeValues}
              onChange={(e) => setNewAttributeValues(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="e.g., Small, Medium, Large"
            />
          </div>
          
          <div className="text-right">
            <button
              onClick={handleAddAttribute}
              className="btn btn-primary flex items-center gap-1"
            >
              <Plus size={16} />
              <span>Add Attribute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttributeManager;
