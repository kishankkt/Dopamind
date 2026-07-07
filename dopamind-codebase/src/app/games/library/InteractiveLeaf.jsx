import React, { useState, useEffect, useRef } from 'react';
import { chatWithLeaf } from '@/app/features/ai_spotting/aiEngine';
import { X, Send, Moon, Sun } from 'lucide-react';
import { BrandConfig } from '@/config/brand';
import LogoIcon from '@/shared/ui/LogoIcon';
import './InteractiveLeaf.css';

export default function InteractiveLeaf() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Initialize Dark Mode from localStorage or Auto-detect (Time/OS)
  useEffect(() => {
    const savedTheme = localStorage.getItem('dopamind_theme');
    
    if (savedTheme) {
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } else {
      // No saved preference: Auto-detect!
      // 1. Check OS-level dark mode preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 2. Fallback: Check local time (Night time = 6 PM to 6 AM)
      const hour = new Date().getHours();
      const isNightTime = hour >= 18 || hour < 6;
      
      if (prefersDark || isNightTime) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dopamind_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dopamind_theme', 'light');
    }
    // Dispatch event so other components (like Settings) can react if needed
    window.dispatchEvent(new Event('theme-change'));
  };

  // Initialize chat (purging old broken auto-guide memory)
  useEffect(() => {
    localStorage.removeItem('dopamind_ai_memory');
    setMessages([{ role: 'assistant', content: "Hi! I'm your DopaMind AI Guide 🌿. How can I help you today?" }]);
  }, []);

  // Save memory to LocalStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('dopamind_ai_memory', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const aiResponse = await chatWithLeaf(newMessages.slice(-6));
    setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    setIsTyping(false);
  };

  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/### (.*?)(?:\n|$)/g, '<strong style="display:block; margin-top:8px; margin-bottom:2px; font-size:1.05em; color:var(--color-emerald-deep)">$1</strong>')
      .replace(/## (.*?)(?:\n|$)/g, '<strong style="display:block; margin-top:8px; margin-bottom:2px; font-size:1.1em; color:var(--color-emerald-deep)">$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)(?:\n|$)/g, '<li style="margin-left: 12px; margin-bottom: 2px;">$1</li>')
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };

  return (
    <div className="ai-guide-container">
      
      {/* 💬 Chat Box */}
      {isOpen && (
        <div className="glass-panel animate-pop ai-chatbox">
          {/* Header */}
          <div className="ai-chatbox-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', display: 'flex', color: 'white' }}><LogoIcon width={20} height={20} /></span>
              <strong style={{ fontFamily: 'var(--font-header)', fontSize: '1.1rem' }}>
                DopaMind Guide
              </strong>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="ai-chatbox-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-chatbox-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                <span dangerouslySetInnerHTML={parseMarkdown(msg.content)} />
              </div>
            ))}
            
            {isTyping && (
              <div className="ai-chatbox-message assistant" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '10px 14px' }}>
                <div className="typing-dot animate-bounce" style={{width: '6px', height: '6px', background: 'var(--color-emerald-base)', borderRadius: '50%', animationDelay: '0s'}}></div>
                <div className="typing-dot animate-bounce" style={{width: '6px', height: '6px', background: 'var(--color-emerald-base)', borderRadius: '50%', animationDelay: '0.1s'}}></div>
                <div className="typing-dot animate-bounce" style={{width: '6px', height: '6px', background: 'var(--color-emerald-base)', borderRadius: '50%', animationDelay: '0.2s'}}></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="ai-chatbox-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="ai-chatbox-input"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              style={{
                background: 'var(--color-emerald-base)',
                color: 'var(--color-white)',
                border: 'none',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                opacity: input.trim() && !isTyping ? 1 : 0.5,
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Action Row: Theme Toggle + Leaf Button */}
      <div className="ai-controls-row">
        <button 
          className="dark-mode-toggle-icon"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div 
          className={`ai-leaf-button ${!isOpen ? 'animate-float' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            transform: isOpen ? 'scale(0.9) rotate(45deg)' : 'scale(1) rotate(0deg)'
          }}
        >
          <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>
            <LogoIcon width={32} height={32} style={{ display: 'block' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
