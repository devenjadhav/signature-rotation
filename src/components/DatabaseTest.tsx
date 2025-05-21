import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testDatabaseConnection } from '@/lib/test-db';
import { useToast } from '@/hooks/use-toast';

export function DatabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testDatabaseConnection();
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Database tests completed successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
      toast({
        title: "Error",
        description: "Failed to run database tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Database Connection Test</h2>
      <Button
        onClick={runTests}
        disabled={isLoading}
      >
        {isLoading ? 'Running Tests...' : 'Run Database Tests'}
      </Button>
      
      {testResult && (
        <div className={`p-4 rounded-md ${
          testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="font-medium">{testResult.message}</p>
        </div>
      )}
    </div>
  );
} 