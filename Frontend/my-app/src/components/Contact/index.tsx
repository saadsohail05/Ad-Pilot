"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NewsLatterBox from "./NewsLatterBox";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const Contact = () => {
  const pathname = usePathname();
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
  }, []);

  const generateContent = async (data: any) => {
    setIsLoading(true);
    setGeneratedContent(""); // Clear existing content while loading
    setError(null);
    
    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:8000/content/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const result = await response.json();
      setGeneratedContent(result.content);
    } catch (error) {
      console.error('Error generating ad:', error);
      setError((error as Error).message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = {
      product: e.currentTarget.productName.value,
      description: e.currentTarget.productDescription.value,
      category: e.currentTarget.productCategory.value,
    };
    setFormData(formData);
    await generateContent(formData);
  };

  const handleRetry = async () => {
    if (formData) {
      await generateContent(formData);
    }
  };

  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Create Ad
              </h2>
              
              {error && (
                <div className="mb-4 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <p className="mb-6 text-base font-medium text-body-color">
                Enter product details below and submit.
              </p>

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="productName"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="productName"
                        name="productName"
                        placeholder="Enter product name"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="productCategory"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Product Category
                      </label>
                      <select
                        id="productCategory"
                        name="productCategory"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      >
                        <option value="clothing">Clothing and Fashion</option>
                        <option value="home">Home and Living</option>
                        <option value="electronics">Electronics and Gadgets</option>
                        <option value="sports">Sports and Outdoor</option>
                        <option value="beauty">Beauty and Personal Care</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="productDescription"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Product Description
                      </label>
                      <textarea
                        id="productDescription"
                        name="productDescription"
                        rows={4}
                        placeholder="Enter product description"
                        className="border-stroke w-full resize-none rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full px-4 mb-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark disabled:opacity-50"
                    >
                      {isLoading ? 'Generating...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Page Navigation Buttons */}
              <div className="w-full px-4">
                <div className="flex justify-between space-x-4">
                  <Link
                    href="/createcampaign"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/createcampaign"
                        ? "bg-blue-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Create Campaign
                  </Link>
                  <Link
                    href="/createad"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/createad"
                        ? "bg-gray-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Create Ad
                  </Link>
                  <Link
                    href="/createimage"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/create-image"
                        ? "bg-gray-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Create Image
                  </Link>
                  <Link
                    href="/schedule-publish"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/schedule-publish"
                        ? "bg-gray-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Schedule / Publish
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            {isLoading && (
              <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Generating advertisement...
                    <br />
                    <span className="text-sm">This may take a few moments</span>
                  </p>
                </div>
              </div>
            )}

            {!isLoading && generatedContent && (
              <NewsLatterBox 
                content={generatedContent} 
                onRetry={handleRetry}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;