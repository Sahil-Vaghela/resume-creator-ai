import flowData from '../data/conversation-flow.json';
import chatbotResponses from '../data/chatbot-responses.json';
import responseRules from '../data/response-rules.json';
import { getQuestionById, QuestionDef, formatQuestionPrompt } from './questionEngine';
import { ResumeData, setNestedValue } from './resumeEngine';
import { analyzeUserMessage } from './intentEngine';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  questionId?: string;
  field?: string;
  timestamp: string;
  type?: string;
  data?: any;
  isEditable?: boolean;
}

export interface ConversationStepResult {
  nextQuestionId: string | null;
  updatedResume: ResumeData;
  updatedMessages: ChatMessage[];
  updatedCurrentRecord: any;
  isCompleted: boolean;
  botFollowUpText?: string;
}

export function getInitialQuestionId(): string {
  return flowData.startQuestionId || 'full_name';
}

// Check if a question is already answered in the resume
export function isQuestionAlreadyAnswered(questionId: string, resume: ResumeData): boolean {
  switch (questionId) {
    case 'full_name':
      return Boolean(resume.personal?.fullName && resume.personal.fullName.trim().length > 1);
    case 'professional_title':
      return Boolean(resume.personal?.professionalTitle && resume.personal.professionalTitle.trim().length > 1);
    case 'email':
      return Boolean(resume.personal?.email && resume.personal.email.includes('@'));
    case 'phone':
      return Boolean(resume.personal?.phone && resume.personal.phone.trim().length > 5);
    case 'location':
      return Boolean(resume.personal?.location && resume.personal.location.trim().length > 1);
    case 'experience_level':
      return Boolean(resume.career?.experienceLevel);
    case 'summary':
      return Boolean(resume.career?.summary && resume.career.summary.trim().length > 15);
    default:
      return false;
  }
}

