// src/pages/Chat.tsx
import { ChatInterface } from '@/components/Chatbot/ChatInterface';

const Chat = () => {
  return (
    // The main container for the chat page, taking up available space
    <div className="flex flex-col h-[calc(100vh-80px)]"> 
      {/* The h-[calc(100vh-80px)] is an estimate for screen height minus navbar height */}
      <ChatInterface />
    </div>
  );
};

export default Chat;
