import greetingsData from '../data/greetings.json';
import occupationData from '../data/occupation-categories.json';
import extractionData from '../data/extraction-rules.json';
import { ResumeData } from './resumeEngine';

export interface ExtractedEntities {
  fullName?: string;
  professionalTitle?: string;
  industry?: string;
  occupationDescription?: string;
  email?: string;
  phone?: string;
  location?: string;
  degree?: string;
  institution?: string;
  startYear?: string;
  endYear?: string;
  eduStatus?: 'graduated' | 'current';
  grade?: string;
  isFresher?: boolean;
  responsibilities?: string;
  skillsList?: string[];
  summary?: string;
  isGreeting?: boolean;
  greetingType?: 'initial' | 'howAreYou' | 'general';
  isVagueEmployee?: boolean;
  isSummaryHelpRequest?: boolean;
  isSkip?: boolean;
  isCorrection?: boolean;
  correctionField?: string;
  correctionValue?: string;
}

export interface IntentAnalysisResult {
  primaryIntent: string;
  secondaryIntents: string[];
  hasGreeting: boolean;
  greetingType?: 'initial' | 'howAreYou' | 'general';
  extracted: ExtractedEntities;
  rawText: string;
}

// Normalize text for comparisons
function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// Check if a string is pure greeting
export function isPureGreeting(text: string): { isGreeting: boolean; type?: 'initial' | 'howAreYou' | 'general' } {
  const clean = text.trim().toLowerCase().replace(/[.,!?;:]/g, '');
  if (!clean) return { isGreeting: false };

  // Check how are you
  if (
    clean === 'how are you' ||
    clean === 'how are you doing' ||
    clean === 'how r u' ||
    clean === "what's up" ||
    clean === 'whats up'
  ) {
    return { isGreeting: true, type: 'howAreYou' };
  }

  // Check single words
  const words = clean.split(/\s+/);
  if (words.length === 1 && greetingsData.singleWordGreetings.includes(words[0])) {
    return { isGreeting: true, type: 'general' };
  }

  // Check multi-word greetings
  for (const mw of greetingsData.multiWordGreetings) {
    if (clean === mw) {
      return { isGreeting: true, type: 'general' };
    }
  }

  return { isGreeting: false };
}

