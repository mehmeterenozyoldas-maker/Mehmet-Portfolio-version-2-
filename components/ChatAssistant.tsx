import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage, LoadingState } from '../types';
import { SparklesIcon, SendIcon, XIcon } from './Icons';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "Hi there! I'm Mehmet's AI Digital Twin. Ask me anything about his work, specifically the Model Morph Hub, or his design philosophy.",
      timestamp: Date.now()
    }
  ]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || status === LoadingState.LOADING) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus(LoadingState.LOADING);

    // Placeholder for model response while streaming
    const modelMsgId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      { role: 'model', text: '', timestamp: modelMsgId }
    ]);

    try {
      const stream = await sendMessageToGemini(userMsg.text, messages);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.timestamp === modelMsgId ? { ...msg, text: fullText } : msg
        ));
        scrollToBottom();
      }
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.timestamp === modelMsgId ? { ...msg, text: "I'm having a bit of trouble connecting to the neural network right now. Try again?" } : msg
      ));
      setStatus(LoadingState.ERROR);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SparklesIcon className="text-white w-5 h-5" />
              <div>
                <h3 className="text-white font-bold text-sm">Digital Twin</h3>
                <p className="text-xs text-indigo-100">Powered by Gemini 2.5</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/95">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                  }`}
                >
                  {msg.text}
                  {msg.role === 'model' && msg.text === '' && (
                    <span className="inline-block w-2 h-4 bg-zinc-500 animate-pulse ml-1"/>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-zinc-900 border-t border-zinc-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about Model Morph Hub..."
                className="w-full bg-zinc-800 text-white placeholder-zinc-500 rounded-full py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || status === LoadingState.LOADING}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-2 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-black hover:bg-zinc-200'
        }`}
      >
        {!isOpen && (
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-sm font-semibold pr-0 group-hover:pr-2">
            Ask AI about me
          </span>
        )}
        <SparklesIcon className={`w-6 h-6 ${isOpen ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </button>
    </div>
  );
};

export default ChatAssistant;