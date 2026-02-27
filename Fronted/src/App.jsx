import { useState, useRef } from "react";

function App() {
  const [code, setCode] = useState('');

  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setOutput("");

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      setOutput(data.stdout || data.stderr || "No output");
      setLastRun(new Date());
    } catch (err) {
      setOutput("Network error: " + err.message);
      setLastRun(new Date());
    } finally {
      setLoading(false);
    }
  };

  const clearOutput = () => setOutput("");
  const clearEditor = () => setCode("");

  const copyToClipboard = async (text, ref, target) => {
    const markCopied = (t) => {
      if (t === 'input') {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 1600);
      } else if (t === 'output') {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 1600);
      }
    };

    try {
      await navigator.clipboard.writeText(text || "");
      markCopied(target);
    } catch (e) {
      if (ref && ref.current) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand("copy");
        sel.removeAllRanges();
        markCopied(target);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-block p-2 bg-transparent rounded-2xl mb-4">
            
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                PeTTa Playground
              </h1>
           
          </div>
        
        </header>

        {/* Main Content - Vertical Layout */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h2 className="text-sm font-semibold text-slate-200 ml-2">Input</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(code, inputRef, 'input')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 flex items-center gap-1"
                  title="Copy input code"
                >
                  {copiedInput ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Input</span>
                    </>
                  )}
                </button>
                <button
                  onClick={clearEditor}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-700 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write MeTTa code here..."
              className="w-full h-96 font-mono text-base p-4 bg-slate-900 text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              spellCheck="false"
            />
          </div>

          {/* Run Button - Centered */}
          <div className="flex justify-center">
            <button
              onClick={runCode}
              disabled={loading}
              className={`px-8 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-200 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h2 className="text-sm font-semibold text-slate-200">Output</h2>
                {lastRun && (
                  <span className="text-xs text-gray-500 ml-2">
                    Last run: {lastRun.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(output, outputRef, 'output')}
                  disabled={!output}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    output 
                      ? 'text-slate-200 hover:text-white bg-slate-700 border border-slate-600' 
                      : 'text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed'
                  }`}
                  title="Copy output"
                >
                  {copiedOutput ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Output</span>
                    </>
                  )}
                </button>
                <button
                  onClick={clearOutput}
                  disabled={!output}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-all duration-200 ${
                    output 
                      ? 'text-slate-200 hover:text-white bg-slate-700 border border-slate-600' 
                      : 'text-slate-400 bg-slate-800 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
            <div className="relative h-64 overflow-auto bg-slate-900">
              <pre 
                ref={outputRef}
                className="absolute inset-0 p-4 font-mono text-sm text-green-300 whitespace-pre-wrap overflow-auto"
              >
                {output}
              </pre>
            </div>
          </div>
        </div>
       
      </div>
    </div>
  );
}

export default App;