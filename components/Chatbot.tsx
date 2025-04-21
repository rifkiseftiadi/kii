'use client';
import { useState, useEffect } from 'react';

export default function Chatbot() {
  const [isLightTheme, setIsLightTheme] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsLightTheme(!isDarkMode);
  }, []);

  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { sender: 'user', text: message };
    setChatLog((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', errorText);
        throw new Error('Failed to fetch AI response');
      }

      const data = await response.json();
      const aiMsg = { sender: 'ai', text: data.reply || 'No response from AI.' };
      setChatLog((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error connecting to AI:', err);
      setChatLog((prev) => [...prev, { sender: 'ai', text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center py-10 px-4 ${
        isLightTheme
          ? 'bg-gray-100 text-gray-900'
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white'
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <h1
          className={`text-4xl font-extrabold ${
            isLightTheme
              ? 'text-gray-900'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500'
          }`}
        >
          Gemini Flash Chatbot
        </h1>
      </div>

      <div
        className={`w-full max-w-2xl rounded-xl shadow-lg p-6 space-y-4 overflow-y-auto h-[500px] ${
          isLightTheme ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-200'
        }`}
      >
        {chatLog.map((chat, idx) => (
          <div
            key={idx}
            className={`flex ${
              chat.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-4 rounded-2xl max-w-[75%] text-sm whitespace-pre-wrap shadow-md ${
                chat.sender === 'user'
                  ? isLightTheme
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : isLightTheme
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {chat.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-gray-400 animate-pulse">
            AI is typing...
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="w-full max-w-2xl mt-6 flex gap-4 items-center"
      >
        <input
          className={`flex-1 p-4 rounded-full border focus:outline-none focus:ring-2 placeholder-gray-400 ${
            isLightTheme
              ? 'bg-gray-100 text-gray-900 border-gray-300 focus:ring-blue-500'
              : 'bg-gray-700 text-white border-gray-600 focus:ring-purple-500'
          }`}
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className={`px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 ${
            isLightTheme
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90'
          }`}
        >
          Send 🚀
        </button>
      </form>
    </div>
  );
}