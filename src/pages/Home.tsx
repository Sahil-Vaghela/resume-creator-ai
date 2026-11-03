import React, { useState } from 'react';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { TemplateSelector } from '../components/TemplateSelector';
import { hasSavedProgress, getSampleResume } from '../engine/storageEngine';
import { ResumeData } from '../engine/resumeEngine';

interface HomeProps {
  onStartBuilder: (sampleData?: ResumeData) => void;
}

export const Home: React.FC<HomeProps> = ({ onStartBuilder }) => {
  const [showTemplatesModal, setShowTemplatesModal] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  const hasDraft = hasSavedProgress();

  const handleLoadSample = () => {
    const sample = getSampleResume();
    onStartBuilder(sample);
  };

  return (
    <>
      <WelcomeScreen
        onStart={() => onStartBuilder()}
        onOpenTemplates={() => setShowTemplatesModal(true)}
        onLoadSample={handleLoadSample}
        hasSavedProgress={hasDraft}
        onResumeDraft={() => onStartBuilder()}
      />

      {showTemplatesModal && (
        <TemplateSelector
          currentTemplateId={selectedTemplate}
          onSelect={(id) => {
            setSelectedTemplate(id);
            onStartBuilder();
          }}
          onClose={() => setShowTemplatesModal(false)}
        />
      )}
    </>
  );
};