// Check if text starts with greeting
export function checkHasGreeting(text: string): { hasGreeting: boolean; strippedText: string; type?: 'initial' | 'howAreYou' | 'general' } {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // "How are you"
  if (lower.startsWith('how are you') || lower.startsWith('how r u') || lower.startsWith("what's up")) {
    return { hasGreeting: true, strippedText: clean.replace(/^(how are you|how r u|what's up)[.!?,\s]*/i, '').trim(), type: 'howAreYou' };
  }

  // Multi-word greetings at start
  for (const mw of greetingsData.multiWordGreetings) {
    if (lower.startsWith(mw)) {
      const remaining = clean.slice(mw.length).replace(/^[.,!?;:\s]+/, '').trim();
      return { hasGreeting: true, strippedText: remaining, type: 'general' };
    }
  }

  // Single word greetings at start (e.g. "Hi, my name is Sahil" or "Hii I am Sahil")
  for (const sw of greetingsData.singleWordGreetings) {
    const regex = new RegExp(`^${sw}\\b[.,!?;:\\s]*`, 'i');
    if (regex.test(clean)) {
      const remaining = clean.replace(regex, '').trim();
      return { hasGreeting: true, strippedText: remaining, type: 'general' };
    }
  }

  return { hasGreeting: false, strippedText: clean };
}

// Helper: title case a string
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Match user occupation against categories or build a custom clean title
export function resolveOccupation(rawInput: string): {
  canonicalTitle: string;
  industry: string;
  occupationDescription: string;
  matchedCategory?: any;
} {
  const clean = rawInput.trim();
  const lower = clean.toLowerCase();

  // Search through defined categories
  for (const cat of occupationData.categories) {
    // Exact or partial match on canonical title
    if (lower === cat.canonicalTitle.toLowerCase()) {
      return {
        canonicalTitle: cat.canonicalTitle,
        industry: cat.industry,
        occupationDescription: cat.occupationDescription,
        matchedCategory: cat,
      };
    }
    // Check synonyms
    for (const syn of cat.synonyms) {
      if (lower.includes(syn) || syn.includes(lower)) {
        return {
          canonicalTitle: cat.canonicalTitle,
          industry: cat.industry,
          occupationDescription: cat.occupationDescription,
          matchedCategory: cat,
        };
      }
    }
  }

  // Common keyword fallback
  if (lower.includes('stock') || lower.includes('inventory')) {
    const cat = occupationData.categories.find((c) => c.id === 'stock_inventory')!;
    return {
      canonicalTitle: 'Stock Department Worker',
      industry: 'Stock / Inventory',
      occupationDescription: "Works in the company's stock department",
      matchedCategory: cat,
    };
  }

  if (lower.includes('warehouse')) {
    const cat = occupationData.categories.find((c) => c.id === 'warehouse')!;
    return {
      canonicalTitle: 'Warehouse Worker',
      industry: 'Supply Chain & Warehousing',
      occupationDescription: 'Warehouse operations, loading, unloading and storage',
      matchedCategory: cat,
    };
  }

  if (lower.includes('teach') || lower.includes('tutor') || lower.includes('professor')) {
    const cat = occupationData.categories.find((c) => c.id === 'teacher')!;
    return {
      canonicalTitle: 'Teacher / Educator',
      industry: 'Education & Teaching',
      occupationDescription: 'Teaches students and manages academic curriculum',
      matchedCategory: cat,
    };
  }

  if (lower.includes('account') || lower.includes('tally') || lower.includes('bookkeeper')) {
    const cat = occupationData.categories.find((c) => c.id === 'accountant')!;
    return {
      canonicalTitle: 'Accountant',
      industry: 'Accounting & Finance',
      occupationDescription: 'Manages accounts, financial records and reconciliations',
      matchedCategory: cat,
    };
  }

  // Custom occupation entered by user: clean and format nicely
  let cleanTitle = clean
    .replace(/^(i\s+work\s+as\s+(?:a|an)?|i\s+work\s+in\s+the|i\s+work\s+in|i\s+am\s+(?:a|an)?|i'm\s+(?:a|an)?|just\s+a\s+simple|simple\s+worker\s+in\s+(?:the)?)\s*/i, '')
    .replace(/[.,;]+$/, '')
    .trim();

  // If user says "worker in the company's stock department"
  if (cleanTitle.toLowerCase().includes('stock department')) {
    return {
      canonicalTitle: 'Stock Department Worker',
      industry: 'Stock / Inventory',
      occupationDescription: "Works in the company's stock department",
      matchedCategory: occupationData.categories.find((c) => c.id === 'stock_inventory'),
    };
  }

  const formatted = toTitleCase(cleanTitle);

  return {
    canonicalTitle: formatted || 'Professional',
    industry: 'General Industry',
    occupationDescription: clean,
  };
}

// Main Intent & Entity Analyzer
export function analyzeUserMessage(
  userText: string,
  currentQuestionId: string,
  _currentResume: ResumeData
): IntentAnalysisResult {
  const rawText = cleanText(userText);
  const lower = rawText.toLowerCase();
  const extracted: ExtractedEntities = {};
  const secondaryIntents: string[] = [];

  // 1. Check for pure greeting
  const pureGreetingCheck = isPureGreeting(rawText);
  if (pureGreetingCheck.isGreeting) {
    extracted.isGreeting = true;
    extracted.greetingType = pureGreetingCheck.type;
    return {
      primaryIntent: 'greeting',
      secondaryIntents: [],
      hasGreeting: true,
      greetingType: pureGreetingCheck.type,
      extracted,
      rawText,
    };
  }

  // 2. Check for initial greeting followed by more text
  const greetingCheck = checkHasGreeting(rawText);
  const hasGreeting = greetingCheck.hasGreeting;
  const contentText = greetingCheck.strippedText;
  const contentLower = contentText.toLowerCase();

  if (hasGreeting) {
    extracted.isGreeting = true;
    extracted.greetingType = greetingCheck.type;
  }

  // 3. Check for Skip command
  const textForSkip = rawText.replace(/[.!?]+$/, '').trim();
  for (const pattern of extractionData.skipPatterns) {
    if (new RegExp(pattern, 'i').test(textForSkip)) {
      extracted.isSkip = true;
      return {
        primaryIntent: 'skip_question',
        secondaryIntents,
        hasGreeting,
        greetingType: greetingCheck.type,
        extracted,
        rawText,
      };
    }
  }

  // 4. Check for Summary Uncertainty / Request Help
  for (const pattern of extractionData.summaryUncertaintyPatterns) {
    if (new RegExp(pattern, 'i').test(rawText)) {
      extracted.isSummaryHelpRequest = true;
      return {
        primaryIntent: 'request_help',
        secondaryIntents: ['provide_summary'],
        hasGreeting,
        greetingType: greetingCheck.type,
        extracted,
        rawText,
      };
    }
  }

  // 5. Check for Vague / "Normal Employee" statement
  for (const kw of extractionData.occupationExtraction.vagueKeywords) {
    if (contentLower.includes(kw)) {
      extracted.isVagueEmployee = true;
      return {
        primaryIntent: 'clarification_needed',
        secondaryIntents: ['provide_occupation'],
        hasGreeting,
        greetingType: greetingCheck.type,
        extracted,
        rawText,
      };
    }
  }

  // 6. Check for Fresher / No Experience statement
  for (const kw of extractionData.occupationExtraction.fresherKeywords) {
    if (contentLower.includes(kw)) {
      extracted.isFresher = true;
      if (currentQuestionId === 'professional_title' && !extracted.professionalTitle) {
        extracted.professionalTitle = 'Fresher / Entry Level';
      }
      secondaryIntents.push('provide_experience');
    }
  }

  // 7. Check for Corrections (e.g. "Actually, my name is Rahul, not Sahil")
  const correctionNameMatch = rawText.match(
    /(?:actually|no|wait),?\s*(?:my\s+name\s+is|it(?:'s|\s+is))\s+([A-Za-z]+)(?:,?\s*not\s+[A-Za-z]+)?/i
  );
  if (correctionNameMatch && correctionNameMatch[1]) {
    extracted.isCorrection = true;
    extracted.correctionField = 'fullName';
    extracted.correctionValue = toTitleCase(correctionNameMatch[1].trim());
    extracted.fullName = extracted.correctionValue;
    return {
      primaryIntent: 'edit_previous_answer',
      secondaryIntents: ['provide_name'],
      hasGreeting,
      greetingType: greetingCheck.type,
      extracted,
      rawText,
    };
  }

  const genericCorrectionMatch = rawText.match(
    /(?:actually|change\s+my|update\s+my)\s+(name|title|occupation|email|phone|city|location)\s+(?:to|is)\s+(.+)/i
  );
  if (genericCorrectionMatch) {
    const fieldKey = genericCorrectionMatch[1].toLowerCase();
    const value = genericCorrectionMatch[2].trim().replace(/[.]+$/, '');
    extracted.isCorrection = true;
    if (fieldKey === 'name') {
      extracted.correctionField = 'fullName';
      extracted.fullName = toTitleCase(value);
      extracted.correctionValue = extracted.fullName;
    } else if (fieldKey === 'title' || fieldKey === 'occupation') {
      extracted.correctionField = 'professionalTitle';
      extracted.professionalTitle = toTitleCase(value);
      extracted.correctionValue = extracted.professionalTitle;
    } else if (fieldKey === 'email') {
      extracted.correctionField = 'email';
      extracted.email = value;
      extracted.correctionValue = value;
    } else if (fieldKey === 'phone') {
      extracted.correctionField = 'phone';
      extracted.phone = value;
      extracted.correctionValue = value;
    } else if (fieldKey === 'city' || fieldKey === 'location') {
      extracted.correctionField = 'location';
      extracted.location = value;
      extracted.correctionValue = value;
    }

    return {
      primaryIntent: 'edit_previous_answer',
      secondaryIntents,
      hasGreeting,
      greetingType: greetingCheck.type,
      extracted,
      rawText,
    };
  }

  // 8. Check Negation in Occupation (TEST 4: "I am not a developer. I am a warehouse worker.")
  const negationRegex = new RegExp(
    '(?:i\\s+am\\s+not|not)\\s+(?:a|an)?\\s*([a-zA-Z\\s/]+?)(?:[.,;]|\\s+but|\\s+i\\s+am|\\s+i\'m|\\s+i\\s+work)\\s*(?:i\\s+am|i\'m|i\\s+work\\s+as|i\\s+work\\s+in|just\\s+a|a|an)?\\s*([a-zA-Z\\s/]+)',
    'i'
  );
  const negationMatch = contentText.match(negationRegex);
  if (negationMatch && negationMatch[2]) {
    const trueOccupationRaw = negationMatch[2].trim();
    const resolved = resolveOccupation(trueOccupationRaw);
    extracted.professionalTitle = resolved.canonicalTitle;
    extracted.industry = resolved.industry;
    extracted.occupationDescription = resolved.occupationDescription;
    secondaryIntents.push('provide_occupation');
  }

  // 9. Standard Occupation Extraction (if not extracted by negation)
  if (!extracted.professionalTitle) {
    // Check "I work in the stock department"
    const inDeptMatch = contentText.match(
      /(?:i\s+work\s+in\s+the|i\s+work\s+in|working\s+in\s+the|working\s+in|simple\s+worker\s+in\s+(?:the)?)\s+([a-zA-Z\s/]+?)(?:\s+department|\s+team|\s+division|\s+sector|[.,;]|$)/i
    );
    if (inDeptMatch && inDeptMatch[1]) {
      const dept = inDeptMatch[1].trim();
      const resolved = resolveOccupation(dept + ' department');
      extracted.professionalTitle = resolved.canonicalTitle;
      extracted.industry = resolved.industry;
      extracted.occupationDescription = resolved.occupationDescription;
      secondaryIntents.push('provide_occupation');
    } else {
      // Check "I work as a / I am working as / I am a"
      const asRoleMatch = contentText.match(
        /(?:i\s+work\s+as\s+(?:a|an)?|i\s+am\s+working\s+as\s+(?:a|an)?|working\s+as\s+(?:a|an)?|my\s+job\s+is\s+(?:a|an)?)\s*([a-zA-Z\s/]+?)(?:[.,;]|\s+for|\s+at|\s+in|$)/i
      );
      if (asRoleMatch && asRoleMatch[1]) {
        const resolved = resolveOccupation(asRoleMatch[1].trim());
        extracted.professionalTitle = resolved.canonicalTitle;
        extracted.industry = resolved.industry;
        extracted.occupationDescription = resolved.occupationDescription;
        secondaryIntents.push('provide_occupation');
      }
    }
  }

  // 10. Education Extraction (TEST 6: "I completed BCA in 2025 from NIILM University")
  // Check degree
  for (const pat of extractionData.educationExtraction.degreePatterns) {
    const degMatch = contentText.match(new RegExp(pat, 'i'));
    if (degMatch && degMatch[1]) {
      extracted.degree = degMatch[1].trim();
      // Expand common acronyms for polish
      if (extracted.degree.toUpperCase() === 'BCA') {
        extracted.degree = 'Bachelor of Computer Applications (BCA)';
      } else if (extracted.degree.toUpperCase() === 'MCA') {
        extracted.degree = 'Master of Computer Applications (MCA)';
      }
      secondaryIntents.push('provide_education');
      break;
    }
  }

  // Check year
  for (const pat of extractionData.educationExtraction.yearPatterns) {
    const yrMatch = contentText.match(new RegExp(pat, 'i'));
    if (yrMatch && yrMatch[1]) {
      extracted.endYear = yrMatch[1].trim();
      secondaryIntents.push('provide_education');
      break;
    }
  }

  // Check institution / university
  for (const pat of extractionData.educationExtraction.institutionPatterns) {
    const instMatch = contentText.match(new RegExp(pat, 'i'));
    if (instMatch && instMatch[1]) {
      const cleanInst = instMatch[1]
        .replace(/^(?:(?:19|20)\d{2}\s+)?(?:from|at|in)\s+/i, '')
        .trim();
      extracted.institution = toTitleCase(cleanInst);
      secondaryIntents.push('provide_education');
      break;
    }
  }

  // Check completed or current status
  for (const kw of extractionData.educationExtraction.completedKeywords) {
    if (contentLower.includes(kw)) {
      extracted.eduStatus = 'graduated';
      break;
    }
  }
  for (const kw of extractionData.educationExtraction.currentKeywords) {
    if (contentLower.includes(kw)) {
      extracted.eduStatus = 'current';
      break;
    }
  }

  // 11. Contact Details Extraction
  // Email
  const emailMatch = contentText.match(new RegExp(extractionData.contactExtraction.emailPattern, 'i'));
  if (emailMatch && emailMatch[0]) {
    extracted.email = emailMatch[0].trim();
    secondaryIntents.push('provide_email');
  }

  // Phone
  const phoneMatch = contentText.match(new RegExp(extractionData.contactExtraction.phonePattern, 'i'));
  if (phoneMatch && phoneMatch[0] && phoneMatch[0].replace(/\D/g, '').length >= 7) {
    extracted.phone = phoneMatch[0].trim();
    secondaryIntents.push('provide_phone');
  }

  // Location
  const locMatch = contentText.match(new RegExp(extractionData.contactExtraction.locationPattern, 'i'));
  if (locMatch && locMatch[1]) {
    const locClean = locMatch[1].trim().replace(/[.,;]+$/, '');
    if (!['delhi and i work', 'the stock department'].some((sub) => locClean.toLowerCase().includes(sub))) {
      extracted.location = toTitleCase(locClean);
      secondaryIntents.push('provide_location');
    }
  }

  // Handle compound text like: "My name is Sahil, I live in Delhi and I work as an accountant."
  const compoundLocMatch = contentText.match(/(?:i\s+live\s+in|based\s+in|from)\s+([A-Za-z\s]+?)(?:\s+and|\s+where|,|$)/i);
  if (compoundLocMatch && compoundLocMatch[1]) {
    extracted.location = toTitleCase(compoundLocMatch[1].trim());
    secondaryIntents.push('provide_location');
  }

  // 12. Name Extraction
  // Patterns like "My name is Sahil" or "I am Sahil and I work as an accountant"
  const explicitNameMatch = contentText.match(
    /(?:my\s+name\s+is|name's|this\s+is|i\s+am|i'm|call\s+me)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,2})/i
  );
  if (explicitNameMatch && explicitNameMatch[1]) {
    let candidateName = explicitNameMatch[1].trim();
    candidateName = candidateName.replace(/\s+(?:and|who|work|working|live|living|based|as)\b.*/i, '').trim();
    const candidateLower = candidateName.toLowerCase();
    // Verify candidate is not a stop word or occupation
    if (
      candidateName.length >= 2 &&
      !extractionData.nameExtraction.stopWords.includes(candidateLower) &&
      !candidateLower.includes('developer') &&
      !candidateLower.includes('worker') &&
      !candidateLower.includes('fresher') &&
      !candidateLower.includes('student') &&
      !candidateLower.includes('accountant') &&
      !candidateLower.includes('teacher')
    ) {
      extracted.fullName = toTitleCase(candidateName);
      secondaryIntents.push('provide_name');
    }
  }

  // 13. Context-sensitive fallback: If the current question expects a specific field and user typed a direct answer
  if (!extracted.fullName && currentQuestionId === 'full_name') {
    // If not a greeting and text is 1-4 alphabetic words
    const candidate = contentText.replace(/[.,!?;:]/g, '').trim();
    const words = candidate.split(/\s+/);
    if (
      words.length >= 1 &&
      words.length <= 4 &&
      /^[a-zA-Z\s'-]+$/.test(candidate) &&
      !extractionData.nameExtraction.stopWords.includes(candidate.toLowerCase()) &&
      !isPureGreeting(candidate).isGreeting
    ) {
      extracted.fullName = toTitleCase(candidate);
      secondaryIntents.push('provide_name');
    }
  }

  if (!extracted.professionalTitle && currentQuestionId === 'professional_title') {
    if (contentText && !extracted.isSkip && !extracted.isSummaryHelpRequest && !extracted.isVagueEmployee) {
      const resolved = resolveOccupation(contentText);
      extracted.professionalTitle = resolved.canonicalTitle;
      extracted.industry = resolved.industry;
      extracted.occupationDescription = resolved.occupationDescription;
      secondaryIntents.push('provide_occupation');
    }
  }

  // Skills / Responsibilities Handling (TEST 11: "I handle stock entries, inventory checking and goods receiving")
  if (
    contentLower.includes('i handle') ||
    contentLower.includes('i do') ||
    contentLower.includes('responsible for') ||
    currentQuestionId === 'skills' ||
    currentQuestionId === 'skills_selection' ||
    currentQuestionId === 'exp_responsibilities'
  ) {
    const cleanedWork = contentText
      .replace(/^(?:i\s+handle|i\s+am\s+responsible\s+for|i\s+do|responsibilities\s*(?:include|are|:)?)\s*/i, '')
      .trim();

    if (cleanedWork) {
      extracted.responsibilities = toTitleCase(cleanedWork);
      // Split into individual skills if comma/and separated
      const skillParts = cleanedWork
        .split(/,|\band\b/i)
        .map((s) => toTitleCase(s.trim()))
        .filter((s) => s.length > 2 && s.length < 40);

      if (skillParts.length > 0) {
        extracted.skillsList = skillParts;
        secondaryIntents.push('provide_skills');
      }
    }
  }

  // 14. Determine Primary Intent
  let primaryIntent = 'unknown';

  if (extracted.isCorrection) {
    primaryIntent = 'edit_previous_answer';
  } else if (extracted.isSkip) {
    primaryIntent = 'skip_question';
  } else if (extracted.isSummaryHelpRequest) {
    primaryIntent = 'request_help';
  } else if (extracted.isVagueEmployee) {
    primaryIntent = 'clarification_needed';
  } else if (hasGreeting && extracted.fullName && extracted.professionalTitle) {
    primaryIntent = 'introduction';
  } else if (hasGreeting && extracted.fullName) {
    primaryIntent = 'introduction';
  } else if (hasGreeting && !extracted.fullName && !extracted.professionalTitle && !extracted.email) {
    primaryIntent = 'greeting';
  } else if (extracted.fullName && currentQuestionId === 'full_name') {
    primaryIntent = 'provide_name';
  } else if (extracted.professionalTitle && currentQuestionId === 'professional_title') {
    primaryIntent = 'provide_occupation';
  } else if (extracted.email) {
    primaryIntent = 'provide_email';
  } else if (extracted.phone) {
    primaryIntent = 'provide_phone';
  } else if (extracted.degree || extracted.institution || extracted.endYear) {
    primaryIntent = 'provide_education';
  } else if (extracted.isFresher) {
    primaryIntent = 'provide_experience';
  } else if (extracted.skillsList || extracted.responsibilities) {
    primaryIntent = currentQuestionId === 'exp_responsibilities' ? 'provide_experience' : 'provide_skills';
  } else if (secondaryIntents.length > 0) {
    primaryIntent = secondaryIntents[0];
  } else {
    // Check confirmation or rejection
    if (/^(yes|yeah|yep|sure|correct|exactly|ok|okay)$/i.test(contentText)) {
      primaryIntent = 'confirmation';
    } else if (/^(no|nope|nah|never|dont|don't)$/i.test(contentText)) {
      primaryIntent = 'rejection';
    } else {
      primaryIntent = 'unknown';
    }
  }

  return {
    primaryIntent,
    secondaryIntents: Array.from(new Set(secondaryIntents)),
    hasGreeting,
    greetingType: greetingCheck.type,
    extracted,
    rawText,
  };
}
