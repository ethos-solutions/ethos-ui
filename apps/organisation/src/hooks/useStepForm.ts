import { useState } from 'react';

export const useStepForm = (initialStep = '1') => {
  const [step, setStep] = useState(initialStep);

  const goToStep = (newStep: string) => setStep(newStep);
  const nextStep = () => setStep((prev) => (parseInt(prev, 10) + 1).toString());

  return { step, setStep, goToStep, nextStep };
};
