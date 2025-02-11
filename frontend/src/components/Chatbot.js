import React, { useState, useRef, useEffect, memo } from 'react';
import axios from 'axios';
import { Send, Bot, User } from 'lucide-react';
import useFetchUserInvoices from '../hooks/useFetchUserInvoices';

const Chatbot = () => {
  const { invoices, error } = useFetchUserInvoices(); // Fetch invoices
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  console.log(invoices)
  // Scroll to the bottom of the chat when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message to the backend
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add the user's message to the chat
    const userMessage = { sender: 'user', message: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send the user's message AND invoices to the backend
      const response = await axios.post('http://localhost:5002/api/chat', {
        message: input,
        invoices: invoices, // Pass the invoices data here
      });

      // Extract the bot's reply from the backend response
      const botResponse = response.data.response;

      // Add the bot's response to the chat
      setMessages((prev) => [...prev, { sender: 'bot', message: botResponse, animated: true }]);
    } catch (error) {
      console.error('Error fetching bot response:', error);

      // Handle errors gracefully by showing an error message in the chat
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          message: "I apologize, but I'm having trouble connecting right now. Please try again later.",
          animated: true,
        },
      ]);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  // Typewriter effect for bot responses
  const TypewriterEffect = memo(({ text, onComplete }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, 20);
        return () => clearTimeout(timeout);
      } else {
        onComplete(); // Mark message as non-animated after typing finishes
      }
    }, [currentIndex, text, onComplete]);

    return <span>{displayText}</span>;
  });

  return (
    <div className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 h-screen w-screen flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100 p-6">
        <Bot className="w-8 h-8 text-purple-900" />
        <div>
          <h2 className="text-xl font-bold text-purple-900">ExpenFlow Assistant</h2>
          <p className="text-sm text-purple-600">AI-powered expense management help</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 px-2 scroll-smooth">
        {messages.map((msg, index) => {
          const isLatestBotMessage = index === messages.length - 1 && msg.sender === 'bot' && msg.animated;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 mb-4 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-purple-100' : 'bg-purple-900'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-5 h-5 text-purple-900" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-purple-900 text-white rounded-tr-none'
                    : 'bg-purple-50 text-purple-900 rounded-tl-none'
                }`}
              >
                {isLatestBotMessage ? (
                  <TypewriterEffect
                    text={msg.message}
                    onComplete={() => {
                      setMessages((prev) =>
                        prev.map((m, i) => (i === index ? { ...m, animated: false } : m))
                      );
                    }}
                  />
                ) : (
                  msg.message
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-900 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="relative p-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-4 py-3 pr-12 rounded-xl bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={`absolute right-10 top-1/2 -translate-y-1/2 p-2 rounded-lg ${
            input.trim()
              ? 'bg-purple-900 text-white hover:bg-purple-800'
              : 'bg-purple-200 text-purple-400'
          } transition-all duration-300`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;