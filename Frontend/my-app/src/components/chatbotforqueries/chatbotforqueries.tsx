"use client";

import { useState } from "react";

const DummyChatbot = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hello! How can I help you analyze your campaign ?" },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      setInput("");
      // Simulate a response after a short delay
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            role: "assistant",
            content:
              "Thank you for your input. Is there anything else you'd like to add to your campaign?",
          },
        ]);
      }, 1000);
    }
  };

  return (
    <section className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Chatbot for queries
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Enter details below and chat with our assistant.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="campaignName"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        id="campaignName"
                        name="campaignName"
                        placeholder="Enter campaign name"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="Ad-name"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Ad name
                      </label>
                      <input
                        type="text"
                        id="Ad-name"
                        name="Ad name"
                        placeholder="Enter Ad name"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="Platform name/s"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Platform name/s
                      </label>
                      <input
                        type="number"
                        id="Platform name/s"
                        name="Platform name/s"
                        placeholder="Enter Platform name/s"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="chatInput"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Chat with Assistant
                      </label>
                      <div className="border-stroke rounded-sm border bg-[#f8f8f8] p-4 dark:border-transparent dark:bg-[#2C303B] mb-4 h-64 overflow-y-auto">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className={`mb-2 ${
                              message.role === "user" ? "text-right" : "text-left"
                            }`}
                          >
                            <span
                              className={`inline-block rounded-lg px-3 py-2 ${
                                message.role === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {message.content}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          id="chatInput"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message..."
                          className="border-stroke flex-grow rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                        />
                        <button
                          type="submit"
                          className="ml-2 rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DummyChatbot;