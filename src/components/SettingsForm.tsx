import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSignature } from '@/contexts/SignatureContext';
import { RotationFrequency, AppSettings } from '@/types/signature';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { startGoogleOAuth, getGoogleAccessToken, clearGoogleAccessToken } from '@/lib/googleOAuth';

const SettingsForm: React.FC = () => {
  const { settings, updateSettings } = useSignature();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(settings.zapierWebhookUrl);
  const [gmailConnected, setGmailConnected] = useState(!!getGoogleAccessToken());

  const handleToggleRotation = () => {
    updateSettings({ rotationEnabled: !settings.rotationEnabled });
    toast({
      title: settings.rotationEnabled ? "Rotation disabled" : "Rotation enabled",
      description: settings.rotationEnabled 
        ? "Signature rotation has been turned off." 
        : "Your signatures will now rotate automatically.",
    });
  };

  const handleFrequencyChange = (value: string) => {
    updateSettings({ rotationFrequency: value as RotationFrequency });
    toast({
      title: "Rotation frequency updated",
      description: `Signatures will now rotate ${value.replace('_', ' ')}.`,
    });
  };

  const handleWebhookSave = () => {
    updateSettings({ 
      zapierWebhookUrl: webhookUrl,
      connected: !!webhookUrl
    });
    toast({
      title: "Zapier webhook updated",
      description: webhookUrl
        ? "Your Gmail signature rotator is now connected to Zapier."
        : "Zapier webhook has been removed.",
    });
  };

  const testWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Testing webhook...",
      description: "Sending a test request to your Zapier webhook.",
    });

    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Required for webhook URLs
      body: JSON.stringify({
        action: "test_connection",
        timestamp: new Date().toISOString(),
      }),
    })
    .then(() => {
      toast({
        title: "Test sent successfully",
        description: "Check your Zapier dashboard to see if the test was received.",
      });
    })
    .catch((error) => {
      console.error("Error testing webhook:", error);
      toast({
        title: "Error testing webhook",
        description: "Something went wrong. Please check the URL and try again.",
        variant: "destructive",
      });
    });
  };

  const handleConnectGmail = () => {
    startGoogleOAuth();
  };

  const handleDisconnectGmail = () => {
    clearGoogleAccessToken();
    setGmailConnected(false);
    toast({
      title: 'Disconnected',
      description: 'Gmail account disconnected.',
    });
  };

  // Optionally, update state if token changes (e.g., after callback)
  React.useEffect(() => {
    setGmailConnected(!!getGoogleAccessToken());
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Gmail Direct Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button onClick={handleConnectGmail} disabled={gmailConnected}>
              {gmailConnected ? 'Gmail Connected' : 'Connect to Gmail'}
            </Button>
            {gmailConnected && (
              <Button variant="outline" onClick={handleDisconnectGmail}>
                Disconnect
              </Button>
            )}
          </div>
          {gmailConnected && (
            <div className="text-green-700 text-sm">Your Gmail account is connected. You can now update your signature directly.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rotation Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rotation" className="text-base">Enable Signature Rotation</Label>
              <p className="text-sm text-muted-foreground">
                Automatically rotate between your signatures
              </p>
            </div>
            <Switch
              id="rotation"
              checked={settings.rotationEnabled}
              onCheckedChange={handleToggleRotation}
            />
          </div>

          <div>
            <h3 className="mb-2 text-base font-medium">Rotation Frequency</h3>
            <RadioGroup 
              value={settings.rotationFrequency} 
              onValueChange={handleFrequencyChange}
              className="space-y-2"
              disabled={!settings.rotationEnabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RotationFrequency.EVERY_EMAIL} id="every_email" />
                <Label htmlFor="every_email" className={!settings.rotationEnabled ? "opacity-50" : ""}>
                  Every Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RotationFrequency.DAILY} id="daily" />
                <Label htmlFor="daily" className={!settings.rotationEnabled ? "opacity-50" : ""}>
                  Daily
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={RotationFrequency.WEEKLY} id="weekly" />
                <Label htmlFor="weekly" className={!settings.rotationEnabled ? "opacity-50" : ""}>
                  Weekly
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Zapier Connection</span>
            {settings.connected && <Badge className="bg-green-500">Connected</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Connecting to Gmail</p>
              <p className="text-sm">
                To connect with Gmail, create a Zapier webhook that triggers when this app sends 
                a signature rotation request, then use a Gmail action to update your signature.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">Zapier Webhook URL</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="font-mono text-sm"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleWebhookSave}>
              Save Webhook URL
            </Button>
            {webhookUrl && (
              <Button variant="outline" onClick={testWebhook}>
                Test Connection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsForm;
