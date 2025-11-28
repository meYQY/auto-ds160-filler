import React, { useState, useEffect, useRef } from 'react';
import { AIService } from './services/ai';
import { DS160FormData } from './types/ds160';
import { Settings, MessageSquare, ClipboardCheck, Play, Trash2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'form' | 'settings'>('chat');
  const [apiKey, setApiKey] = useState('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<DS160FormData>({});
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.sync.get(['openai_key'], (result) => {
      if (result.openai_key) setApiKey(result.openai_key);
    });
    
    // Check for saved form data (optional persistence)
    chrome.storage.local.get(['ds160_data'], (result) => {
        if (result.ds160_data) {
            setFormData(result.ds160_data);
            setLogs(prev => [...prev, "Loaded saved session data."]);
        }
    });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Auto-save form data
  useEffect(() => {
      if (Object.keys(formData).length > 0) {
        chrome.storage.local.set({ ds160_data: formData });
      }
  }, [formData]);

  const handleSaveKey = () => {
    chrome.storage.sync.set({ openai_key: apiKey }, () => {
      setLogs(prev => [...prev, "API Key saved locally."]);
    });
  };

  const handleClearData = () => {
      if (confirm("Are you sure you want to clear all form data?")) {
          setFormData({});
          chrome.storage.local.remove(['ds160_data']);
          setLogs(prev => [...prev, "Form data cleared."]);
      }
  };

  const handleAISubmit = async () => {
    if (!apiKey) {
      setActiveTab('settings');
      setLogs(prev => [...prev, "Please set API Key first."]);
      return;
    }
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const ai = new AIService(apiKey);
      setLogs(prev => [...prev, "Analyzing input..."]);
      const { data, diagnosis } = await ai.parseAndDiagnose(input, formData);
      
      // Merge data deep
      setFormData(prev => {
          const newData = { ...prev };
          // Simple deep merge for sections
          for (const [key, val] of Object.entries(data)) {
              // @ts-ignore
              newData[key] = { ...newData[key], ...val };
          }
          return newData;
      });

      setLogs(prev => [...prev, `AI: ${diagnosis.summary}`]);
      setActiveTab('form');
      setInput(''); // Clear input after successful parse
    } catch (e: any) {
      setLogs(prev => [...prev, `Error: ${e.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
        setLogs(prev => [...prev, "Error: No active tab found."]);
        return;
    }

    setLogs(prev => [...prev, "Sending fill command..."]);
    
    try {
      chrome.tabs.sendMessage(tab.id, {
        action: "FILL_FORM",
        data: formData
      }, (response) => {
          if (chrome.runtime.lastError) {
               setLogs(prev => [...prev, "Connection failed. Please reload the page."]);
               return;
          }
          if (response && response.status === 'success') {
              setLogs(prev => [...prev, response.message]);
          } else if (response && response.status === 'error') {
              setLogs(prev => [...prev, `Fail: ${response.message}`]);
          }
      });
    } catch (e) {
      setLogs(prev => [...prev, "Failed to send command."]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Auto DS-160 Filler
        </h1>
        <div className="text-xs bg-blue-800 px-2 py-1 rounded">v1.0</div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-gray-50">
        <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 transition-colors ${activeTab === 'chat' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <MessageSquare className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setActiveTab('form')} className={`flex-1 p-3 transition-colors ${activeTab === 'form' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <ClipboardCheck className="w-5 h-5 mx-auto" />
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex-1 p-3 transition-colors ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}>
          <Settings className="w-5 h-5 mx-auto" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100">
              <p className="font-semibold mb-1">How to use:</p>
              <p>Paste your resume, passport details, or just type naturally.</p>
              <p className="italic mt-1 text-xs opacity-75">"Born 1990-01-01 in Beijing, Passport E12345678..."</p>
            </div>
            <textarea 
              className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-sm"
              placeholder="Type or paste your info here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button 
              onClick={handleAISubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 font-medium transition-all"
            >
              {isLoading ? (
                  <>
                    <span className="animate-spin">↻</span> Processing...
                  </>
              ) : "Analyze & Extract"}
            </button>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-700">Extracted Data</h3>
                <button onClick={handleClearData} className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                </button>
            </div>
            
            <div className="flex-1 bg-gray-50 p-2 rounded border overflow-auto text-xs font-mono shadow-inner">
              {Object.keys(formData).length === 0 ? (
                  <div className="text-gray-400 text-center mt-10">No data yet.<br/>Go to Chat to import.</div>
              ) : (
                  <pre>{JSON.stringify(formData, null, 2)}</pre>
              )}
            </div>
            <button 
              onClick={handleAutoFill}
              disabled={Object.keys(formData).length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex justify-center items-center gap-2 font-bold shadow-lg shadow-green-100 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Play className="w-5 h-5" />
              Auto-Fill Page
            </button>
            <p className="text-[10px] text-gray-400 text-center">
                Navigate to a DS-160 section (e.g. Personal Info) before clicking.
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                <input 
                type="password" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-1">Required for GPT-5.1 intelligence.</p>
            </div>
            
            <button onClick={handleSaveKey} className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm transition-colors">
              Save Configuration
            </button>
            
            <div className="border-t pt-4 mt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Privacy Check</h4>
                <div className="text-xs text-gray-400 space-y-1">
                    <p>✓ Keys stored in chrome.storage.local</p>
                    <p>✓ Direct communication with OpenAI</p>
                    <p>✓ No analytics or tracking</p>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="bg-gray-900 text-green-400 p-2 text-[10px] font-mono h-20 overflow-auto border-t border-gray-800">
        {logs.length === 0 && <div className="opacity-50">> Ready.</div>}
        {logs.map((log, i) => <div key={i} className="whitespace-nowrap">{`> ${log}`}</div>)}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

export default App;
