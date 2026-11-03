import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderGit2,
  Award,
  Trophy,
  Languages,
} from 'lucide-react';
import {
  ResumeData,
  EducationItem,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
} from '../engine/resumeEngine';
import skillsData from '../data/skills.json';

interface ResumeEditorProps {
  resume: ResumeData;
  onSave: (updated: ResumeData) => void;
  onClose: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({ resume, onSave, onClose }) => {
  const [data, setData] = useState<ResumeData>(JSON.parse(JSON.stringify(resume)));
  const [activeTab, setActiveTab] = useState<string>('personal');

  const handlePersonalChange = (field: keyof typeof data.personal, value: string) => {
    setData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  };

  // Education handlers
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      currentlyStudying: false,
      grade: '',
    };
    setData((prev) => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, value: any) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteEducation = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      jobTitle: '',
      company: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      responsibilities: '',
    };
    setData((prev) => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  // Project handlers
  const handleAddProject = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: '',
      url: '',
      contributions: '',
    };
    setData((prev) => ({ ...prev, projects: [...prev.projects, newItem] }));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, value: any) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteProject = (id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  // Certifications handlers
  const handleAddCert = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      organization: '',
      issueDate: '',
      url: '',
    };
    setData((prev) => ({ ...prev, certifications: [...prev.certifications, newItem] }));
  };

  const handleUpdateCert = (id: string, field: keyof CertificationItem, value: any) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteCert = (id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  };

  // Achievements handlers
  const handleAddAchievement = () => {
    const newItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      title: '',
      description: '',
      year: '',
    };
    setData((prev) => ({ ...prev, achievements: [...prev.achievements, newItem] }));
  };

  const handleUpdateAchievement = (id: string, field: keyof AchievementItem, value: any) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleDeleteAchievement = (id: string) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item.id !== id),
    }));
  };

  const handleSaveAndClose = () => {
    onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#202923]/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-2xl sm:rounded-3xl flex flex-col overflow-hidden border border-[#E9EDE9] shadow-2xl">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E9EDE9] flex items-center justify-between shrink-0 bg-white">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#202923]">Direct Resume Editor</h2>
            <p className="text-[11px] sm:text-xs text-[#78847D]">Edit, add, or remove records across any section</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 neu-button-deep text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 border border-[#E9EDE9] text-[#78847D] hover:text-[#202923] hover:bg-[#FAFAF8] rounded-xl cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body with Responsive Tabs */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0 bg-[#FAFAF8]">
          {/* Navigation Tabs */}
          <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-[#E9EDE9] bg-white p-2 sm:p-3 flex sm:flex-col gap-1.5 overflow-x-auto sm:overflow-y-auto shrink-0 select-none">
            {[
              { id: 'personal', label: 'Personal', icon: User },
              { id: 'career', label: 'Summary', icon: User },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'skills', label: 'Skills', icon: Wrench },
              { id: 'projects', label: 'Projects', icon: FolderGit2 },
              { id: 'certifications', label: 'Certifications', icon: Award },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'additional', label: 'Additional', icon: Languages },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition cursor-pointer whitespace-nowrap shrink-0 sm:shrink min-h-[36px] ${
                    activeTab === tab.id
                      ? 'bg-[var(--theme-primary-light)] text-[var(--theme-primary)] font-bold border border-[var(--theme-primary)]/20'
                      : 'text-[#4B5750] hover:bg-[#FAFAF8] hover:text-[#202923]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? 'text-[var(--theme-primary)]' : 'text-[#78847D]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto min-w-0">
            {/* PERSONAL INFO */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#202923]">Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-[#7E8494]">Full Name</label>
                    <input
                      type="text"
                      value={data.personal.fullName}
                      onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">Professional Title</label>
                    <input
                      type="text"
                      value={data.personal.professionalTitle}
                      onChange={(e) => handlePersonalChange('professionalTitle', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">Email Address</label>
                    <input
                      type="email"
                      value={data.personal.email}
                      onChange={(e) => handlePersonalChange('email', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">Phone Number</label>
                    <input
                      type="tel"
                      value={data.personal.phone}
                      onChange={(e) => handlePersonalChange('phone', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">Location</label>
                    <input
                      type="text"
                      value={data.personal.location}
                      onChange={(e) => handlePersonalChange('location', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">LinkedIn URL</label>
                    <input
                      type="text"
                      value={data.personal.linkedin}
                      onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">GitHub URL</label>
                    <input
                      type="text"
                      value={data.personal.github}
                      onChange={(e) => handlePersonalChange('github', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#7E8494]">Portfolio URL</label>
                    <input
                      type="text"
                      value={data.personal.portfolio}
                      onChange={(e) => handlePersonalChange('portfolio', e.target.value)}
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CAREER / SUMMARY */}
            {activeTab === 'career' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#202923]">Professional Summary</h3>
                <div className="text-xs space-y-2">
                  <label className="font-semibold text-[#7E8494]">Summary Text</label>
                  <textarea
                    rows={6}
                    value={data.career.summary}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        career: { ...prev.career, summary: e.target.value },
                      }))
                    }
                    className="w-full p-3.5 rounded-2xl neu-input text-[#202923] leading-relaxed resize-none"
                  />
                </div>
              </div>
            )}

            {/* EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202923]">Education Records</h3>
                  <button
                    onClick={handleAddEducation}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 neu-button-secondary text-[var(--theme-primary)] rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Degree</span>
                  </button>
                </div>

                {data.education.length === 0 ? (
                  <p className="text-xs text-[#7E8494] italic">No education records added yet.</p>
                ) : (
                  data.education.map((edu, idx) => (
                    <div
                      key={edu.id}
                      className="p-4 rounded-2xl neu-raised space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#202923]">Record #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="text-[#C77D86] hover:opacity-80 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Start Year</label>
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => handleUpdateEducation(edu.id, 'startYear', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">End Year</label>
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => handleUpdateEducation(edu.id, 'endYear', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-[#7E8494]">GPA / Percentage</label>
                          <input
                            type="text"
                            value={edu.grade || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'grade', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202923]">Work Experience</h3>
                  <button
                    onClick={handleAddExperience}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 neu-button-secondary text-[var(--theme-primary)] rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Position</span>
                  </button>
                </div>

                {data.experience.length === 0 ? (
                  <p className="text-xs text-[#7E8494] italic">No experience added yet.</p>
                ) : (
                  data.experience.map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl neu-raised space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#202923]">Role #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-[#C77D86] hover:opacity-80 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Job Title</label>
                          <input
                            type="text"
                            value={exp.jobTitle}
                            onChange={(e) => handleUpdateExperience(exp.id, 'jobTitle', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">End Date</label>
                          <input
                            type="text"
                            value={exp.endDate || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-[#7E8494]">
                            Responsibilities & Highlights
                          </label>
                          <textarea
                            rows={3}
                            value={exp.responsibilities}
                            onChange={(e) =>
                              handleUpdateExperience(exp.id, 'responsibilities', e.target.value)
                            }
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SKILLS */}
            {activeTab === 'skills' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#202923]">Categorized Skills</h3>
                <div className="space-y-3 text-xs">
                  {skillsData.categories.map((cat) => {
                    const currentSkills = data.skills[cat.id] || [];
                    return (
                      <div key={cat.id} className="p-3.5 rounded-2xl neu-subtle">
                        <span className="font-bold text-[#202923]">{cat.name}</span>
                        <input
                          type="text"
                          value={currentSkills.join(', ')}
                          onChange={(e) => {
                            const parsed = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            setData((prev) => ({
                              ...prev,
                              skills: { ...prev.skills, [cat.id]: parsed },
                            }));
                          }}
                          placeholder="Comma-separated items (e.g. React, TypeScript, Vue)"
                          className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202923]">Projects</h3>
                  <button
                    onClick={handleAddProject}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 neu-button-secondary text-[var(--theme-primary)] rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>

                {data.projects.length === 0 ? (
                  <p className="text-xs text-[#7E8494] italic">No projects added yet.</p>
                ) : (
                  data.projects.map((proj, idx) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl neu-raised space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#202923]">Project #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="text-[#C77D86] hover:opacity-80 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Project Name</label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) => handleUpdateProject(proj.id, 'name', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#7E8494]">Technologies</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => handleUpdateProject(proj.id, 'technologies', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-[#7E8494]">Description</label>
                          <textarea
                            rows={2}
                            value={proj.description}
                            onChange={(e) => handleUpdateProject(proj.id, 'description', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-[#7E8494]">Project URL</label>
                          <input
                            type="text"
                            value={proj.url || ''}
                            onChange={(e) => handleUpdateProject(proj.id, 'url', e.target.value)}
                            className="w-full mt-1 px-3 py-2 rounded-xl neu-input text-[#202923]"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CERTIFICATIONS */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202923]">Certifications</h3>
                  <button
                    onClick={handleAddCert}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 neu-button-secondary text-[var(--theme-primary)] rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Certificate</span>
                  </button>
                </div>

                {data.certifications.length === 0 ? (
                  <p className="text-xs text-[#7E8494] italic">No certifications added yet.</p>
                ) : (
                  data.certifications.map((c, idx) => (
                    <div key={c.id} className="p-3.5 rounded-2xl neu-raised space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#202923]">Certificate #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteCert(c.id)}
                          className="text-[#C77D86] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Name"
                          value={c.name}
                          onChange={(e) => handleUpdateCert(c.id, 'name', e.target.value)}
                          className="px-3 py-2 rounded-xl neu-input text-[#202923]"
                        />
                        <input
                          type="text"
                          placeholder="Organization"
                          value={c.organization}
                          onChange={(e) => handleUpdateCert(c.id, 'organization', e.target.value)}
                          className="px-3 py-2 rounded-xl neu-input text-[#202923]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#202923]">Achievements</h3>
                  <button
                    onClick={handleAddAchievement}
                    className="flex items-center gap-1.5 text-xs px-3.5 py-2 neu-button-secondary text-[var(--theme-primary)] rounded-xl font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Achievement</span>
                  </button>
                </div>

                {data.achievements.length === 0 ? (
                  <p className="text-xs text-[#7E8494] italic">No achievements added yet.</p>
                ) : (
                  data.achievements.map((ach, idx) => (
                    <div key={ach.id} className="p-3.5 rounded-2xl neu-raised space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#202923]">Achievement #{idx + 1}</span>
                        <button
                          onClick={() => handleDeleteAchievement(ach.id)}
                          className="text-[#C77D86] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <input
                          type="text"
                          placeholder="Title"
                          value={ach.title}
                          onChange={(e) => handleUpdateAchievement(ach.id, 'title', e.target.value)}
                          className="px-3 py-2 rounded-xl neu-input text-[#202923]"
                        />
                        <input
                          type="text"
                          placeholder="Year"
                          value={ach.year || ''}
                          onChange={(e) => handleUpdateAchievement(ach.id, 'year', e.target.value)}
                          className="px-3 py-2 rounded-xl neu-input text-[#202923]"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ADDITIONAL */}
            {activeTab === 'additional' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#7E8494]">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={data.languages.join(', ')}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        languages: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#7E8494]">Interests & Hobbies (comma-separated)</label>
                  <input
                    type="text"
                    value={data.interests.join(', ')}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        interests: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl neu-input text-[#202923]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
