import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard-static";
import { useState } from "react";
import { Globe } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('🇮🇹 Italiano');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
  ];

  const handleLanguageSelect = (language: any) => {
    setCurrentLanguage(`${language.flag} ${language.name}`);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <Globe style={{ width: '16px', height: '16px' }} />
        Language
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 10001,
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {languages.map((language) => (
            <div
              key={language.code}
              onClick={() => handleLanguageSelect(language)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'system-ui, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Language Dropdown - Posizionato sopra tutto */}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 10000
      }}>
        <LanguageDropdown />
      </div>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
