import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { languages, type Language } from '@/lib/i18n';

export function LanguageSelector() {
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language as Language;

    const handleChangeLanguage = (lang: Language) => {
        i18n.changeLanguage(lang);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Languages className="h-4 w-4" />
                    <span className="sr-only">Change language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {(Object.keys(languages) as Language[]).map((lang) => (
                    <DropdownMenuItem
                        key={lang}
                        onClick={() => handleChangeLanguage(lang)}
                        className={currentLanguage === lang ? 'bg-accent' : ''}
                    >
                        <span className="mr-2">{languages[lang].flag}</span>
                        {languages[lang].name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
