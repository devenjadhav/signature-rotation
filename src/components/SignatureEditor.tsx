
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Signature } from '@/types/signature';

interface SignatureEditorProps {
  initialSignature?: Signature;
  onSave: (name: string, content: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const SignatureEditor: React.FC<SignatureEditorProps> = ({ 
  initialSignature, 
  onSave, 
  onCancel,
  isEditing = false
}) => {
  const [name, setName] = useState(initialSignature?.name || '');
  const [content, setContent] = useState(initialSignature?.content || '');
  const [nameError, setNameError] = useState('');
  const [contentError, setContentError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Signature name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    if (!content.trim()) {
      setContentError('Signature content is required');
      isValid = false;
    } else {
      setContentError('');
    }
    
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(name, content);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Signature' : 'Create New Signature'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Signature Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Professional, Casual, Marketing"
              className={nameError ? "border-red-500" : ""}
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Signature Content
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your HTML signature here..."
              className={`min-h-[200px] font-mono ${contentError ? "border-red-500" : ""}`}
            />
            {contentError && <p className="text-sm text-red-500">{contentError}</p>}
            <p className="text-xs text-gray-500">
              You can use HTML for formatting. For example: 
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">
                &lt;b&gt;Bold&lt;/b&gt;, &lt;i&gt;Italic&lt;/i&gt;, &lt;a href="..."&gt;Link&lt;/a&gt;
              </code>
            </p>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? 'Update Signature' : 'Create Signature'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignatureEditor;
