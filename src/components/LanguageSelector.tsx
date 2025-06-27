
import { useState } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
];

const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const { toast } = useToast();

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    
    // In a real app, this would update i18n context
    const langName = languages.find(l => l.code === langCode)?.name;
    
    toast({
      title: "Language Changed",
      description: `App language set to ${langName}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Globe size={16} />
          <span className="ml-1">{languages.find(l => l.code === currentLang)?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {languages.map(language => (
          <DropdownMenuItem 
            key={language.code}
            className={currentLang === language.code ? "bg-gray-100" : ""}
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
