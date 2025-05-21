
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Signature, RotationFrequency, AppSettings } from '@/types/signature';
import { useToast } from "@/hooks/use-toast";

interface SignatureContextType {
  signatures: Signature[];
  activeSignature: Signature | null;
  settings: AppSettings;
  addSignature: (name: string, content: string) => void;
  updateSignature: (id: string, name: string, content: string) => void;
  deleteSignature: (id: string) => void;
  setActiveSignature: (id: string) => void;
  rotateSignature: () => Signature | null;
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

export const useSignature = () => {
  const context = useContext(SignatureContext);
  if (context === undefined) {
    throw new Error('useSignature must be used within a SignatureProvider');
  }
  return context;
};

interface SignatureProviderProps {
  children: ReactNode;
}

const STORAGE_KEY_SIGNATURES = 'gmail-signature-rotator-signatures';
const STORAGE_KEY_SETTINGS = 'gmail-signature-rotator-settings';

export const SignatureProvider: React.FC<SignatureProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [signatures, setSignatures] = useState<Signature[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIGNATURES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(sig => ({
          ...sig,
          createdAt: new Date(sig.createdAt)
        })) : [];
      } catch (e) {
        console.error('Failed to parse signatures from localStorage:', e);
        return [];
      }
    }
    return [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse settings from localStorage:', e);
      }
    }
    return {
      rotationEnabled: true,
      rotationFrequency: RotationFrequency.EVERY_EMAIL,
      zapierWebhookUrl: '',
      connected: false,
    };
  });

  const activeSignature = signatures.find(sig => sig.active) || null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIGNATURES, JSON.stringify(signatures));
  }, [signatures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  const addSignature = (name: string, content: string) => {
    const newSignature: Signature = {
      id: uuidv4(),
      name,
      content,
      active: signatures.length === 0, // Make active if it's the first signature
      createdAt: new Date(),
    };

    setSignatures(prev => [...prev, newSignature]);
    toast({
      title: "Signature created",
      description: `"${name}" has been added to your signatures.`,
    });
  };

  const updateSignature = (id: string, name: string, content: string) => {
    setSignatures(prev => 
      prev.map(sig => 
        sig.id === id ? { ...sig, name, content } : sig
      )
    );
    toast({
      title: "Signature updated",
      description: `"${name}" has been updated.`,
    });
  };

  const deleteSignature = (id: string) => {
    const sigToDelete = signatures.find(sig => sig.id === id);
    
    setSignatures(prev => {
      const filtered = prev.filter(sig => sig.id !== id);
      
      // If we're deleting the active signature, make another one active
      if (sigToDelete?.active && filtered.length > 0) {
        filtered[0].active = true;
      }
      
      return filtered;
    });
    
    if (sigToDelete) {
      toast({
        title: "Signature deleted",
        description: `"${sigToDelete.name}" has been removed.`,
      });
    }
  };

  const setActiveSignature = (id: string) => {
    setSignatures(prev => 
      prev.map(sig => ({
        ...sig,
        active: sig.id === id
      }))
    );
    
    const newActive = signatures.find(sig => sig.id === id);
    if (newActive) {
      toast({
        title: "Active signature changed",
        description: `"${newActive.name}" is now your active signature.`,
      });
    }
  };

  const rotateSignature = () => {
    if (signatures.length <= 1) {
      return activeSignature;
    }

    const currentIndex = signatures.findIndex(sig => sig.active);
    const nextIndex = (currentIndex + 1) % signatures.length;

    setActiveSignature(signatures[nextIndex].id);
    return signatures[nextIndex];
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    signatures,
    activeSignature,
    settings,
    addSignature,
    updateSignature,
    deleteSignature,
    setActiveSignature,
    rotateSignature,
    updateSettings,
  };

  return (
    <SignatureContext.Provider value={value}>
      {children}
    </SignatureContext.Provider>
  );
};
