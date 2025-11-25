import React, { useState, useEffect } from 'react';
import { AIService } from './services/ai';
import { DS160FormData } from './types/ds160';
import { Settings, MessageSquare, ClipboardCheck, Play, AlertCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'form' | 'settings'>('chat');
  const [apiKey, setApiKey] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DS160FormData>({ personal_info_1: {}, passport: {}, travel_info: {} });
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    chrome.storage.sync.get(['openai_key'], (result) => {
      if (result.openai_key) setApiKey(result.openai_key);
    });
  }, []);

  const handleSaveKey = () => {
    chrome.storage.sync.set({ openai_key: apiKey }, () => {
      setLogs(prev => [...prev, "API Key saved locally."]);
    });
  };

  const handleAISubmit = async () => {
    if (!apiKey) {
      setActiveTab('settings');
      return;
    }
    setIsLoading(true);
    try {
      const ai = new AIService(apiKey);
      const { data, diagnosis } = await ai.parseAndDiagnose(input, formData);
      
      // Merge data deep
      setFormData(prev => ({
        ...prev,
        ...data,
        personal_info_1: { ...prev.personal_info_1, ...data.personal_info_1 },
        passport: { ...prev.passport, ...data.passport }
      }));

      setLogs(prev => [...prev, `AI: ${diagnosis.summary}`]);
      setActiveTab('form');
    } catch (e: any) {
      setLogs(prev => [...prev, `Error: ${e.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    setLogs(prev => [...prev, "Sending fill command to page..."]);
    
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "FILL_FORM",
        data: formData
      });
      setLogs(prev => [...prev, "Fill command sent!"]);
    } catch (e) {
      setLogs(prev => [...prev, "Failed to send command. Are you on ceac.state.gov?"]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 shadow-md">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Auto DS-160 Filler
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <MessageSquare className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setActiveTab('form')} className={`flex-1 p-3 ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <ClipboardCheck className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 p-3 ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <Settings className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800">
              <p>Describe your information naturally. Example:</p>
              <p className="italic mt-1">"My name is Zhang San, born in Beijing on 1990-01-01. My passport number is E12345678..."</p>
            </div>
            <textarea 
              className="w-full h-40 p-3 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Type here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button 
              onClick={handleAISubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? "Processing..." : "Analyze & Parse"}
            </button>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-2 rounded border overflow-auto max-h-80 text-xs font-mono">
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </div>
            <button 
              onClick={handleAutoFill}
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 flex justify-center items-center gap-2 font-bold"
            >
              <Play className="w-5 h-5" />
              Auto-Fill on Page
            </button>
            <p className="text-xs text-gray-500 text-center">Make sure you are on the correct DS-160 page.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium">OpenAI API Key</label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="sk-..."
            />
            <button onClick={handleSaveKey} className="px-4 py-2 bg-gray-800 text-white rounded text-sm">
              Save Key Locally
            </button>
            <div className="text-xs text-gray-400 mt-4">
              Your API key is stored locally in your browser and communicated directly to OpenAI. No intermediate server.
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-gray-900 text-green-400 p-2 text-xs font-mono h-24 overflow-auto">
        {logs.map((log, i) => <div key={i}>{`> ${log}`}</div>)}
      </div>
    </div>
  );
}

export default App;

