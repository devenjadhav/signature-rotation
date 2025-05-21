
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureProvider } from '@/contexts/SignatureContext';
import { useSignature } from '@/contexts/SignatureContext';
import SignatureEditor from '@/components/SignatureEditor';
import SignatureCard from '@/components/SignatureCard';
import SignaturePreview from '@/components/SignaturePreview';
import SettingsForm from '@/components/SettingsForm';
import IntegrationInfo from '@/components/IntegrationInfo';
import Layout from '@/components/Layout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const SignatureList = () => {
  const { signatures, deleteSignature, setActiveSignature, updateSignature } = useSignature();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSignature, setEditingSignature] = useState<string | null>(null);
  const [signatureToDelete, setSignatureToDelete] = useState<string | null>(null);
  
  const handleAddSignature = (name: string, content: string) => {
    setIsCreating(false);
  };
  
  const handleUpdateSignature = (name: string, content: string) => {
    if (editingSignature) {
      updateSignature(editingSignature, name, content);
      setEditingSignature(null);
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingSignature(null);
  };

  const handleDeleteConfirm = () => {
    if (signatureToDelete) {
      deleteSignature(signatureToDelete);
      setSignatureToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setSignatureToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Signatures</h2>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating || editingSignature !== null}>
          Add New Signature
        </Button>
      </div>

      {isCreating && (
        <SignatureEditor 
          onSave={handleAddSignature} 
          onCancel={handleCancelEdit}
        />
      )}

      {editingSignature && (
        <SignatureEditor 
          initialSignature={signatures.find(sig => sig.id === editingSignature)} 
          onSave={handleUpdateSignature} 
          onCancel={handleCancelEdit}
          isEditing
        />
      )}

      {!isCreating && editingSignature === null && (
        <>
          {signatures.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {signatures.map((signature) => (
                <SignatureCard 
                  key={signature.id} 
                  signature={signature} 
                  onEdit={() => setEditingSignature(signature.id)}
                  onDelete={() => setSignatureToDelete(signature.id)}
                  onSetActive={() => setActiveSignature(signature.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No Signatures Created Yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first signature to get started with the rotation.
              </p>
              <Button onClick={() => setIsCreating(true)}>Create Your First Signature</Button>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!signatureToDelete} onOpenChange={() => setSignatureToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this signature. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const IndexContent = () => {
  return (
    <Tabs defaultValue="signatures" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="signatures">Signatures</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="integration">Integration Guide</TabsTrigger>
      </TabsList>
      
      <div className="space-y-8">
        <SignaturePreview />
        
        <TabsContent value="signatures" className="mt-6">
          <SignatureList />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SettingsForm />
        </TabsContent>
        
        <TabsContent value="integration" className="mt-6">
          <IntegrationInfo />
        </TabsContent>
      </div>
    </Tabs>
  );
};

const Index = () => {
  return (
    <SignatureProvider>
      <Layout>
        <IndexContent />
      </Layout>
    </SignatureProvider>
  );
};

export default Index;
