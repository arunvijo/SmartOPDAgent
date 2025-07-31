import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I am SmartOPDAgent. I can help you book appointments, suggest doctors, and guide you through the hospital OPD. What brings you here today?',
      sender: 'bot',
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAgentResponse = async (userQuery: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 1000));

    let response = '';

    if (userQuery.toLowerCase().includes('book') && userQuery.toLowerCase().includes('appointment')) {
      response = 'Sure, I can help you book an appointment. Which department or doctor are you looking for?';
    } else if (userQuery.toLowerCase().includes('suggest') || userQuery.toLowerCase().includes('recommend')) {
      response = 'Please share your symptoms, and I’ll match you with the right doctor.';
    } else if (userQuery.toLowerCase().includes('status') || userQuery.toLowerCase().includes('crowd')) {
      response = 'Real-time status: OPD is moderately crowded. Estimated waiting time: 25 minutes.';
    } else {
      response = 'I’m still learning to handle that query. Try asking "Book an appointment" or "Suggest a doctor for chest pain".';
    }

    setMessages(prev => [
      ...prev,
      { id: prev.length + 1, text: response, sender: 'bot' },
    ]);
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    await simulateAgentResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 font-sans text-gray-800 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">

        {/* Header */}
        <div className="bg-green-600 text-white px-6 py-4 text-xl font-semibold text-center">
          SmartOPDAgent – Your AI Assistant for Hospital OPD
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-green-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="max-w-[75%] p-3 rounded-lg shadow-md bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  <span>SmartOPDAgent is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 flex items-center">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 mr-3 text-sm sm:text-base"
            placeholder="Describe your symptoms or ask to book an appointment..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
