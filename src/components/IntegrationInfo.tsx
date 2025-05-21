
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const IntegrationInfo: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>How to Integrate with Gmail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Setting up the Zapier Integration</h3>
            <ol className="list-decimal list-inside space-y-4 ml-2">
              <li>
                <span className="font-medium">Create a new Zap in Zapier</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Log in to your Zapier account and click "Create Zap".
                </p>
              </li>
              <li>
                <span className="font-medium">Choose "Webhooks by Zapier" as your trigger</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Select "Catch Hook" as the trigger event to create a webhook URL.
                </p>
              </li>
              <li>
                <span className="font-medium">Copy your webhook URL</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  After setting up the webhook trigger, Zapier will provide a unique URL. Copy this URL.
                </p>
              </li>
              <li>
                <span className="font-medium">Paste the webhook URL in the Settings tab</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Add the URL to the "Zapier Webhook URL" field in the Settings tab and click "Save Webhook URL".
                </p>
              </li>
              <li>
                <span className="font-medium">Test the connection</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Click "Test Connection" to send a test payload to Zapier and continue setting up your Zap.
                </p>
              </li>
              <li>
                <span className="font-medium">Choose Gmail as your action service</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  Select "Gmail" and then choose "Update Email Signature" as the action.
                </p>
              </li>
              <li>
                <span className="font-medium">Set up the signature template</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  In the Zapier action setup, use the "Signature Content" variable from the webhook to update your Gmail signature.
                </p>
              </li>
              <li>
                <span className="font-medium">Turn on your Zap</span>
                <p className="text-sm text-muted-foreground mt-1 ml-6">
                  After testing, turn on your Zap to start automatically updating your Gmail signature.
                </p>
              </li>
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Example Webhook Payload</h3>
            <pre className="bg-black text-green-400 p-3 rounded text-sm overflow-x-auto">
              {JSON.stringify({
                action: "update_signature",
                signature_content: "<div>Your Name<br>Your Title<br>Your Company</div>",
                timestamp: "2025-05-21T10:30:00Z"
              }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationInfo;
