import { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';

const Chat = ({ isMinimized, onToggleMinimize }) => {
  const {
    messages,
    isConnected,
    error,
    username,
    isUsernameSet,
    connect,
    disconnect,
    sendMessage,
    updateUsername,
    formatTime
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect when chat is opened
  useEffect(() => {
    if (!isMinimized && isUsernameSet) {
      connect();
    } else if (isMinimized) {
      disconnect();
    }
  }, [isMinimized, isUsernameSet]);

  // Show username modal if username not set
  useEffect(() => {
    if (!isMinimized && !isUsernameSet) {
      setShowUsernameModal(true);
    }
  }, [isMinimized, isUsernameSet]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && sendMessage(messageInput)) {
      setMessageInput('');
    }
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (updateUsername(tempUsername)) {
      setShowUsernameModal(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={`live-chat ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header" onClick={onToggleMinimize}>
        <div className="chat-title">
          <i className="fas fa-comments"></i>
          Live Chat
          {isConnected && <span className="connection-indicator connected"></span>}
          {!isConnected && !isMinimized && <span className="connection-indicator disconnected"></span>}
        </div>
        <div className="chat-header-right">
          <button 
            className="minimize-chat-button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
          >
            <i className={`fas ${isMinimized ? 'fa-plus' : 'fa-minus'}`}></i>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Username Modal */}
          {showUsernameModal && (
            <div className="username-modal-overlay">
              <div className="username-modal">
                <h3>Choose Your Chat Username</h3>
                <form onSubmit={handleUsernameSubmit}>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    placeholder="Enter username (max 20 characters)"
                    maxLength={20}
                    autoFocus
                    className="username-input"
                  />
                  <div className="username-modal-buttons">
                    <button type="submit" className="username-submit-btn">
                      Join Chat
                    </button>
                  </div>
                </form>
                <p className="username-info">
                  Your username: <strong>{username}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="chat-messages">
            {error && (
              <div className="chat-error">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
                {error.includes('production') && (
                  <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                    Chat requires a WebSocket server deployment. Currently only available in development.
                  </div>
                )}
              </div>
            )}
            
            {messages.length === 0 && !error && (
              <div className="chat-welcome">
                <div className="welcome-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="welcome-text">
                  <h3>Welcome to Live Chat!</h3>
                  <p>Share your thoughts about BNB and crypto with the community!</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="chat-message">
                <div className="message-header">
                  <span className="message-username">{message.username}</span>
                  <span className="message-time">{formatTime(message.created_at)}</span>
                </div>
                <div className="message-content">{message.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chat-input">
            <form onSubmit={handleSendMessage}>
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message as ${username}...`}
                maxLength={500}
                disabled={!isConnected}
                className="message-input"
              />
              <button 
                type="submit" 
                disabled={!isConnected || !messageInput.trim()}
                className="send-button"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
