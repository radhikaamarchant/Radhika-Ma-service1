import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAppContext } from '../utils/AppContext';
import { GlobalSettings, CommissionSetting } from '../types';
import { sanitizeDatabase } from '../utils/dataSanitizer';

interface SettingsModalProps {
  onClose: () => void;
}

const defaultSettings: GlobalSettings = {
  newBusinessRegistration: { type: 'amount', value: 0 },
  newInvestorRegistration: { type: 'amount', value: 0 },
  investmentCommission: { type: 'percentage', value: 0 },
  profitCommission: { type: 'percentage', value: 0 },
  tax: { type: 'percentage', value: 0 }
};

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { state, dispatch } = useAppContext();
  const [settings, setSettings] = useState<GlobalSettings>(state.settings || defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isSanitizing, setIsSanitizing] = useState(false);

  useEffect(() => {
    if (state.settings) {
      setSettings(state.settings);
    }
  }, [state.settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSanitize = async () => {
    if (!window.confirm("Are you sure you want to sanitize the database? This will cap huge numbers to standard sane limits.")) return;
    setIsSanitizing(true);
    try {
      const res = await sanitizeDatabase();
      alert(res.message);
    } catch (e) {
      alert("Failed to sanitize database.");
    } finally {
      setIsSanitizing(false);
    }
  };

  const updateSetting = (key: keyof GlobalSettings, field: keyof CommissionSetting, value: string | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: field === 'value' ? Number(value) : value
      }
    }));
  };

  const renderField = (label: string, key: keyof GlobalSettings) => {
    const setting = settings[key];
    return (
      <div className="flex flex-col mb-4 bg-gray-50/50 p-4 rounded-md border border-gray-100">
        <label className="text-sm font-medium text-kite-text mb-2">{label}</label>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="text-xs text-kite-text-light mb-1 block">Value</label>
            <input
              type="number"
              className="w-full p-2 border border-kite-border rounded text-sm focus:outline-none focus:border-kite-primary"
              value={setting.value}
              onChange={(e) => updateSetting(key, 'value', e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-kite-text-light mb-1 block">Type</label>
            <div className="flex bg-gray-100 p-1 rounded">
              <button
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${setting.type === 'percentage' ? 'bg-white shadow-sm text-kite-primary' : 'text-kite-text-light hover:text-kite-text'}`}
                onClick={() => updateSetting(key, 'type', 'percentage')}
              >
                % Percentage
              </button>
              <button
                className={`flex-1 text-xs py-1.5 rounded font-medium transition-colors ${setting.type === 'amount' ? 'bg-white shadow-sm text-kite-primary' : 'text-kite-text-light hover:text-kite-text'}`}
                onClick={() => updateSetting(key, 'type', 'amount')}
              >
                ₹ Amount
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 md:p-6 border-b border-kite-border flex justify-between items-center bg-gray-50/50 rounded-t-lg">
          <h2 className="text-xl font-medium text-kite-text">Set Commission and Tax</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-kite-text-light" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto">
          {renderField('New Business Registration', 'newBusinessRegistration')}
          {renderField('New Investor Registration', 'newInvestorRegistration')}
          {renderField('Investment Commission (Admin)', 'investmentCommission')}
          {renderField('Profit Commission (Admin)', 'profitCommission')}
          {renderField('Tax (Happy Income Tax)', 'tax')}

          <div className="mt-8 border-t border-kite-border pt-6">
            <h3 className="text-sm font-semibold text-kite-text mb-4">Danger Zone</h3>
            <div className="bg-red-50/50 border border-red-100 rounded-md p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-red-800">Sanitize Database</p>
                <p className="text-xs text-red-600 mt-1">Cap artificially large numbers to sane limits. Cannot be undone.</p>
              </div>
              <button
                onClick={handleSanitize}
                disabled={isSanitizing}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-sm text-sm font-medium hover:bg-red-200 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSanitizing ? 'Sanitizing...' : 'Sanitize DB'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t border-kite-border flex justify-end space-x-3 bg-gray-50/50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-6 py-2 text-kite-text hover:bg-gray-200 rounded transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-kite-primary text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
