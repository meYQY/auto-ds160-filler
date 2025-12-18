import { useState, useEffect, useRef } from 'react';
import { AIService } from './services/ai';
import { DS160FormData, AIAnalysisResult } from './types/ds160';
import { saveToStorage, loadFromStorage, clearStorage } from './utils/storage';

// Current extension version
const VERSION = "1.0.4";

function App() {
  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState<DS160FormData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [view, setView] = useState<'chat' | 'form' | 'settings'>('chat');
  const logsEndRef = useRef<HTMLDivElement>(null);

  const aiService = new AIService(apiKey);

  useEffect(() => {
    loadFromStorage().then(data => {
      if (data.apiKey) setApiKey(data.apiKey);
      if (data.formData) setFormData(data.formData);
    });
    
    addLog(`Auto DS-160 Filler v${VERSION} initialized.`);
    addLog('System ready. Waiting for input...');
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (formData) {
      saveToStorage({ formData });
    }
  }, [formData]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      alert('Please set your API Key in Settings first!');
      setView('settings');
      return;
    }

    setLoading(true);
    addLog('Starting AI analysis...');
    
    try {
      const { data, diagnosis } = await aiService.parseAndDiagnose(input, formData || undefined);
      setFormData(data);
      setAnalysis(diagnosis);
      addLog(`AI Analysis: ${diagnosis.summary}`);
      addLog('Data extraction completed successfully.');
      setView('form');
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFill = async () => {
    if (!formData) return;
    
    addLog('Initiating auto-fill sequence...');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error('No active tab found');

      if (!tab.url?.includes('ceac.state.gov')) {
         addLog('Warning: Target page is not ceac.state.gov. Attempting anyway...');
      }

      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'FILL_FORM', 
        data: formData 
      });

      if (response && response.status === 'success') {
        addLog(`Success: ${response.message}`);
      } else if (response && response.status === 'warning') {
        addLog(`Warning: ${response.message}`);
      } else {
        addLog(`Error: ${response?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      addLog(`Connection failed. Please reload the target page.`);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setFormData(null);
      setAnalysis(null);
      setLogs([]);
      await clearStorage();
      addLog('Session data cleared.');
    }
  };

  const handleExport = () => {
      if (!formData) return;
      const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ds160-data-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addLog('Data exported to JSON file.');
  };

  const saveSettings = () => {
    saveToStorage({ apiKey });
    addLog('Configuration saved.');
    setView('chat');
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-gray-50 flex flex-col text-sm font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold">Auto DS-160 Filler</h1>
          <p className="text-xs opacity-90">Powered by GPT-5.1</p>
        </div>
        <div className="text-xs bg-blue-700 px-2 py-1 rounded">v{VERSION}</div>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-white">
        <button 
          onClick={() => setView('chat')}
          className={`flex-1 p-3 font-medium ${view === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Chat
        </button>
        <button 
          onClick={() => setView('form')}
          className={`flex-1 p-3 font-medium ${view === 'form' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Form Data
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`flex-1 p-3 font-medium ${view === 'settings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        
        {/* CHAT VIEW */}
        {view === 'chat' && (
          <div className="flex flex-col h-full space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your personal info, passport details, and travel plans here..."
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                loading || !input.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Processing...' : 'Analyze & Extract'}
            </button>
          </div>
        )}

        {/* FORM DATA VIEW */}
        {view === 'form' && (
          <div className="space-y-4">
             {analysis && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h3 className="font-semibold text-green-800 mb-1 flex items-center">
                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Analysis Complete
                </h3>
                <p className="text-green-700">{analysis.summary}</p>
              </div>
            )}

            <div className="bg-white border rounded-lg p-3 shadow-sm max-h-[300px] overflow-auto">
              <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                {formData ? JSON.stringify(formData, null, 2) : 'No data extracted yet.'}
              </pre>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleFill}
                disabled={!formData}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-bold text-lg shadow transition-transform active:scale-95 ${
                  !formData ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Auto-Fill Page
              </button>
              <button
                 onClick={handleExport}
                 className="px-3 py-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50"
                 title="Export Data"
              >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <button
                 onClick={handleClear}
                 className="px-3 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                 title="Clear Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {view === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your key is stored locally in your browser. We never access it.
              </p>
            </div>
            <button
              onClick={saveSettings}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Configuration
            </button>
            
            <div className="pt-4 border-t">
                <p className="text-xs text-gray-400 text-center">
                    Auto DS-160 Filler is an open source project.<br/>
                    Not affiliated with the US Department of State.
                </p>
            </div>
          </div>
        )}
      </main>

      {/* Logs Console */}
      <div className="bg-gray-900 text-gray-300 p-2 text-xs font-mono h-32 overflow-y-auto border-t border-gray-700">
        {logs.length === 0 && <div className="opacity-50 italic">System ready...</div>}
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0">
             <span className="text-blue-400 mr-1">&gt;</span> {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

export default App;
