export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  industry?: string;
  occupationDescription?: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface CareerInfo {
  experienceLevel: string;
  summary: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  university?: string;
  startYear: string;
  endYear: string;
  currentlyStudying: boolean;
  grade?: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  employmentType: string;
  location?: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  url?: string;
  contributions?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  organization: string;
  issueDate?: string;
  url?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  year?: string;
}

export interface ResumeSkills {
  programmingLanguages: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  frameworks: string[];
  tools: string[];
  other: string[];
  [key: string]: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  career: CareerInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: ResumeSkills;
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: string[];
  interests: string[];
  template: string;
}

export const INITIAL_RESUME_DATA: ResumeData = {
  personal: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  career: {
    experienceLevel: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: {
    programmingLanguages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    tools: [],
    other: [],
  },
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  interests: [],
  template: 'modern',
};

// Set nested path in object, e.g., 'personal.fullName' or 'career.summary'
export function setNestedValue(obj: any, path: string, value: any): any {
  const parts = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...(current[part] || {}) };
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

// Get nested value
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

// Compute section completion state
export function getSectionCompletion(resume: ResumeData): Record<string, boolean> {
  const totalSkills = Object.values(resume.skills || {}).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return {
    personal: Boolean(resume.personal.fullName && resume.personal.email && resume.personal.phone),
    career: Boolean(resume.career.summary && resume.career.summary.trim().length > 15),
    education: Boolean(resume.education && resume.education.length > 0),
    experience: Boolean(
      resume.career.experienceLevel === 'fresher'
        ? true
        : resume.experience && resume.experience.length > 0
    ),
    skills: totalSkills >= 3,
    projects: Boolean(resume.projects && resume.projects.length > 0),
    certifications: Boolean(resume.certifications && resume.certifications.length > 0),
    achievements: Boolean(resume.achievements && resume.achievements.length > 0),
    additional: Boolean((resume.languages && resume.languages.length > 0) || (resume.interests && resume.interests.length > 0)),
    review: true,
  };
}

// Calculate progress percentage (0 - 100)
export function calculateProgressPercentage(resume: ResumeData): number {
  const completions = getSectionCompletion(resume);
  const coreSections = ['personal', 'career', 'education', 'skills'];
  const bonusSections = ['experience', 'projects', 'certifications', 'achievements', 'additional'];

  let score = 0;
  coreSections.forEach((s) => {
    if (completions[s]) score += 18; // 4 * 18 = 72%
  });

  bonusSections.forEach((s) => {
    if (completions[s]) score += 5.6; // 5 * 5.6 = 28%
  });

  return Math.min(100, Math.round(score));
}

// Calculate total skill count
export function getTotalSkillCount(skills: ResumeSkills): number {
  if (!skills) return 0;
  return Object.values(skills).reduce((total, arr) => total + (Array.isArray(arr) ? arr.length : 0), 0);
}
