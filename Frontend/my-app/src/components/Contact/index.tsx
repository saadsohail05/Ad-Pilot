"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NewsLatterBox from "./NewsLatterBox";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const Contact = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, accessToken } = useAuth(); // Change token to accessToken
  const [campaignData, setCampaignData] = useState(null);

  useEffect(() => {
    // Get the stored campaign data
    const storedCampaignData = localStorage.getItem('campaignData');
    if (!storedCampaignData) {
      router.push('/createcampaign');
    } else {
      setCampaignData(JSON.parse(storedCampaignData));
    }
  }, [router]);

  const generateContent = async (data: any) => {
    setIsLoading(true);
    setGeneratedContent(""); // Clear existing content while loading
    setError(null);
    
    try {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:8000/content/generate-ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
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
    const product = e.currentTarget.productName.value.trim();
    const description = e.currentTarget.productDescription.value.trim();
    const category = e.currentTarget.productCategory.value.trim();

    // Validate empty fields
    if (!product || !description || !category) {
      setError('All fields are required. Please fill in all the information.');
      return;
    }

    const formData = {
      product,
      description,
      category,
    };
    setFormData(formData);
    await generateContent(formData);
  };

  const handleRetry = async () => {
    if (formData) {
      await generateContent(formData);
    }
  };

  const handleApprove = async (content: string) => {
    try {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      if (!formData) {
        throw new Error('No form data available');
      }

      // Append website URL to adcopy
      const websiteUrl = campaignData?.websiteUrl;
      const enhancedContent = `${content}\nClick here for more information: ${websiteUrl}`;

      const formDataToSend = new FormData();
      formDataToSend.append('adcopy', enhancedContent);
      formDataToSend.append('imglink', '');
      formDataToSend.append('productname', formData.product);
      formDataToSend.append('product_category', formData.category);
      formDataToSend.append('username', user?.username || '');

      console.log('Making API call to create ad...');
      const response = await fetch('http://localhost:8000/user/ads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || result.detail?.message || 'Failed to save ad');
      }

      if (!result.ad?.id) {
        console.error('Response data structure:', result);
        throw new Error('No ad ID received from server');
      }

      // Store ad data including the ID in localStorage
      const dataToStore = {
        adcopy: enhancedContent,
        imglink: '',
        productname: formData.product,
        product_category: formData.category,
        generatedContent: enhancedContent,
        id: result.ad.id 
      };

      console.log('Storing ad data:', dataToStore);
      localStorage.setItem('adData', JSON.stringify(dataToStore));

      // Wait a moment before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate to next step
      await router.push('/createimage');

    } catch (error) {
      console.error('Error in handleApprove:', error);
      setError(error instanceof Error ? error.message : 'Failed to save ad');
    }
  };

  if (!campaignData) {
    return null; // or a loading spinner
  }

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
                Create your ad for campaign: {campaignData?.campaignName}
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

              {/* Progress Navigation */}
              <div className="w-full px-4">
                <div className="flex justify-between space-x-4">
                  <div className="rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit bg-green-500">
                    1. Campaign ✓
                  </div>
                  <div
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit ${
                      pathname === "/contact"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    2. Create Ad
                  </div>
                  <div
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit ${
                      pathname === "/createimage"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    3. Create Image
                  </div>
                  <div
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit ${
                      pathname === "/schedule-publish"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    4. Schedule/Publish
                  </div>
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
                onApprove={handleApprove}
                productData={formData}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;