import React, { useState } from 'react';
import { useModels } from '../context/ModelContext';

type Model = {
  label_de: string;
  label_en: string;
  value: string;
  path?: string;
};

type Props = {
  language: 'de' | 'en';
  setLanguage: React.Dispatch<React.SetStateAction<'de' | 'en'>>;
};

// Keys of the default, non-removable models
const BUILTIN_KEYS = new Set(['ensemble_yolov11l', 'heridal_yolov11l', 'human_yolov11l']);

function Settings({ language, setLanguage }: Props) {
  const t = (de: string, en: string) => (language === 'de' ? de : en);
  const { models, setModels } = useModels();
  const [newModel, setNewModel] = useState<Model>({
    label_de: '',
    label_en: '',
    value: '',
    path: ''
  });

  // Add a new model
  const addModel = () => {
    if (!newModel.label_de || !newModel.label_en || !newModel.value) return;
    setModels([...models, newModel]);
    setNewModel({ label_de: '', label_en: '', value: '', path: '' });
  };

  // Remove a custom model
  const deleteModel = (value: string) => {
    setModels(models.filter(m => m.value !== value));
  };

  // Open native dialog & copy file via main process
  const selectFile = async () => {
    const filePath = await (window as any).electronAPI?.selectWeights();
    console.log('⚙️ selectWeights returned path:', filePath);
    if (filePath) {
      setNewModel({ ...newModel, path: filePath });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t('Modelle verwalten', 'Manage models')}</h2>

      {/* Existing models list */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{t('Aktuelle Modelle', 'Current models')}</h3>
        <ul className="space-y-2">
          {models.map(m => (
            <li
              key={m.value}
              className="flex justify-between items-center border rounded p-2 shadow-sm bg-gray-50"
            >
              <div>
                <strong>{language === 'de' ? m.label_de : m.label_en}</strong> ({m.value})
                {m.path && (
                  <div className="text-sm text-gray-600">
                    {t('Pfad', 'Path')}: {m.path}
                  </div>
                )}
              </div>
              {/* Show delete for custom models only */}
              {!BUILTIN_KEYS.has(m.value) && (
                <button
                  onClick={() => deleteModel(m.value)}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-800"
                >
                  {t('Löschen', 'Delete')}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Add new model */}
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">{t('Neues Modell hinzufügen', 'Add new model')}</h3>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder={t('Name (Deutsch)', 'Name (German)')}
            value={newModel.label_de}
            onChange={e => setNewModel({ ...newModel, label_de: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder={t('Name (Englisch)', 'Name (English)')}
            value={newModel.label_en}
            onChange={e => setNewModel({ ...newModel, label_en: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder={t('Modell-Schlüssel', 'Model key')}
            value={newModel.value}
            onChange={e => setNewModel({ ...newModel, value: e.target.value })}
            className="border px-2 py-1 rounded"
          />

          {/* Weights path selection */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newModel.path}
              placeholder={t('Gewichtspfad auswählen...', 'Select weights path...')}
              readOnly
              className="border px-2 py-1 rounded w-full"
            />
            <button
              onClick={selectFile}
              className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition"
            >
              {t('Wählen', 'Choose')}
            </button>
          </div>
        </div>
        <button
          onClick={addModel}
          disabled={!newModel.label_de || !newModel.label_en || !newModel.value}
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition disabled:opacity-50"
        >
          {t('Hinzufügen', 'Add')}
        </button>
      </div>

      {/* Language toggle */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">{t('Sprache', 'Language')}</h3>
        <button
          onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          {language === 'de' ? '🇩🇪 DE' : '🇬🇧 EN'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