// Find next relevant question, skipping already answered fields
export function determineNextQuestionId(
  currentQuestionId: string,
  userAnswer: any,
  resume: ResumeData,
  currentRecord: any = {}
): string | null {
  // If fresher, bypass work experience questions
  const isFresher =
    resume.career?.experienceLevel === 'fresher' ||
    (typeof userAnswer === 'string' && userAnswer.toLowerCase() === 'fresher');

  const step = flowData.steps.find((s) => s.questionId === currentQuestionId);
  let candidateNext: string | null = null;

  if (step) {
    if (step.conditions && step.conditions.length > 0) {
      for (const rawCond of step.conditions) {
        const cond = rawCond as any;
        if (cond.answerEquals !== undefined) {
          if (String(userAnswer).toLowerCase() === String(cond.answerEquals).toLowerCase()) {
            candidateNext = cond.next;
            break;
          }
        }
        if (cond.contextCheck && currentRecord[cond.contextCheck] !== undefined) {
          if (Boolean(currentRecord[cond.contextCheck]) === true) {
            candidateNext = cond.next;
            break;
          }
        }
      }
    }

    if (!candidateNext) {
      candidateNext = step.defaultNext === 'DONE' ? null : step.defaultNext;
    }
  }

  // Fresher bypass logic: skip exp_check and exp_* questions directly to skills
  if (isFresher) {
    if (candidateNext === 'exp_check' || (candidateNext && candidateNext.startsWith('exp_'))) {
      candidateNext = 'skills_selection';
    }
  }

  // If candidate question is already answered in multi-entity extraction, skip to next
  let safetyLoop = 0;
  while (candidateNext && safetyLoop < 10) {
    safetyLoop++;
    if (isQuestionAlreadyAnswered(candidateNext, resume)) {
      const nextStep = flowData.steps.find((s) => s.questionId === candidateNext);
      if (nextStep && nextStep.defaultNext && nextStep.defaultNext !== 'DONE') {
        candidateNext = nextStep.defaultNext;
        if (isFresher && candidateNext && (candidateNext === 'exp_check' || candidateNext.startsWith('exp_'))) {
          candidateNext = 'skills_selection';
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return candidateNext;
}

// Generate encouragement or confirmation
export function getRandomEncouragement(): string {
  const list = chatbotResponses.encouragements;
  return list[Math.floor(Math.random() * list.length)];
}

// Main Intelligent Conversational Answer Processor
export function processAnswer(
  currentQuestion: QuestionDef,
  userAnswer: any,
  currentResume: ResumeData,
  currentRecord: any = {},
  existingMessages: ChatMessage[] = []
): ConversationStepResult {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  let updatedResume: ResumeData = JSON.parse(JSON.stringify(currentResume));
  let updatedRecord: any = { ...currentRecord };
  const userDisplayText = typeof userAnswer === 'string' ? userAnswer : String(userAnswer ?? '');

  // 1. Analyze input using the Local Intent Engine
  const analysis = analyzeUserMessage(userDisplayText, currentQuestion.id, updatedResume);
  const { primaryIntent, extracted, hasGreeting } = analysis;

  // Add User Message to History
  const userMessage: ChatMessage = {
    id: `msg-user-${Date.now()}`,
    sender: 'user',
    text: userDisplayText,
    questionId: currentQuestion.id,
    field: currentQuestion.field || currentQuestion.recordField,
    timestamp,
    isEditable: true,
  };
  const updatedMessages = [...existingMessages, userMessage];

  // -------------------------------------------------------------
  // TEST 1: Pure Greeting (e.g. "Hii", "Hello", "Good morning", "How are you?")
  // Do NOT save greeting into any resume field. Keep current question prompt.
  // -------------------------------------------------------------
  if (primaryIntent === 'greeting') {
    let greetingResponse = responseRules.greetingOnlyResponse;
    if (analysis.greetingType === 'howAreYou') {
      greetingResponse = "I'm doing great, thank you for asking! I'm here to help you craft your professional resume. Let's start with your name. What should I call you?";
    } else if (updatedResume.personal?.fullName) {
      greetingResponse = `Hello ${updatedResume.personal.fullName}! Let's continue building your resume.`;
    }

    const botMsg: ChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: greetingResponse,
      questionId: currentQuestion.id,
      timestamp,
    };

    return {
      nextQuestionId: currentQuestion.id,
      updatedResume,
      updatedMessages: [...updatedMessages, botMsg],
      updatedCurrentRecord: updatedRecord,
      isCompleted: false,
    };
  }

  // -------------------------------------------------------------
  // TEST 8: Skip Question (e.g. "Skip this question", "skip")
  // -------------------------------------------------------------
  if (primaryIntent === 'skip_question' || extracted.isSkip) {
    if (currentQuestion.skipAllowed) {
      const nextQId = determineNextQuestionId(currentQuestion.id, 'skip', updatedResume, updatedRecord);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: responseRules.skipAllowedResponse,
        questionId: currentQuestion.id,
        timestamp,
      };

      return {
        nextQuestionId: nextQId,
        updatedResume,
        updatedMessages: [...updatedMessages, botMsg],
        updatedCurrentRecord: updatedRecord,
        isCompleted: nextQId === null,
      };
    } else {
      // Required question cannot be skipped
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: responseRules.skipNotAllowedResponse.replace('{fieldName}', currentQuestion.placeholder || 'this field'),
        questionId: currentQuestion.id,
        timestamp,
      };

      return {
        nextQuestionId: currentQuestion.id,
        updatedResume,
        updatedMessages: [...updatedMessages, botMsg],
        updatedCurrentRecord: updatedRecord,
        isCompleted: false,
      };
    }
  }

  // -------------------------------------------------------------
  // TEST 7: Summary Uncertainty / Request Help ("I don't know what to write in my summary")
  // Do NOT save the sentence as summary. Offer guidance with suggestions.
  // -------------------------------------------------------------
  if (primaryIntent === 'request_help' || extracted.isSummaryHelpRequest) {
    const role = updatedResume.personal?.professionalTitle || 'professional';
    const guidanceMsg = responseRules.summaryGuidanceResponse.replace('{professionalTitle}', role);

    const botMsg: ChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: guidanceMsg,
      questionId: currentQuestion.id,
      timestamp,
    };

    return {
      nextQuestionId: 'summary',
      updatedResume,
      updatedMessages: [...updatedMessages, botMsg],
      updatedCurrentRecord: updatedRecord,
      isCompleted: false,
    };
  }

  // -------------------------------------------------------------
  // TEST 12: Vague Employee Clarification ("I am just a normal employee")
  // Do not assign an invented title. Ask what work they perform day-to-day.
  // -------------------------------------------------------------
  if (primaryIntent === 'clarification_needed' || extracted.isVagueEmployee) {
    const botMsg: ChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: responseRules.normalEmployeeClarification,
      questionId: currentQuestion.id,
      timestamp,
    };

    return {
      nextQuestionId: 'professional_title',
      updatedResume,
      updatedMessages: [...updatedMessages, botMsg],
      updatedCurrentRecord: updatedRecord,
      isCompleted: false,
    };
  }

  // -------------------------------------------------------------
  // TEST 9: Corrections ("Actually, my name is Rahul, not Sahil")
  // -------------------------------------------------------------
  if (primaryIntent === 'edit_previous_answer' && extracted.correctionField) {
    const field = extracted.correctionField;
    const val = extracted.correctionValue || '';

    if (field === 'fullName') {
      updatedResume.personal.fullName = val;
    } else if (field === 'professionalTitle') {
      updatedResume.personal.professionalTitle = val;
    } else if (field === 'email') {
      updatedResume.personal.email = val;
    } else if (field === 'phone') {
      updatedResume.personal.phone = val;
    } else if (field === 'location') {
      updatedResume.personal.location = val;
    }

    const botMsg: ChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: responseRules.editAcknowledgedResponse
        .replace('{fieldName}', field)
        .replace('{newValue}', val),
      questionId: currentQuestion.id,
      timestamp,
    };

    return {
      nextQuestionId: currentQuestion.id,
      updatedResume,
      updatedMessages: [...updatedMessages, botMsg],
      updatedCurrentRecord: updatedRecord,
      isCompleted: false,
    };
  }

  // -------------------------------------------------------------
  // MULTI-ENTITY EXTRACTION APPLICATION (e.g. TEST 10: "Hi, I am Sahil and I work as an accountant")
  // Or "My name is Sahil, I live in Delhi and I work as an accountant"
  // -------------------------------------------------------------
  const capturedFields: string[] = [];

  // -------------------------------------------------------------
  // TEST 5: Fresher Status ("I am a fresher", "I don't have any experience")
  // Skip experience questions and initialize empty experience list
  // -------------------------------------------------------------
  if (extracted.isFresher) {
    updatedResume.career.experienceLevel = 'fresher';
    updatedResume.experience = [];
    capturedFields.push('Experience Level: Fresher');
    if (!updatedResume.personal.professionalTitle && currentQuestion.id === 'professional_title') {
      updatedResume.personal.professionalTitle = 'Fresher / Entry Level';
    }
  }

  if (extracted.fullName) {
    updatedResume.personal.fullName = extracted.fullName;
    capturedFields.push(`Name: ${extracted.fullName}`);
  }

  if (extracted.professionalTitle) {
    updatedResume.personal.professionalTitle = extracted.professionalTitle;
    if (extracted.industry) {
      updatedResume.personal.industry = extracted.industry;
    }
    if (extracted.occupationDescription) {
      updatedResume.personal.occupationDescription = extracted.occupationDescription;
    }
    capturedFields.push(`Title: ${extracted.professionalTitle}`);
  }

  if (extracted.email) {
    updatedResume.personal.email = extracted.email;
    capturedFields.push(`Email: ${extracted.email}`);
  }

  if (extracted.phone) {
    updatedResume.personal.phone = extracted.phone;
    capturedFields.push(`Phone: ${extracted.phone}`);
  }

  if (extracted.location) {
    updatedResume.personal.location = extracted.location;
    capturedFields.push(`Location: ${extracted.location}`);
  }

  // -------------------------------------------------------------
  // TEST 6: Education Record Extraction ("I completed BCA in 2025 from NIILM University")
  // -------------------------------------------------------------
  if (extracted.degree || (extracted.institution && extracted.endYear)) {
    const eduRecord = {
      id: `edu-${Date.now()}`,
      degree: extracted.degree || 'Degree / Diploma',
      institution: extracted.institution || 'University / Institution',
      university: extracted.institution,
      startYear: extracted.startYear || String(Number(extracted.endYear || 2024) - 3),
      endYear: extracted.endYear || '2024',
      currentlyStudying: extracted.eduStatus === 'current',
      grade: extracted.grade || '',
    };

    updatedResume.education = [...(updatedResume.education || []), eduRecord];
    capturedFields.push(`Education: ${eduRecord.degree} at ${eduRecord.institution}`);

    const botAck: ChatMessage = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: responseRules.educationAddedResponse
        .replace('{degree}', eduRecord.degree)
        .replace('{institution}', eduRecord.institution)
        .replace('{statusText}', eduRecord.currentlyStudying ? 'currently studying' : `graduated ${eduRecord.endYear}`),
      questionId: currentQuestion.id,
      timestamp,
    };

    // If answering edu questions, move directly to repeat ask or next section
    const nextQId = determineNextQuestionId('edu_grade', 'done', updatedResume, updatedRecord);

    return {
      nextQuestionId: nextQId,
      updatedResume,
      updatedMessages: [...updatedMessages, botAck],
      updatedCurrentRecord: {},
      isCompleted: nextQId === null,
    };
  }

  // -------------------------------------------------------------
  // TEST 11: Skills & Responsibilities Extraction
  // -------------------------------------------------------------
  if (extracted.skillsList && extracted.skillsList.length > 0) {
    if (currentQuestion.id === 'exp_responsibilities') {
      updatedRecord.responsibilities = extracted.responsibilities || extracted.skillsList.join('. ');
    } else {
      const existingOther = updatedResume.skills.other || [];
      updatedResume.skills.other = Array.from(new Set([...existingOther, ...extracted.skillsList]));
      capturedFields.push(`Skills: ${extracted.skillsList.join(', ')}`);
    }
  }

  // -------------------------------------------------------------
  // Direct field updates when no entity matched and question expects a direct field
  // -------------------------------------------------------------
  if (capturedFields.length === 0) {
    if (currentQuestion.recordSection && currentQuestion.recordField) {
      const section = currentQuestion.recordSection as keyof ResumeData;
      const field = currentQuestion.recordField;

      if (field === 'status') {
        updatedRecord.currentlyStudying = userAnswer === 'current';
      } else if (field === 'currentlyWorking') {
        updatedRecord.currentlyWorking = userAnswer === 'yes' || userAnswer === true;
      } else {
        updatedRecord[field] = userAnswer;
      }

      if (
        currentQuestion.id === 'edu_grade' ||
        currentQuestion.id === 'exp_responsibilities' ||
        currentQuestion.id === 'proj_contributions' ||
        currentQuestion.id === 'cert_url' ||
        currentQuestion.id === 'achieve_year'
      ) {
        const recordWithId = {
          id: updatedRecord.id || `${section}-${Date.now()}`,
          ...updatedRecord,
        };

        const existingArray = (updatedResume[section] as any[]) || [];
        const index = existingArray.findIndex((item) => item.id === recordWithId.id);

        if (index >= 0) {
          const copy = [...existingArray];
          copy[index] = recordWithId;
          updatedResume = { ...updatedResume, [section]: copy };
        } else {
          updatedResume = {
            ...updatedResume,
            [section]: [...existingArray, recordWithId],
          };
        }
        updatedRecord = {};
      }
    } else if (currentQuestion.field) {
      if (currentQuestion.field === 'skills') {
        updatedResume = {
          ...updatedResume,
          skills: { ...updatedResume.skills, ...(userAnswer || {}) },
        };
      } else if (currentQuestion.field === 'template') {
        updatedResume = {
          ...updatedResume,
          template: userAnswer || 'modern',
        };
      } else {
        updatedResume = setNestedValue(updatedResume, currentQuestion.field, userAnswer);
      }
    }
  }

  // Determine next question ID
  const nextQuestionId = determineNextQuestionId(
    currentQuestion.id,
    userAnswer,
    updatedResume,
    updatedRecord
  );

  // Formulate natural bot reply
  let botReplyText = getRandomEncouragement();

  if (hasGreeting && extracted.fullName && extracted.professionalTitle) {
    botReplyText = responseRules.greetingWithNameAndOccupationResponse
      .replace('{fullName}', extracted.fullName)
      .replace('{professionalTitle}', extracted.professionalTitle);
  } else if (hasGreeting && extracted.fullName) {
    botReplyText = responseRules.greetingWithNameResponse.replace('{fullName}', extracted.fullName);
  } else if (currentQuestion.id === 'professional_title' && updatedResume.personal?.professionalTitle) {
    botReplyText = `Understood! I'll use ${updatedResume.personal.professionalTitle} as your professional title.`;
  } else if (extracted.isFresher) {
    botReplyText = responseRules.fresherResponse;
  } else if (capturedFields.length > 1) {
    botReplyText = responseRules.compoundAcknowledgedResponse.replace(
      '{fieldsList}',
      capturedFields.join(', ')
    );
  }

  const botMsg: ChatMessage = {
    id: `msg-bot-${Date.now()}`,
    sender: 'bot',
    text: botReplyText,
    questionId: currentQuestion.id,
    timestamp,
  };

  return {
    nextQuestionId,
    updatedResume,
    updatedMessages: [...updatedMessages, botMsg],
    updatedCurrentRecord: updatedRecord,
    isCompleted: nextQuestionId === null,
  };
}

export function getSectionForQuestion(questionId: string): string {
  const q = getQuestionById(questionId);
  return q ? q.section : 'personal';
}
