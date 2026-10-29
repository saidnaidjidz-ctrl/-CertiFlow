import type { TemplateConfig, Project } from '../types';
import { TEMPLATE_PRESETS, getPresetDataUrl } from './templatePresets';

const TEMPLATES_KEY = 'certiflow_templates_v2';
const PROJECTS_KEY = 'certiflow_projects_v2';

export const INITIAL_TEMPLATES: TemplateConfig[] = [];
export const INITIAL_PROJECTS: Project[] = [];

export function loadTemplates(): TemplateConfig[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Purge any legacy fake mock templates
    const cleaned = parsed.filter(t => !['tpl-academic-default', 'tpl-tech-hackathon', 'tpl-executive-mastery'].includes(t.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveTemplate(tpl: TemplateConfig): void {
  const all = loadTemplates();
  const idx = all.findIndex(t => t.id === tpl.id);
  if (idx >= 0) {
    all[idx] = { ...tpl, updatedAt: Date.now() };
  } else {
    all.unshift({ ...tpl, createdAt: Date.now(), updatedAt: Date.now() });
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
}

export function deleteTemplate(id: string): void {
  const all = loadTemplates().filter(t => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
}

export function duplicateTemplate(id: string): TemplateConfig | null {
  const all = loadTemplates();
  const tpl = all.find(t => t.id === id);
  if (!tpl) return null;
  const copy: TemplateConfig = {
    ...tpl,
    id: crypto.randomUUID(),
    name: `${tpl.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  all.unshift(copy);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
  return copy;
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Purge any legacy fake mock projects
    const cleaned = parsed.filter(p => !['proj-ai-summit', 'proj-honor-roll', 'proj-exec-mgmt'].includes(p.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveProject(project: Project): void {
  const all = loadProjects();
  const idx = all.findIndex(p => p.id === project.id);
  if (idx >= 0) {
    all[idx] = project;
  } else {
    all.unshift(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
}

export function deleteProject(id: string): void {
  const all = loadProjects().filter(p => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(all));
}

export function createNewTemplateFromPreset(presetId: string): TemplateConfig {
  const preset = TEMPLATE_PRESETS.find(p => p.id === presetId) || TEMPLATE_PRESETS[0];
  return {
    id: crypto.randomUUID(),
    name: `${preset.name} Certificate`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    pageSize: 'A4',
    orientation: preset.orientation,
    presetId: preset.id,
    templateFileType: 'preset',
    templateImageData: getPresetDataUrl(preset.id),
    templateFileName: `${preset.id}.svg`,
    namePosition: { ...preset.defaultPosition },
    textStyle: {
      fontFamily: preset.defaultFont,
      fontSize: preset.defaultFontSize,
      color: preset.defaultColor,
      align: preset.defaultPosition.x < 15 && preset.defaultPosition.width > 75 ? 'center' : 'left',
      autoShrink: true,
      maxFontSize: 60,
      minFontSize: 18,
    },
  };
}
