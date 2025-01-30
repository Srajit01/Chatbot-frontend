import React, { useState, useRef, useEffect } from 'react';
import { Plane, Send, Loader2, MapPin, Hotel, Camera, Car, Mic, MicOff, Search, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function ChatMessage({ message, isUser }) {
  const bookingLink = "\n\n**For all your bookings, please visit: [TBO Website](https://www.tbo.com/)**";    const modifiedMessage = isUser ? message : message + bookingLink
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} mb-4`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-500' : 'bg-emerald-500'
      } shadow-lg`}>
        {isUser ? 
          <div className="w-6 h-6 text-white">👤</div> : 
          <Plane className="w-6 h-6 text-white" />
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
        isUser ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-emerald-100'
      }`}>
        <ReactMarkdown 
          className="text-gray-800 whitespace-pre-wrap prose prose-sm max-w-none"
          components={{
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
          }}
        >
          {modifiedMessage}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, onClick }) {
    return (
      <button
          onClick={onClick}
          className="w-full bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-50 text-left border border-emerald-100/50"
      >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
      </button>
    );
}

function SearchToggle({ mode, onToggle }) {
    return (
      <div className="flex rounded-lg bg-gray-100 p-1">
          <button
              onClick={() => onToggle('text')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'text'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
              }`}
          >
              <Search className="w-4 h-4" />
          </button>
          <button
              onClick={() => onToggle('voice')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'voice'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
              }`}
          >
              <Mic className="w-4 h-4" />
          </button>
      </div>
    );
}


function VoiceInput({ onVoiceInput, isListening }) {
    return (
      <button
          onClick={onVoiceInput}
          className={`p-3 rounded-xl transition-all ${
              isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-600'
          } text-white shadow-sm hover:shadow-md`}
          title={isListening ? 'Stop recording' : 'Start voice input'}
      >
          {isListening ? (
              <MicOff className="w-5 h-5" />
          ) : (
              <Mic className="w-5 h-5" />
          )}
      </button>
    );
}

function App() {
  const [messages, setMessages] = useState([
    { text: "👋 Hello! I'm your AI travel companion, ready to help plan your perfect journey across the World! I can assist with:\n\n• Finding ideal destinations\n• Hotel recommendations\n• Must-see attractions\n• Transportation options\n• Trip duration planning\n• Local tips and safety\n\nWhat would you like to explore today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [searchMode, setSearchMode] = useState('text'); 
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [lastTranscript, setLastTranscript] = useState('');


  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setInput(transcript);
        setLastTranscript(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (lastTranscript.trim()) {
          const submitEvent = new Event('submit', { cancelable: true });
          document.querySelector('form').dispatchEvent(submitEvent);
          setLastTranscript('');
        }
      };

      setRecognition(recognition);
    }
  }, [lastTranscript]);

  const handleSearchModeToggle = (mode) => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    }
    setSearchMode(mode);
    setInput('');
    if (mode === 'text') {
      inputRef.current?.focus();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInput('');
      setLastTranscript('');
      recognition.start();
      setIsListening(true);
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFeatureClick = (query) => {
    setInput(query);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BE_URL}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        console.error(`Backend Error: ${response.statusText}`)
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('server respone:', data);

      if (data && data.reply) {
        setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "I'm sorry, I'm having trouble understanding. Please try again.", 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I'm having trouble connecting. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50">
     
      <header className="bg-white/80 backdrop-blur-sm shadow-sm fixed top-0 left-0 right-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                AI Travel Chatbot from TBO
              </h1>
            </div>
            <SearchToggle mode={searchMode} onToggle={handleSearchModeToggle} />
          </div>
        </div>
      </header>

      <div className="pt-20 min-h-screen">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-6 h-[calc(100vh-6rem)]">
            <div className="w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 h-full overflow-y-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <FeatureCard
                  icon={MapPin}
                  title="Destination Planning"
                  description="Discover perfect locations based on your preferences"
                  onClick={() => handleFeatureClick("I need help finding the perfect destination for my next trip. Can you help me plan?")}
                />
                <FeatureCard
                  icon={Hotel}
                  title="Accommodation"
                  description="Find the best hotels within your budget"
                  onClick={() => handleFeatureClick("I'm looking for hotel recommendations. Can you help me find the perfect place to stay?")}
                />
                <FeatureCard
                  icon={Camera}
                  title="Attractions"
                  description="Explore must-visit places and hidden gems"
                  onClick={() => handleFeatureClick("What are the must-visit attractions and hidden gems I should explore?")}
                />
                <FeatureCard
                  icon={Car}
                  title="Transportation"
                  description="Get local transport tips and guidance"
                  onClick={() => handleFeatureClick("I need advice on transportation options for my trip. What do you recommend?")}
                />
              </div>
            </div>

     
     
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100/50 flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white/50">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message.text} isUser={message.isUser} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500 p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Planning your perfect trip...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t border-gray-100/50 p-4 bg-white/90">
                <div className="flex gap-3">
                  {searchMode === 'voice' && (
                    <VoiceInput onVoiceInput={toggleVoiceInput} isListening={isListening} />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={searchMode === 'voice' ? 'Voice input will appear here...' : 'Ask about destinations, hotels, attractions...'}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors bg-white/90"
                    readOnly={searchMode === 'voice' && isListening}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl px-6 py-3 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors shadow-sm hover:shadow-md"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;