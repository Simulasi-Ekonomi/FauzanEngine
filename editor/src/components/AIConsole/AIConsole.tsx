import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../stores/editorStore';

export function AIConsole() {
  const { chatMessages, isAiThinking, sendMessage } = useEditorStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="neo-panel" style={{ height: '100%' }}>
      <div className="neo-panel-header">
        <span className="panel-icon">🤖</span>
        Aries AI Console
        {isAiThinking && (
          <span style={{ marginLeft: 8, color: '#0078d4', fontSize: 10, fontWeight: 400 }}>
            thinking...
          </span>
        )}
      </div>
      <div className="ai-console">
        <div className="ai-messages">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`ai-message ${msg.role}`}>
              {msg.role === 'user' && (
                <div style={{ fontSize: 9, color: '#88bbff', marginBottom: 2 }}>You</div>
              )}
              {msg.role === 'assistant' && (
                <div style={{ fontSize: 9, color: '#88ff88', marginBottom: 2 }}>Aries</div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          ))}
          {isAiThinking && (
            <div className="ai-message assistant">
              <div style={{ fontSize: 9, color: '#88ff88', marginBottom: 2 }}>Aries</div>
              <div style={{ color: '#888' }}>
                <span className="thinking-dots">Menganalisis perintah</span>
                <style>{`
                  .thinking-dots::after {
                    content: '...';
                    animation: dots 1.5s steps(4, end) infinite;
                  }
                  @keyframes dots {
                    0%, 20% { content: ''; }
                    40% { content: '.'; }
                    60% { content: '..'; }
                    80%, 100% { content: '...'; }
                  }
                `}</style>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="ai-input-area">
          <input
            type="text"
            placeholder="Ketik perintah untuk Aries AI... (contoh: buat cube merah di posisi 0,5,0)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAiThinking}
          />
          <button onClick={handleSend} disabled={isAiThinking || !input.trim()}>
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
