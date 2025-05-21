
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignature } from '@/contexts/SignatureContext';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SignaturePreview: React.FC = () => {
  const { activeSignature, rotateSignature, settings } = useSignature();
  const { toast } = useToast();

  const handleRotateSignature = () => {
    const nextSignature = rotateSignature();
    
    if (nextSignature) {
      // If we have a webhook URL, notify Zapier
      if (settings.connected && settings.zapierWebhookUrl) {
        try {
          fetch(settings.zapierWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            mode: "no-cors", // Required for webhook URLs
            body: JSON.stringify({
              action: "update_signature",
              signature_content: nextSignature.content,
              signature_name: nextSignature.name,
              timestamp: new Date().toISOString(),
            }),
          });
          
          toast({
            title: "Signature rotated",
            description: `"${nextSignature.name}" is now your active signature and will be used for new emails.`,
          });
        } catch (error) {
          console.error("Error notifying Zapier:", error);
          toast({
            title: "Error updating Gmail",
            description: "The signature was rotated locally but we couldn't notify Gmail.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Signature rotated locally",
          description: "Connect to Zapier to automatically update your Gmail signature.",
        });
      }
    } else {
      toast({
        title: "Cannot rotate signatures",
        description: "You need at least two signatures to use the rotation feature.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Active Signature</span>
          {activeSignature && (
            <Button onClick={handleRotateSignature} disabled={!settings.rotationEnabled}>
              Rotate Now
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeSignature ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 border rounded-md p-4">
              <div dangerouslySetInnerHTML={{ __html: activeSignature.content }} />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>This is your current active signature: <strong>{activeSignature.name}</strong></p>
              {settings.rotationEnabled ? (
                <p>Rotation mode: <span className="font-medium">{settings.rotationFrequency.replace('_', ' ')}</span></p>
              ) : (
                <p>Rotation is currently disabled.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No active signature set.</p>
            <p className="text-sm mt-2">Create a signature to see it previewed here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignaturePreview;
