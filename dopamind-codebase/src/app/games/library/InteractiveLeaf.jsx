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
  const [isVisible, setIsVisible] = useState(() => localStorage.getItem('dopamind_bubbles_visible') !== 'false');
  
  const messagesEndRef = useRef(null);

  // --- DRAG LOGIC ---
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0, timer: null, isDragging: false, hasDragged: false });

  useEffect(() => {
    const saved = localStorage.getItem('dopamind_bubble_pos');
    if (saved) {
      try { setPosition(JSON.parse(saved)); } catch(e) {}
    }

    const handleReset = () => {
      setPosition(null);
      localStorage.removeItem('dopamind_bubble_pos');
    };
    const handleToggle = (e) => {
      setIsVisible(e.detail.visible);
      localStorage.setItem('dopamind_bubbles_visible', e.detail.visible);
    };
    window.addEventListener('reset-bubble', handleReset);
    window.addEventListener('toggle-bubbles', handleToggle);
    return () => {
      window.removeEventListener('reset-bubble', handleReset);
      window.removeEventListener('toggle-bubbles', handleToggle);
    };
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (!dragRef.current.isDragging) {
        if (dragRef.current.timer) {
          const dx = Math.abs(clientX - dragRef.current.startX);
          const dy = Math.abs(clientY - dragRef.current.startY);
          if (dx > 10 || dy > 10) {
            clearTimeout(dragRef.current.timer);
            dragRef.current.timer = null;
          }
        }
        return;
      }
      
      e.preventDefault(); // prevent scrolling while dragging
      let newX = clientX - dragRef.current.offsetX;
      let newY = clientY - dragRef.current.offsetY;
      
      // Bound to screen so it doesn't go "behind" or off the screen
      const containerW = 64; // approx size of bubble
      const containerH = 64;
      newX = Math.max(0, Math.min(newX, window.innerWidth - containerW));
      newY = Math.max(0, Math.min(newY, window.innerHeight - containerH));
      
      setPosition({ x: newX, y: newY });
    };

    const handleUp = () => {
      if (dragRef.current.timer) {
        clearTimeout(dragRef.current.timer);
        dragRef.current.timer = null;
      }
      if (dragRef.current.isDragging) {
        dragRef.current.isDragging = false;
        setIsDragging(false);
        // keep hasDragged true briefly to block onClick
        setTimeout(() => { dragRef.current.hasDragged = false; }, 100);
      }
    };

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  const prevDragging = useRef(isDragging);
  useEffect(() => {
    if (prevDragging.current && !isDragging && position) {
      localStorage.setItem('dopamind_bubble_pos', JSON.stringify(position));
    }
    prevDragging.current = isDragging;
  }, [isDragging, position]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.hasDragged = false;
    
    const container = e.currentTarget.closest('.ai-guide-container');
    const rect = container.getBoundingClientRect();
    dragRef.current.offsetX = clientX - rect.left;
    dragRef.current.offsetY = clientY - rect.top;
    
    dragRef.current.timer = setTimeout(() => {
      dragRef.current.isDragging = true;
      dragRef.current.hasDragged = true;
      setIsDragging(true);
      if (navigator.vibrate) navigator.vibrate(50);
      setPosition({ x: rect.left, y: rect.top });
    }, 3000);
  };
  // ------------------

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
    if (dragRef.current.hasDragged) return;
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

  if (!isVisible) return null;

  return (
    <div 
      className="ai-guide-container"
      style={{
        ...(position ? {
          bottom: 'auto', right: 'auto',
          top: position.y, left: position.x,
          transition: isDragging ? 'none' : 'top 0.3s, left 0.3s'
        } : {})
      }}
    >
      
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
          onPointerDown={handlePointerDown}
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ transform: isDragging ? 'scale(1.1)' : '' }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div 
          className={`ai-leaf-button ${!isOpen ? 'animate-float' : ''}`}
          onPointerDown={handlePointerDown}
          onClick={() => { if (!dragRef.current.hasDragged) setIsOpen(!isOpen); }}
          style={{
            transform: isOpen ? 'scale(0.9) rotate(45deg)' : (isDragging ? 'scale(1.1)' : 'scale(1) rotate(0deg)'),
            boxShadow: isDragging ? '0 12px 36px rgba(16,185,129,0.5)' : ''
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
