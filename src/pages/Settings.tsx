import React, { useState } from 'react';
import { useModels } from '../context/ModelContext';

type Props = {
  language: 'de' | 'en';
  setLanguage: React.Dispatch<React.SetStateAction<'de' | 'en'>>;
};

function Settings({ language, setLanguage }: Props) {
  const t = (de: string, en: string) => (language === 'de' ? de : en);

  const { models, setModels } = useModels();
  const [newModel, setNewModel] = useState({
    label_de: '',
    label_en: '',
    value: '',
    path: ''
  });

  const addModel = () => {
    if (newModel.label_de && newModel.label_en && newModel.value) {
      setModels([...models, newModel]);
      setNewModel({ label_de: '', label_en: '', value: '', path: '' });
    }
  };

  // 👇 Electron Dialog für Weights auswählen
  const selectFile = async () => {
    const path = await (window as any).electronAPI?.selectWeights();
    if (path) {
      setNewModel({ ...newModel, path });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{t('Modelle verwalten', 'Manage models')}</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{t('Aktuelle Modelle', 'Current models')}</h3>
        <ul className="space-y-2">
          {models.map((m) => (
            <li key={m.value} className="border rounded p-2 shadow-sm bg-gray-50">
              <strong>{language === 'de' ? m.label_de : m.label_en}</strong> ({m.value})
              {m.path && (
                <div className="text-sm text-gray-600">
                  {t('Pfad', 'Path')}: {m.path}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">{t('Neues Modell hinzufügen', 'Add new model')}</h3>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            placeholder={t('Name (Deutsch)', 'Name (German)')}
            value={newModel.label_de}
            onChange={(e) => setNewModel({ ...newModel, label_de: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder={t('Name (Englisch)', 'Name (English)')}
            value={newModel.label_en}
            onChange={(e) => setNewModel({ ...newModel, label_en: e.target.value })}
            className="border px-2 py-1 rounded"
          />
          <input
            type="text"
            placeholder={t('Modell-Schlüssel (value)', 'Model key (value)')}
            value={newModel.value}
            onChange={(e) => setNewModel({ ...newModel, value: e.target.value })}
            className="border px-2 py-1 rounded"
          />

          {/* Pfad-Auswahl */}
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
              className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700"
            >
              {t('Wählen', 'Choose')}
            </button>
          </div>
        </div>
        <button
          onClick={addModel}
          className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition disabled:opacity-50"
          disabled={!newModel.label_de || !newModel.label_en || !newModel.value}
        >
          {t('Hinzufügen', 'Add')}
        </button>
      </div>

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
