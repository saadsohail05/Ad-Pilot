"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
    
    // Get initial greeting when component mounts
    if (storedToken) {
      getInitialGreeting(storedToken);
    }
  }, []);

  const getInitialGreeting = async (authToken: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/content/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          text: "",
          is_initial: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get initial greeting');
      }

      const data = await response.json();
      setMessages([{ role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get initial greeting');
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to chat
      setMessages(prev => [...prev, { role: "user", content: input }]);
      
      const response = await fetch("http://localhost:8000/content/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          text: input,
          is_initial: false
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending message');
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div 
              className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Campaign Performance Assistant
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Chat with our AI assistant to analyze your campaign performance.
              </p>

              {error && (
                <div className="mb-6 text-red-500 p-4 bg-red-50 rounded-sm">
                  {error}
                </div>
              )}

              <div className="border-stroke rounded-sm border bg-[#f8f8f8] p-4 dark:border-transparent dark:bg-[#2C303B] mb-4 h-[480px] overflow-y-auto">
                {isLoading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            message.role === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                          }`}
                        >
                          <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="border-stroke flex-grow rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Chatbot;