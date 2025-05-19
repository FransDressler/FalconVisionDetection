import React, { createContext, useContext, useState } from 'react';

type Model = {
  label_de: string;
  label_en: string;
  value: string;
  path?: string;  // Optionaler Pfad zu lokalen Weights
};

type ModelContextType = {
  models: Model[];
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
};

const defaultModels: Model[] = [
  { label_de: 'Allrounder Model', label_en: 'Allrounder Model', value: 'ensemble_yolov11l' },
  { label_de: 'Ab 50m', label_en: 'Above 50m', value: 'heridal_yolov11l' },
  { label_de: 'Unter 50m', label_en: 'Below 50m', value: 'human_yolov11l' },
];

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [models, setModels] = useState<Model[]>(defaultModels);

  return (
    <ModelContext.Provider value={{ models, setModels }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModels = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModels must be used within a ModelProvider');
  }
  return context;
};
