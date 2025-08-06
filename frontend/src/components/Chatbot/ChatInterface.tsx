// src/components/Chatbot/ChatInterface.tsx

import React, { useState, useEffect, useRef } from 'react';
import { sendToAgent } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // To personalize the chat

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export const ChatInterface: React.FC = () => {
  const { userProfile } = useAuth(); // Get user profile for a personalized welcome
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set initial message once we know the user's name
  useEffect(() => {
    const userName = userProfile?.name || 'there';
    setMessages([
      {
        id: 1,
        text: `Hello ${userName}! I am SmartOPDAgent. I can help you book appointments, suggest doctors, and guide you through the hospital OPD. What brings you here today?`,
        sender: 'bot',
      },
    ]);
  }, [userProfile]);


  useEffect(() => {
    // Scroll to the bottom every time messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

   const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMsg: Message = {
      id: Date.now(), // Use timestamp for a more unique key
      text: inputMessage,
      sender: 'user',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // --- CHANGE IS HERE ---
      // We now pass the user's UID from the userProfile to the sendToAgent function.
      // The `?.` is optional chaining, which safely handles the case where userProfile might be null.
      const data = await sendToAgent(userMsg.text, userProfile?.uid);
      
      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.reply,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again shortly.",
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
        handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg px-4 py-2 rounded-lg shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="max-w-xs p-3 rounded-lg shadow-sm bg-muted text-muted-foreground rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="animate-pulse h-2 w-2 bg-primary rounded-full"></div>
                <div className="animate-pulse h-2 w-2 bg-primary rounded-full delay-150"></div>
                <div className="animate-pulse h-2 w-2 bg-primary rounded-full delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2 items-center">
          <Input
            className="flex-1"
            placeholder="Describe your symptoms or ask for an appointment..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
