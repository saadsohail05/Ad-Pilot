"use client"; // Marks this file as a client component

import { useState, useEffect } from "react"; // Add useEffect
import NewsLatterBox from "./NewsLatterBox";
import { analyzeMarket } from "@/actions/actions";
import { useAuth } from "@/context/AuthContext"; // Updated import path
import { Tooltip } from "@/components/ui/tooltip"; // Corrected import path

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [token, setToken] = useState<string | null>(null); // Add token state
  const { user } = useAuth(); // Get user from AuthContext
  const [isStarted, setIsStarted] = useState(false); // Add this state
  const [formData, setFormData] = useState<{
    product: string;
    product_type: string;
    category: string;
  } | null>(null);

  // Move localStorage access to useEffect
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    setToken(storedToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setIsStarted(false); // Reset isStarted
    setError(null);
    setGeneratedContent(""); // Clear previous content

    const formDataObj = new FormData(e.currentTarget);
    const data = {
      product: formDataObj.get('productName') as string,
      product_type: formDataObj.get('productType') as string,
      category: formDataObj.get('productCategory') as string,
      description: formDataObj.get('productDescription') as string,
    };

    // Save form data for metadata
    setFormData({
      product: data.product,
      product_type: data.product_type,
      category: data.category
    });

    try {
      if (!token) {
        throw new Error('Not authenticated');
      }

      await analyzeMarket(
        data,
        token,
        (chunk: string) => {
          setIsStarted(true);
          setGeneratedContent(prev => prev + chunk);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to analyze market');
    } finally {
      setLoading(false);
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
                Market Insights
              </h2>
              
              {error && (
                <div className="mb-4 text-red-500 text-sm">
                  {error}
                </div>
              )}

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
                        htmlFor="productType"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Product Type
                      </label>
                      <input
                        type="text"
                        id="productType"
                        name="productType"
                        placeholder="Enter product type"
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

                  {/* Updated Submit Button with Loading State */}
                  <div className="w-full px-4 mb-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`rounded-sm ${
                        loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                      } px-6 py-3 text-base font-medium text-white shadow-submit duration-300 dark:shadow-submit-dark`}
                    >
                      {loading ? 'Analyzing...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            {loading && !isStarted && (
              <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Fetching market insights...
                    <br />
                    <span className="text-sm">This may take a few moments</span>
                  </p>
                </div>
              </div>
            )}

            {isStarted && generatedContent && (
              <NewsLatterBox 
                content={generatedContent} 
                metadata={formData || undefined}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
