import React, { createContext, useContext, useMemo, useState } from 'react';

const ChatbotContext = createContext(undefined);

export const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const toggle = () => {
    setIsOpen(prev => !prev);
  };
  const open = () => { setIsOpen(true); };
  const close = () => setIsOpen(false);

  const value = useMemo(() => ({ isOpen, toggle, open, close, messages, setMessages }), [isOpen, messages]);

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error('useChatbot must be used within ChatbotProvider');
  return ctx;
};


