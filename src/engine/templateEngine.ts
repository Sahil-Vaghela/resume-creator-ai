import templatesData from '../data/templates.json';

export interface ResumeTemplate {
  id: string;
  name: string;
  tagline: string;
  recommendedFor: string;
  accentColor: string;
  fontFamily: string;
  badge: string;
  features: string[];
}

export function getAllTemplates(): ResumeTemplate[] {
  return templatesData as ResumeTemplate[];
}

export function getTemplateById(id: string): ResumeTemplate {
  const found = templatesData.find((t) => t.id === id);
  return (found || templatesData[0]) as ResumeTemplate;
}

export function formatDateString(dateStr?: string): string {
  if (!dateStr) return '';
  // Check if YYYY-MM
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    const [year, month] = dateStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mIndex = parseInt(month, 10) - 1;
    return `${months[mIndex] || month} ${year}`;
  }
  return dateStr;
}
