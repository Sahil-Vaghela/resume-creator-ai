import validationData from '../data/validation-rules.json';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validateInput(
  value: any,
  ruleName?: string,
  customValidation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    required?: boolean;
  },
  isRequired: boolean = false
): ValidationResult {
  // If field is optional and value is empty, it's valid
  if (!isRequired && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
    return { isValid: true };
  }

  // Required check
  if (isRequired) {
    if (value === undefined || value === null || value === '') {
      return { isValid: false, errorMessage: 'This field is required.' };
    }
    if (Array.isArray(value) && value.length === 0) {
      return { isValid: false, errorMessage: 'Please select or add at least one item.' };
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return { isValid: false, errorMessage: 'This field cannot be empty.' };
    }
  }

  const strValue = typeof value === 'string' ? value.trim() : String(value ?? '');

  // Check rule from validation-rules.json if specified
  if (ruleName && (validationData.rules as Record<string, any>)[ruleName]) {
    const rule: any = (validationData.rules as Record<string, any>)[ruleName];
    
    if (rule.minLength && strValue.length < rule.minLength) {
      return { isValid: false, errorMessage: rule.errorMessage || `Must be at least ${rule.minLength} characters.` };
    }
    if (rule.maxLength && strValue.length > rule.maxLength) {
      return { isValid: false, errorMessage: rule.errorMessage || `Must be at most ${rule.maxLength} characters.` };
    }
    if (rule.disallowedWords && Array.isArray(rule.disallowedWords)) {
      const lower = strValue.toLowerCase();
      if (rule.disallowedWords.some((w: string) => lower === w.toLowerCase() || lower.startsWith(w.toLowerCase() + ' '))) {
        return { isValid: false, errorMessage: rule.errorMessage || 'Please enter a valid answer, not a greeting.' };
      }
    }
    if (rule.pattern) {
      const regex = new RegExp(rule.pattern, 'i');
      if (!regex.test(strValue)) {
        return { isValid: false, errorMessage: rule.errorMessage };
      }
    }
  }

  // Check custom validation block
  if (customValidation) {
    if (customValidation.minLength && strValue.length < customValidation.minLength) {
      return { isValid: false, errorMessage: `Must be at least ${customValidation.minLength} characters.` };
    }
    if (customValidation.maxLength && strValue.length > customValidation.maxLength) {
      return { isValid: false, errorMessage: `Must be at most ${customValidation.maxLength} characters.` };
    }
    if (customValidation.pattern) {
      const regex = new RegExp(customValidation.pattern, 'i');
      if (!regex.test(strValue)) {
        return { isValid: false, errorMessage: 'Please enter a valid format.' };
      }
    }
  }

  return { isValid: true };
}
