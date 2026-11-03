import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Edit3,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  CheckCircle2,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, calculateProgressPercentage } from '../engine/resumeEngine';
import { getTemplateById, formatDateString } from '../engine/templateEngine';
import templatesData from '../data/templates.json';

interface ResumePreviewProps {
  resume: ResumeData;
  onSelectTemplate?: (templateId: string) => void;
  onOpenEditor?: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  onSelectTemplate,
  onOpenEditor,
}) => {
  // Auto-calculate appropriate initial zoom based on screen width
  const [zoom, setZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return 0.42;
      if (window.innerWidth < 768) return 0.55;
      if (window.innerWidth < 1024) return 0.75;
    }
    return 0.95;
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const activeTemplate = getTemplateById(resume.template);

  // Client-side PDF export handler using html2canvas and jsPDF
  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);

    try {
      const element = resumeRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const cleanName = (resume.personal.fullName || 'Resume').replace(/\s+/g, '_');
      pdf.save(`${cleanName}_Resume.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const skillCategories = Object.entries(resume.skills || {}).filter(
    ([_, skills]) => Array.isArray(skills) && skills.length > 0
  );

  return (
    <div className="flex flex-col h-full bg-[var(--theme-bg-main,#FAFAF8)] overflow-hidden select-none w-full min-w-0 transition-colors duration-200">
      {/* Top Toolbar */}
      <div className="bg-[var(--theme-bg-header,#FFFFFF)] dark:bg-[var(--theme-bg-header,#18201B)] border-b border-[var(--theme-border,#E9EDE9)] dark:border-[var(--theme-border,#232E27)] px-3 sm:px-5 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10 transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-xs font-semibold text-[#7E8494] dark:text-[#718278]">Template:</span>
          <select
            value={resume.template}
            onChange={(e) => onSelectTemplate && onSelectTemplate(e.target.value)}
            className="text-xs font-bold text-[#202923] dark:text-[#EEF4F0] px-3 py-1.5 rounded-xl neu-button-secondary cursor-pointer focus:outline-none min-h-[36px]"
          >
            {templatesData.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls & Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Compact Zoom Selector */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-xl neu-inset">
            <button
              onClick={() => setZoom((z) => Math.max(0.35, z - 0.1))}
              title="Zoom out"
              className="p-1 text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center font-bold text-xs"
            >
              -
            </button>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#202923] dark:text-[#EEF4F0] w-8 sm:w-9 text-center tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
              title="Zoom in"
              className="p-1 text-[#7E8494] hover:text-[#202923] dark:text-[#A0B2A7] dark:hover:text-[#EEF4F0] cursor-pointer min-h-[28px] min-w-[28px] flex items-center justify-center font-bold text-xs"
            >
              +
            </button>
          </div>

          <button
            onClick={handlePrint}
            title="Print resume"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl neu-button-secondary text-[#4B5750] dark:text-[#A0B2A7] hover:text-[var(--theme-primary)] dark:hover:text-[var(--theme-accent)] cursor-pointer min-h-[36px] transition"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--theme-primary)] dark:text-[var(--theme-accent)]" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-xl neu-button-deep text-white disabled:opacity-50 cursor-pointer min-h-[36px] transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Scroll Area - allows horizontal & vertical pan */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-8 flex justify-center items-start">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200 shrink-0"
        >
          {/* A4 Paper Document with #FFFFFF background */}
          <div
            ref={resumeRef}
            id="resume-a4-document"
            className={`w-[210mm] min-h-[297mm] bg-[#FFFFFF] text-[#34364A] shadow-2xl p-[18mm] relative box-border print:shadow-none print:m-0 print:p-[15mm] ${
              resume.template === 'professional' || resume.template === 'classic'
                ? 'font-serif'
                : resume.template === 'developer'
                ? 'font-mono'
                : 'font-sans'
            }`}
          >
            {renderSelectedTemplate(resume, activeTemplate, skillCategories)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Layout dispatcher for the 6 distinct templates
function renderSelectedTemplate(
  resume: ResumeData,
  template: any,
  skillCategories: [string, string[]][]
) {
  switch (resume.template) {
    case 'minimal':
      return renderMinimalTemplate(resume);
    case 'professional':
      return renderProfessionalTemplate(resume);
    case 'classic':
      return renderClassicTemplate(resume);
    case 'developer':
      return renderDeveloperTemplate(resume, skillCategories);
    case 'fresher':
      return renderFresherTemplate(resume, skillCategories);
    case 'modern':
    default:
      return renderModernTemplate(resume, skillCategories);
  }
}

// 1. MODERN TEMPLATE (Clean contemporary, lavender/blue accent header, categorized skills, subtle dividers)
function renderModernTemplate(resume: ResumeData, skillCategories: [string, string[]][]) {
  const p = resume.personal;
  return (
    <div className="space-y-5 text-[13px] leading-relaxed select-text">
      <header className="border-b-2 border-[#7776B8] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#34364A]">
              {p.fullName || 'Your Full Name'}
            </h1>
            {p.professionalTitle && (
              <p className="text-sm font-bold text-[#7776B8] mt-0.5">
                {p.professionalTitle}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-[#7E8494] space-y-0.5">
            {p.email && <div>{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
          </div>
        </div>

        {/* Links Row */}
        {(p.linkedin || p.github || p.portfolio) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#7E8494] mt-2.5 pt-2 border-t border-[#E9EAF2]">
            {p.linkedin && <span>in: {p.linkedin.replace(/^https?:\/\//, '')}</span>}
            {p.github && <span>git: {p.github.replace(/^https?:\/\//, '')}</span>}
            {p.portfolio && <span>web: {p.portfolio.replace(/^https?:\/\//, '')}</span>}
          </div>
        )}
      </header>

      {/* Summary */}
      {resume.career.summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-1 mb-1.5">
            Professional Summary
          </h2>
          <p className="text-[#34364A] text-justify leading-relaxed">{resume.career.summary}</p>
        </section>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-1 mb-2">
            Work Experience
          </h2>
          <div className="space-y-3.5">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <strong className="text-[#34364A] text-sm font-bold">{exp.jobTitle}</strong>
                    <span className="text-[#7E8494] font-medium"> • {exp.company}</span>
                    {exp.employmentType && (
                      <span className="text-[11px] text-[#7E8494] ml-1">({exp.employmentType})</span>
                    )}
                  </div>
                  <div className="text-[#7E8494] text-[11px] font-medium">
                    {formatDateString(exp.startDate)} –{' '}
                    {exp.currentlyWorking ? 'Present' : formatDateString(exp.endDate)}
                    {exp.location ? ` | ${exp.location}` : ''}
                  </div>
                </div>
                {exp.responsibilities && (
                  <div className="text-[#34364A] text-xs pl-2.5 mt-1 space-y-0.5">
                    {exp.responsibilities.split('\n').filter(Boolean).map((bullet, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[#7776B8] mt-1 text-[8px]">▪</span>
                        <span>{bullet.replace(/^[•\s*-]+/, '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-1 mb-2">
            Education
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex items-baseline justify-between">
                  <div>
                    <strong className="text-[#34364A] font-bold">{edu.degree}</strong>
                    <span className="text-[#7E8494]"> • {edu.institution}</span>
                  </div>
                  <div className="text-[#7E8494] text-[11px]">
                    {edu.startYear} – {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </div>
                </div>
                {edu.grade && (
                  <div className="text-[#7E8494] text-[11px] mt-0.5">
                    Score / GPA: <strong className="text-[#34364A]">{edu.grade}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skillCategories.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-1 mb-2">
            Technical & Professional Skills
          </h2>
          <div className="space-y-1.5 text-xs">
            {skillCategories.map(([cat, skills]) => (
              <div key={cat} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <span className="font-bold text-[#34364A] capitalize min-w-[120px] shrink-0">
                  {formatCatName(cat)}:
                </span>
                <span className="text-[#34364A]">{skills.join(' • ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-1 mb-2">
            Key Projects
          </h2>
          <div className="space-y-2.5">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="text-xs space-y-0.5">
                <div className="flex items-baseline justify-between">
                  <strong className="text-[#34364A] font-bold">{proj.name}</strong>
                  {proj.technologies && (
                    <span className="text-[11px] text-[#7E8494] italic">{proj.technologies}</span>
                  )}
                </div>
                {proj.description && <p className="text-[#34364A]">{proj.description}</p>}
                {proj.contributions && (
                  <p className="text-[#7E8494] text-[11px] pl-2">
                    Highlight: {proj.contributions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Additional */}
      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// 2. MINIMAL TEMPLATE (Swiss aesthetic, high contrast, clean typography, whitespace)
function renderMinimalTemplate(resume: ResumeData) {
  const p = resume.personal;
  return (
    <div className="space-y-6 text-[13px] text-[#34364A] font-sans">
      <header className="border-b border-[#34364A]/20 pb-4">
        <h1 className="text-3xl font-black text-[#34364A] tracking-tight uppercase">
          {p.fullName || 'Your Name'}
        </h1>
        {p.professionalTitle && (
          <p className="text-sm font-semibold text-[#7E8494] uppercase tracking-wider mt-1">
            {p.professionalTitle}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7E8494] mt-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github && <span>{p.github}</span>}
        </div>
      </header>

      {resume.career.summary && (
        <section>
          <div className="text-xs font-black uppercase tracking-widest text-[#34364A] mb-1.5">
            About
          </div>
          <p className="text-[#34364A] leading-relaxed">{resume.career.summary}</p>
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section>
          <div className="text-xs font-black uppercase tracking-widest text-[#34364A] mb-2 border-b border-[#34364A]/10 pb-1">
            Experience
          </div>
          <div className="space-y-4">
            {resume.experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold text-[#34364A]">
                  <span>{exp.jobTitle} — {exp.company}</span>
                  <span className="text-[#7E8494] font-normal">
                    {formatDateString(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDateString(exp.endDate)}
                  </span>
                </div>
                {exp.responsibilities && (
                  <p className="text-[#34364A] mt-1 whitespace-pre-line leading-relaxed">
                    {exp.responsibilities}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education && resume.education.length > 0 && (
        <section>
          <div className="text-xs font-black uppercase tracking-widest text-[#34364A] mb-2 border-b border-[#34364A]/10 pb-1">
            Education
          </div>
          <div className="space-y-2 text-xs">
            {resume.education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <strong className="text-[#34364A]">{edu.degree}</strong>, {edu.institution}
                </div>
                <div className="text-[#7E8494]">
                  {edu.startYear} – {edu.currentlyStudying ? 'Present' : edu.endYear}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// 3. PROFESSIONAL TEMPLATE (Executive corporate, serif headers, authoritative)
function renderProfessionalTemplate(resume: ResumeData) {
  const p = resume.personal;
  return (
    <div className="space-y-5 text-[13px] leading-relaxed font-serif text-[#34364A]">
      <header className="border-b-2 border-[#34364A] pb-3 text-center">
        <h1 className="text-3xl font-bold tracking-normal text-[#34364A]">
          {p.fullName || 'Full Name'}
        </h1>
        {p.professionalTitle && (
          <p className="text-sm italic text-[#7E8494] mt-0.5">{p.professionalTitle}</p>
        )}
        <div className="flex justify-center flex-wrap gap-3 text-xs text-[#7E8494] mt-2">
          {p.location && <span>{p.location}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.email && <span>• {p.email}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </header>

      {resume.career.summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#34364A] border-b border-[#C8CAD4] pb-0.5 mb-1.5">
            Executive Summary
          </h2>
          <p className="text-justify leading-relaxed">{resume.career.summary}</p>
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#34364A] border-b border-[#C8CAD4] pb-0.5 mb-2">
            Professional Experience
          </h2>
          <div className="space-y-3.5">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between text-xs">
                  <div>
                    <strong className="text-sm font-bold text-[#34364A]">{exp.company}</strong>, {exp.location}
                    <div className="italic text-[#7E8494]">{exp.jobTitle}</div>
                  </div>
                  <div className="text-[#7E8494] text-xs">
                    {formatDateString(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDateString(exp.endDate)}
                  </div>
                </div>
                {exp.responsibilities && (
                  <p className="text-xs text-[#34364A] mt-1 whitespace-pre-line leading-relaxed">
                    {exp.responsibilities}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// 4. CLASSIC TEMPLATE (Harvard / Ivy single column standard)
function renderClassicTemplate(resume: ResumeData) {
  const p = resume.personal;
  return (
    <div className="space-y-4 text-[13px] font-serif leading-snug text-[#34364A]">
      <div className="text-center border-b border-[#34364A] pb-3">
        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#34364A]">
          {p.fullName || 'Candidate Name'}
        </h1>
        <div className="text-xs text-[#7E8494] mt-1 flex justify-center flex-wrap gap-2">
          {p.location && <span>{p.location}</span>}
          {p.phone && <span>| {p.phone}</span>}
          {p.email && <span>| {p.email}</span>}
          {p.linkedin && <span>| {p.linkedin}</span>}
        </div>
      </div>

      {resume.career.summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#34364A] border-b border-[#C8CAD4] pb-0.5 mb-1">
            Objective
          </h2>
          <p className="text-xs text-justify">{resume.career.summary}</p>
        </section>
      )}

      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#34364A] border-b border-[#C8CAD4] pb-0.5 mb-1.5">
            Education
          </h2>
          {resume.education.map((edu) => (
            <div key={edu.id} className="text-xs flex justify-between">
              <div>
                <strong>{edu.institution}</strong> — {edu.degree}
              </div>
              <div>{edu.startYear} – {edu.currentlyStudying ? 'Present' : edu.endYear}</div>
            </div>
          ))}
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#34364A] border-b border-[#C8CAD4] pb-0.5 mb-1.5">
            Experience
          </h2>
          <div className="space-y-2">
            {resume.experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{exp.company} — {exp.jobTitle}</span>
                  <span className="font-normal text-[#7E8494]">
                    {formatDateString(exp.startDate)} – {exp.currentlyWorking ? 'Present' : formatDateString(exp.endDate)}
                  </span>
                </div>
                {exp.responsibilities && (
                  <p className="whitespace-pre-line text-neutral-800 mt-0.5">{exp.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// 5. DEVELOPER TEMPLATE (Monospace accents, CLI headings, repository links, tech tags)
function renderDeveloperTemplate(resume: ResumeData, skillCategories: [string, string[]][]) {
  const p = resume.personal;
  return (
    <div className="space-y-4 text-xs font-mono text-[#34364A]">
      <header className="border-b-2 border-[#34364A] pb-3">
        <div className="text-2xl font-black text-[#34364A] tracking-tight">
          root@resume:~$ whoami &gt; {p.fullName || 'Developer'}
        </div>
        {p.professionalTitle && (
          <div className="text-[#7776B8] font-bold text-xs mt-0.5">
            role: {p.professionalTitle}
          </div>
        )}
        <div className="flex flex-wrap gap-3 text-[11px] text-[#7E8494] mt-2">
          {p.email && <span>email: {p.email}</span>}
          {p.github && <span>github: {p.github}</span>}
          {p.portfolio && <span>site: {p.portfolio}</span>}
          {p.location && <span>loc: {p.location}</span>}
        </div>
      </header>

      {/* Skills Matrix First for Developers */}
      {skillCategories.length > 0 && (
        <section>
          <div className="font-bold text-[#7776B8] border-b border-[#34364A]/20 pb-0.5 mb-1.5">
            $ cat /proc/skills
          </div>
          <div className="space-y-1">
            {skillCategories.map(([cat, skills]) => (
              <div key={cat} className="flex gap-2">
                <span className="font-bold text-[#34364A] min-w-[110px]">{formatCatName(cat)}:</span>
                <span className="text-[#7E8494]">{skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <div className="font-bold text-[#7776B8] border-b border-[#34364A]/20 pb-0.5 mb-1.5">
            $ git log --projects
          </div>
          <div className="space-y-2">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between font-bold text-[#34364A]">
                  <span>{proj.name}</span>
                  <span className="text-[#7E8494]">{proj.technologies}</span>
                </div>
                {proj.description && <p className="text-[#7E8494]">{proj.description}</p>}
                {proj.url && <div className="text-[#7776B8] text-[10px]">{proj.url}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && (
        <section>
          <div className="font-bold text-[#7776B8] border-b border-[#34364A]/20 pb-0.5 mb-1.5">
            $ systemctl status experience.service
          </div>
          <div className="space-y-2">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between font-bold text-[#34364A]">
                  <span>{exp.jobTitle} @ {exp.company}</span>
                  <span className="text-[#7E8494]">
                    {formatDateString(exp.startDate)} - {exp.currentlyWorking ? 'Present' : formatDateString(exp.endDate)}
                  </span>
                </div>
                {exp.responsibilities && (
                  <p className="whitespace-pre-line text-[#34364A] pl-2">{exp.responsibilities}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// 6. FRESHER TEMPLATE (Education & Projects prioritized first, coursework and achievements)
function renderFresherTemplate(resume: ResumeData, skillCategories: [string, string[]][]) {
  const p = resume.personal;
  return (
    <div className="space-y-5 text-[13px] font-sans text-[#34364A]">
      <header className="border-b-2 border-[#7776B8] pb-3 text-center">
        <h1 className="text-3xl font-extrabold text-[#34364A]">{p.fullName || 'Graduate Name'}</h1>
        {p.professionalTitle && (
          <p className="text-sm font-bold text-[#7776B8] mt-0.5">{p.professionalTitle}</p>
        )}
        <div className="flex justify-center flex-wrap gap-3 text-xs text-[#7E8494] mt-2">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.location && <span>• {p.location}</span>}
          {p.github && <span>• {p.github}</span>}
        </div>
      </header>

      {/* Summary / Objective */}
      {resume.career.summary && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1">
            Career Objective
          </h2>
          <p className="leading-relaxed">{resume.career.summary}</p>
        </section>
      )}

      {/* Education First */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1.5">
            Academic Background
          </h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{edu.degree} — {edu.institution}</span>
                  <span className="text-[#7E8494] font-normal">
                    {edu.startYear} – {edu.currentlyStudying ? 'Present' : edu.endYear}
                  </span>
                </div>
                {edu.grade && (
                  <div className="text-[#7E8494] text-[11px]">GPA / Score: {edu.grade}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skillCategories.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1.5">
            Technical Competencies
          </h2>
          <div className="space-y-1 text-xs">
            {skillCategories.map(([cat, skills]) => (
              <div key={cat} className="flex gap-2">
                <span className="font-bold text-[#34364A] min-w-[120px]">{formatCatName(cat)}:</span>
                <span className="text-[#7E8494]">{skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Academic Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1.5">
            Key Academic & Personal Projects
          </h2>
          <div className="space-y-2.5">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="text-xs">
                <div className="flex justify-between font-bold">
                  <span>{proj.name}</span>
                  <span className="text-[#7E8494] font-normal">{proj.technologies}</span>
                </div>
                {proj.description && <p className="text-[#34364A]">{proj.description}</p>}
                {proj.contributions && (
                  <p className="text-[#7E8494] text-[11px] pl-2">Impact: {proj.contributions}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {renderCertificationsAndAdditional(resume)}
    </div>
  );
}

// Shared Certifications, Achievements, Languages helper
function renderCertificationsAndAdditional(resume: ResumeData) {
  return (
    <>
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {resume.certifications.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span><strong>{c.name}</strong> — {c.organization}</span>
                <span className="text-[#7E8494]">{formatDateString(c.issueDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.achievements && resume.achievements.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#7776B8] border-b border-[#E9EAF2] pb-0.5 mb-1">
            Honors & Achievements
          </h2>
          <div className="space-y-1 text-xs">
            {resume.achievements.map((a) => (
              <div key={a.id} className="flex justify-between">
                <span><strong>{a.title}</strong>: {a.description}</span>
                {a.year && <span className="text-[#7E8494]">{a.year}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {((resume.languages && resume.languages.length > 0) ||
        (resume.interests && resume.interests.length > 0)) && (
        <section className="pt-1 text-xs text-[#7E8494]">
          {resume.languages && resume.languages.length > 0 && (
            <div>
              <strong className="text-[#34364A]">Languages: </strong>
              {resume.languages.join(', ')}
            </div>
          )}
          {resume.interests && resume.interests.length > 0 && (
            <div className="mt-0.5">
              <strong className="text-[#34364A]">Interests: </strong>
              {resume.interests.join(', ')}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function formatCatName(key: string): string {
  switch (key) {
    case 'programmingLanguages':
      return 'Languages';
    case 'frontend':
      return 'Frontend';
    case 'backend':
      return 'Backend';
    case 'databases':
      return 'Databases';
    case 'frameworks':
      return 'Frameworks';
    case 'tools':
      return 'Tools/DevOps';
    default:
      return key;
  }
}
