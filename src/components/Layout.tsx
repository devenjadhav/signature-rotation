
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSignature } from '@/contexts/SignatureContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <header className="border-b bg-white/50 backdrop-blur-md dark:bg-gray-950/50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h1 className="font-semibold text-xl md:text-2xl">
              Gmail Signature Rotator
            </h1>
          </div>
          <ConnectedStatus />
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-10">
        {children}
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Gmail Signature Rotator</p>
      </footer>
    </div>
  );
};

const ConnectedStatus = () => {
  const { settings } = useSignature();

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${settings.connected ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'}`}></span>
        <span className="text-sm font-medium">
          {settings.connected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
    </div>
  );
};

export default Layout;
