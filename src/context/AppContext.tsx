import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TemplateConfig, Participant, CertificateResult, AppView, WizardStep, Project, Language, Theme } from '../types';
import {
  loadTemplates,
  saveTemplate as storeSaveTemplate,
  deleteTemplate as storeDeleteTemplate,
  duplicateTemplate as storeDuplicateTemplate,
  loadProjects,
  saveProject as storeSaveProject,
  deleteProject as storeDeleteProject,
  createNewTemplateFromPreset
} from '../services/storage';
import { getTranslation } from '../services/translations';
import type { TranslationKey } from '../services/translations';

interface ToastState {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

interface AppContextType {
  view: AppView;
  setView: (v: AppView) => void;
  wizardStep: WizardStep;
  setWizardStep: (s: WizardStep) => void;
  currentTemplate: TemplateConfig | null;
  setCurrentTemplate: (t: TemplateConfig | null) => void;
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  results: CertificateResult[];
  setResults: (r: CertificateResult[]) => void;
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;
  templates: TemplateConfig[];
  saveTemplate: (t: TemplateConfig) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => TemplateConfig | null;
  projects: Project[];
  saveProject: (p: Project) => void;
  deleteProject: (id: string) => void;
  resetWizard: () => void;
  startBatchWithTemplate: (t: TemplateConfig) => void;
  startBatchWithPreset: (presetId: string) => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('dashboard');
  const [wizardStep, setWizardStep] = useState<WizardStep>('template');
  const [currentTemplate, setCurrentTemplate] = useState<TemplateConfig | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [results, setResults] = useState<CertificateResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<TemplateConfig[]>(loadTemplates);
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Language state (default Arabic 'ar' as requested)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('certiflow_lang');
    return saved === 'en' ? 'en' : 'ar';
  });

  // Theme state (Day / Night mode) — defaults to light
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('certiflow_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('certiflow_lang', language);
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('certiflow_theme', theme);
  }, [theme]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const setTheme = useCallback((tMode: Theme) => {
    setThemeState(tMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    return getTranslation(language, key, params);
  }, [language]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveTemplate = useCallback((tConfig: TemplateConfig) => {
    storeSaveTemplate(tConfig);
    setTemplates(loadTemplates());
    showToast(t('toastTemplateSaved'), 'success');
  }, [showToast, t]);

  const deleteTemplate = useCallback((id: string) => {
    storeDeleteTemplate(id);
    setTemplates(loadTemplates());
    showToast(t('toastTemplateDeleted'), 'info');
  }, [showToast, t]);

  const duplicateTemplate = useCallback((id: string) => {
    const copy = storeDuplicateTemplate(id);
    setTemplates(loadTemplates());
    if (copy) {
      showToast(t('toastTemplateDuplicated'), 'success');
    }
    return copy;
  }, [showToast, t]);

  const saveProject = useCallback((p: Project) => {
    storeSaveProject(p);
    setProjects(loadProjects());
  }, []);

  const deleteProject = useCallback((id: string) => {
    storeDeleteProject(id);
    setProjects(loadProjects());
    showToast(t('toastProjectRemoved'), 'info');
  }, [showToast, t]);

  const resetWizard = useCallback(() => {
    setWizardStep('template');
    setCurrentTemplate(null);
    setParticipants([]);
    setResults([]);
    setIsGenerating(false);
  }, []);

  const startBatchWithTemplate = useCallback((tConfig: TemplateConfig) => {
    setWizardStep('template');
    setCurrentTemplate({ ...tConfig });
    setParticipants([]);
    setResults([]);
    setIsGenerating(false);
    setView('create');
  }, []);

  const startBatchWithPreset = useCallback((presetId: string) => {
    const newTpl = createNewTemplateFromPreset(presetId);
    setWizardStep('template');
    setCurrentTemplate(newTpl);
    setParticipants([]);
    setResults([]);
    setIsGenerating(false);
    setView('create');
  }, []);

  const value = useMemo(() => ({
    view,
    setView,
    wizardStep,
    setWizardStep,
    currentTemplate,
    setCurrentTemplate,
    participants,
    setParticipants,
    results,
    setResults,
    isGenerating,
    setIsGenerating,
    templates,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    projects,
    saveProject,
    deleteProject,
    resetWizard,
    startBatchWithTemplate,
    startBatchWithPreset,
    toasts,
    showToast,
    removeToast,
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme,
    t,
  }), [
    view,
    wizardStep,
    currentTemplate,
    participants,
    results,
    isGenerating,
    templates,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    projects,
    saveProject,
    deleteProject,
    resetWizard,
    startBatchWithTemplate,
    startBatchWithPreset,
    toasts,
    showToast,
    removeToast,
    language,
    setLanguage,
    theme,
    setTheme,
    toggleTheme,
    t,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
