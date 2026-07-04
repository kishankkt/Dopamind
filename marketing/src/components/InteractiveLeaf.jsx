import React, { useState, useEffect, useRef } from 'react';
import { chatWithLeaf } from '../utils/aiEngine';
import { X, Send } from 'lucide-react';

export default function InteractiveLeaf({ contextTrigger, aiWidgetSize, autoGuide }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const lastTriggerRef = useRef(null);

  // 1. Load memory from LocalStorage on mount
  useEffect(() => {
    const savedMemory = localStorage.getItem('dopamind_ai_memory');
    if (savedMemory) {
      setMessages(JSON.parse(savedMemory));
    } else {
      setMessages([{ role: 'assistant', content: "Hi! I'm your DopaMind Guide 🌿. Let's optimize your brain workout!" }]);
    }

    // Onboarding guide pop up logic for first-time visitors
    const hasVisitedBefore = localStorage.getItem('dopamind_visited_before');
    if (!hasVisitedBefore && autoGuide) {
      setTimeout(() => {
        setIsOpen(true);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: "Welcome! 🌿 I noticed this is your first visit. Would you like me to build a personalized brain-training routine for you? Just say 'Yes'!" }
        ]);
        localStorage.setItem('dopamind_visited_before', 'true');
      }, 2000);
    }
  }, [autoGuide]);

  // 2. Save memory to LocalStorage on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('dopamind_ai_memory', JSON.stringify(messages));
    }
  }, [messages]);

  // 3. React to page triggers (starting games, stopping, navigation)
  useEffect(() => {
    if (contextTrigger && messages.length > 0) {
      if (lastTriggerRef.current !== contextTrigger) {
        lastTriggerRef.current = contextTrigger;
        
        // Only auto open if autoGuide setting is enabled
        if (autoGuide) {
          setIsOpen(true);
        }
        handleContextTrigger(contextTrigger);
      }
    }
  }, [contextTrigger, messages, autoGuide]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleContextTrigger = async (contextMsg) => {
    setIsTyping(true);
    const contextPrompt = [...messages, { role: 'user', content: `[CONTEXT TRIGGER]: ${contextMsg}. Respond to this state change with extremely concise, direct guidance.` }];
    const aiResponse = await chatWithLeaf(contextPrompt);
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsTyping(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const aiResponse = await chatWithLeaf(newMessages);
    setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    setIsTyping(false);
  };

  // Simple Markdown Parser for visual formatting
  const parseMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
      // Headers
      .replace(/### (.*?)(?:\n|$)/g, '<strong style="display:block; margin-top:8px; margin-bottom:2px; font-size:1.05em; color:var(--color-emerald-deep)">$1</strong>')
      .replace(/## (.*?)(?:\n|$)/g, '<strong style="display:block; margin-top:8px; margin-bottom:2px; font-size:1.1em; color:var(--color-emerald-deep)">$1</strong>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/- (.*?)(?:\n|$)/g, '<li style="margin-left: 12px; margin-bottom: 2px;">$1</li>')
      // Newlines
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };

  const isCompactMode = aiWidgetSize === 'compact';

  return (
    <div className="ai-guide-container">
      
      {/* 💬 Chat Box */}
      {isOpen && (
        <div className={`glass-panel animate-pop ai-chatbox ${isCompactMode ? 'compact' : ''}`}>
          {/* Header */}
          <div className="ai-chatbox-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌿</span>
              <strong style={{ fontFamily: 'var(--font-header)', fontSize: '1.1rem' }}>
                {isCompactMode ? 'Guide Notification' : 'DopaMind Guide'}
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

      {/* 🌿 Floating Button with pure emoji (Animated on click) */}
      <div 
        className={`ai-leaf-button ${!isOpen ? 'animate-float' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          transform: isOpen ? 'scale(0.9) rotate(45deg)' : 'scale(1) rotate(0deg)'
        }}
      >
        <span style={{ 
          transform: isOpen ? 'rotate(90deg)' : 'none'
        }}>
          🌿
        </span>
      </div>

    </div>
  );
}
