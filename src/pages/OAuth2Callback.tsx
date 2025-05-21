import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleGoogleOAuthCallback } from '@/lib/googleOAuth';
import { useToast } from '@/hooks/use-toast';

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        await handleGoogleOAuthCallback();
        toast({
          title: 'Gmail Connected',
          description: 'Successfully connected to your Gmail account.',
        });
        navigate('/');
      } catch (error) {
        toast({
          title: 'Google OAuth Error',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        navigate('/settings');
      }
    })();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Connecting to Gmail...</div>
    </div>
  );
};

export default OAuth2Callback; 