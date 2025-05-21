import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Signature, RotationFrequency, AppSettings } from '@/types/signature';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { getLatestSentMessageId, updateGmailSignature } from '@/lib/gmailApi';

type SignatureRow = Database['public']['Tables']['signatures']['Row'];
type SettingsRow = Database['public']['Tables']['settings']['Row'];

interface SignatureContextType {
  signatures: Signature[];
  activeSignature: Signature | null;
  settings: AppSettings;
  addSignature: (name: string, content: string) => Promise<void>;
  updateSignature: (id: string, name: string, content: string) => Promise<void>;
  deleteSignature: (id: string) => Promise<void>;
  setActiveSignature: (id: string) => Promise<void>;
  rotateSignature: () => Signature | null;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

interface SignatureProviderProps {
  children: ReactNode;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

export const SignatureProvider: React.FC<SignatureProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    rotationEnabled: true,
    rotationFrequency: RotationFrequency.EVERY_EMAIL,
    zapierWebhookUrl: '',
    connected: false,
  });

  const activeSignature = signatures.find(sig => sig.active) || null;

  // Load signatures and settings when user changes
  useEffect(() => {
    if (user) {
      loadSignatures();
      loadSettings();
    } else {
      setSignatures([]);
      setSettings({
        rotationEnabled: true,
        rotationFrequency: RotationFrequency.EVERY_EMAIL,
        zapierWebhookUrl: '',
        connected: false,
      });
    }
  }, [user]);

  // Update Gmail signature immediately when activeSignature changes and Gmail is connected
  useEffect(() => {
    const gmailConnected = !!window.sessionStorage.getItem('google_access_token');
    if (gmailConnected && activeSignature) {
      updateGmailSignature(activeSignature.content)
        .then(() => {
          toast({
            title: 'Gmail Signature Updated',
            description: `Your Gmail signature is now set to "${activeSignature.name}".`,
          });
        })
        .catch((err) => {
          console.error('Error updating Gmail signature:', err);
          toast({
            title: 'Error updating Gmail signature',
            description: err.message,
            variant: 'destructive',
          });
        });
    }
  }, [activeSignature]);

  // Polling for sent mail to rotate signature
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    let isActive = true;

    async function pollAndRotate() {
      try {
        // Only run if Gmail is connected, rotation is enabled, and there are at least 2 signatures
        const gmailConnected = !!window.sessionStorage.getItem('google_access_token');
        if (!gmailConnected || !settings.rotationEnabled || signatures.length < 2) return;

        const lastProcessedId = window.sessionStorage.getItem('last_sent_message_id');
        const latestId = await getLatestSentMessageId();
        if (!latestId) return;
        if (latestId !== lastProcessedId) {
          // New sent message detected
          const nextSignature = rotateSignature();
          if (nextSignature) {
            await updateGmailSignature(nextSignature.content);
            window.sessionStorage.setItem('last_sent_message_id', latestId);
            toast({
              title: 'Signature Rotated',
              description: `Signature rotated to "${nextSignature.name}" after sending an email.`,
            });
          }
        }
      } catch (error) {
        console.error('Error in Gmail polling/rotation:', error);
      }
    }

    // Start polling if Gmail is connected and rotation is enabled
    if (user && settings.rotationEnabled && signatures.length > 1) {
      pollAndRotate(); // Run immediately on mount
      interval = setInterval(() => {
        if (isActive) pollAndRotate();
      }, 30000); // 30 seconds
    }
    return () => {
      isActive = false;
      if (interval) clearInterval(interval);
    };
  }, [user, settings.rotationEnabled, signatures.length]);

  const loadSignatures = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading signatures:', error);
      toast({
        title: "Error",
        description: "Failed to load signatures",
        variant: "destructive",
      });
      return;
    }

    setSignatures(data.map(sig => ({
      id: sig.id,
      name: sig.name,
      content: sig.content,
      active: sig.active,
      createdAt: new Date(sig.created_at),
    })));
  };

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setSettings({
        rotationEnabled: data.rotation_enabled,
        rotationFrequency: data.rotation_frequency as RotationFrequency,
        zapierWebhookUrl: data.zapier_webhook_url,
        connected: data.connected,
      });
    }
  };

  const addSignature = async (name: string, content: string) => {
    if (!user) return;

    const newSignature: Signature = {
      id: uuidv4(),
      name,
      content,
      active: signatures.length === 0,
      createdAt: new Date(),
    };

    const { error } = await supabase
      .from('signatures')
      .insert({
        id: newSignature.id,
        user_id: user.id,
        name: newSignature.name,
        content: newSignature.content,
        active: newSignature.active,
        created_at: newSignature.createdAt.toISOString(),
      });

    if (error) {
      console.error('Error adding signature:', error);
      toast({
        title: "Error",
        description: "Failed to add signature",
        variant: "destructive",
      });
      return;
    }

    setSignatures(prev => [...prev, newSignature]);
    toast({
      title: "Signature created",
      description: `"${name}" has been added to your signatures.`,
    });

    // If this is the first signature and Gmail is connected, update Gmail signature
    const gmailConnected = !!window.sessionStorage.getItem('google_access_token');
    if (gmailConnected && newSignature.active) {
      try {
        await updateGmailSignature(newSignature.content);
        toast({
          title: 'Gmail Signature Updated',
          description: `Your Gmail signature is now set to "${newSignature.name}".`,
        });
      } catch (err) {
        console.error('Error updating Gmail signature:', err);
        toast({
          title: 'Error updating Gmail signature',
          description: err.message,
          variant: 'destructive',
        });
      }
    }
  };

  const updateSignature = async (id: string, name: string, content: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('signatures')
      .update({ name, content })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating signature:', error);
      toast({
        title: "Error",
        description: "Failed to update signature",
        variant: "destructive",
      });
      return;
    }

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

  const deleteSignature = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('signatures')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting signature:', error);
      toast({
        title: "Error",
        description: "Failed to delete signature",
        variant: "destructive",
      });
      return;
    }

    setSignatures(prev => prev.filter(sig => sig.id !== id));
    toast({
      title: "Signature deleted",
      description: "The signature has been removed.",
    });
  };

  const setActiveSignature = async (id: string) => {
    if (!user) return;

    // First, set all signatures to inactive
    const { error: updateError } = await supabase
      .from('signatures')
      .update({ active: false })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating signatures:', updateError);
      return;
    }

    // Then, set the selected signature to active
    const { error: setActiveError } = await supabase
      .from('signatures')
      .update({ active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (setActiveError) {
      console.error('Error setting active signature:', setActiveError);
      toast({
        title: "Error",
        description: "Failed to set active signature",
        variant: "destructive",
      });
      return;
    }

    setSignatures(prev =>
      prev.map(sig => ({
        ...sig,
        active: sig.id === id,
      }))
    );

    // Update Gmail signature if Gmail is connected
    const gmailConnected = !!window.sessionStorage.getItem('google_access_token');
    const newActive = signatures.find(sig => sig.id === id);
    if (gmailConnected && newActive) {
      try {
        await updateGmailSignature(newActive.content);
        toast({
          title: 'Gmail Signature Updated',
          description: `Your Gmail signature is now set to "${newActive.name}".`,
        });
      } catch (err) {
        console.error('Error updating Gmail signature:', err);
        toast({
          title: 'Error updating Gmail signature',
          description: err.message,
          variant: 'destructive',
        });
      }
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };

    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        rotation_enabled: updatedSettings.rotationEnabled,
        rotation_frequency: updatedSettings.rotationFrequency,
        zapier_webhook_url: updatedSettings.zapierWebhookUrl,
        connected: updatedSettings.connected,
      });

    if (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      return;
    }

    setSettings(updatedSettings);
  };

  const rotateSignature = () => {
    if (!signatures.length) return null;

    const currentIndex = signatures.findIndex(sig => sig.active);
    const nextIndex = (currentIndex + 1) % signatures.length;
    const nextSignature = signatures[nextIndex];

    setActiveSignature(nextSignature.id);
    return nextSignature;
  };

  return (
    <SignatureContext.Provider
      value={{
        signatures,
        activeSignature,
        settings,
        addSignature,
        updateSignature,
        deleteSignature,
        setActiveSignature,
        rotateSignature,
        updateSettings,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignature = () => {
  const context = useContext(SignatureContext);
  if (context === undefined) {
    throw new Error('useSignature must be used within a SignatureProvider');
  }
  return context;
};
