import questionsData from '../data/questions.json';
import suggestionsData from '../data/suggestions.json';
import occupationData from '../data/occupation-categories.json';
import { getNestedValue, ResumeData } from './resumeEngine';

export interface QuestionDef {
  id: string;
  section: string;
  question: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  skipAllowed?: boolean;
  field?: string;
  recordSection?: string;
  recordField?: string;
  validationRule?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  suggestionsKey?: string;
  suggestions?: string[];
  optionsKey?: string;
  options?: Array<{ value: string; label: string; desc?: string }>;
  tip?: string;
  allowCustomAnswer?: boolean;
  acceptedIntents?: string[];
}

export function getQuestionById(questionId: string): QuestionDef | undefined {
  return questionsData.questions.find((q) => q.id === questionId) as QuestionDef | undefined;
}

export function formatQuestionPrompt(questionDef: QuestionDef, resume: ResumeData, currentRecord?: any): string {
  let text = questionDef.question;

  // Substitute {personal.fullName}
  text = text.replace(/\{personal\.fullName\}/g, resume.personal?.fullName || 'there');

  // Substitute {personal.professionalTitle}
  text = text.replace(/\{personal\.professionalTitle\}/g, resume.personal?.professionalTitle || 'professional');

  // Substitute other nested tokens if present
  text = text.replace(/\{([\w.]+)\}/g, (match, path) => {
    if (currentRecord && currentRecord[path]) {
      return currentRecord[path];
    }
    const val = getNestedValue(resume, path);
    return val !== undefined && val !== null && val !== '' ? String(val) : '';
  });

  return text;
}

// Find matched occupation category if any
export function findMatchedOccupationCategory(titleOrIndustry?: string) {
  if (!titleOrIndustry) return null;
  const lower = titleOrIndustry.toLowerCase();

  for (const cat of occupationData.categories) {
    if (
      lower.includes(cat.canonicalTitle.toLowerCase()) ||
      cat.canonicalTitle.toLowerCase().includes(lower) ||
      cat.synonyms.some((s) => lower.includes(s) || s.includes(lower))
    ) {
      return cat;
    }
  }

  return null;
}

export function getSuggestionsForQuestion(questionDef: QuestionDef, resume?: ResumeData): string[] {
  // 1. If question is about skills or responsibilities, customize based on user's occupation
  if (
    questionDef.id === 'skills' ||
    questionDef.id === 'skills_selection' ||
    questionDef.id === 'exp_responsibilities'
  ) {
    const occupationCat = findMatchedOccupationCategory(resume?.personal?.professionalTitle);
    if (occupationCat) {
      if (questionDef.id === 'exp_responsibilities' && occupationCat.sampleResponsibilities) {
        return occupationCat.sampleResponsibilities;
      }
      if (occupationCat.defaultSkills) {
        return occupationCat.defaultSkills;
      }
    }
  }

  // 2. Direct question suggestions
  if (questionDef.suggestions && questionDef.suggestions.length > 0) {
    return questionDef.suggestions;
  }

  // 3. Suggestions from key
  if (questionDef.suggestionsKey && (suggestionsData as any)[questionDef.suggestionsKey]) {
    return (suggestionsData as any)[questionDef.suggestionsKey];
  }

  return [];
}

export function getOptionsForQuestion(questionDef: QuestionDef): Array<{ value: string; label: string; desc?: string }> {
  if (questionDef.options && questionDef.options.length > 0) {
    return questionDef.options;
  }
  if (questionDef.optionsKey && (suggestionsData as any)[questionDef.optionsKey]) {
    const rawOptions = (suggestionsData as any)[questionDef.optionsKey];
    if (Array.isArray(rawOptions)) {
      if (typeof rawOptions[0] === 'string') {
        return rawOptions.map((opt: string) => ({ value: opt, label: opt }));
      }
      return rawOptions;
    }
  }
  return [];
}

export function getSummarySuggestions(
  experienceLevel: string = 'fresher',
  professionalTitle?: string
): Array<{ category: string; text: string }> {
  // Check if occupation category has custom summary templates
  const occupationCat = findMatchedOccupationCategory(professionalTitle);
  if (occupationCat && occupationCat.summaryTemplates && occupationCat.summaryTemplates.length > 0) {
    return occupationCat.summaryTemplates.map((t, idx) => ({
      category: `${occupationCat.canonicalTitle} ${idx + 1}`,
      text: t,
    }));
  }

  const isFresher = experienceLevel === 'fresher';
  const templates = suggestionsData.summaryTemplates || [];

  return templates
    .filter((t) => (isFresher ? t.level === 'fresher' : t.level === 'experienced'))
    .map((t) => ({ category: t.category, text: t.text }));
}
