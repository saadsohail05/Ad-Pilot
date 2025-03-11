"use client"; // Marks this file as a client component

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

const Contact = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [campaignData, setCampaignData] = useState({
    campaignName: "",
    websiteUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // Here you would typically make an API call to save the campaign data
      // For now, we'll just simulate success and navigate
      
      // Store campaign data in localStorage for later use
      localStorage.setItem('campaignData', JSON.stringify(campaignData));
      
      // Navigate to the next step
      router.push('/createad');
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          {/* Main Form Section - Left Side */}
          <div className="w-full px-4 lg:w-7/12">
            <div className="rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]" data-wow-delay=".15s">
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Create Campaign
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Enter campaign details below and submit.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="-mx-4 flex flex-wrap">
                  {/* Campaign Name */}
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label htmlFor="campaignName" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        id="campaignName"
                        name="campaignName"
                        value={campaignData.campaignName}
                        onChange={handleInputChange}
                        placeholder="Enter campaign name"
                        required
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  {/* Website URL */}
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label htmlFor="websiteUrl" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                        Product Website URL (Optional)
                      </label>
                      <input
                        type="url"
                        id="websiteUrl"
                        name="websiteUrl"
                        value={campaignData.websiteUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full px-4 mb-6">
                    <button
                      type="submit"
                      className="rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark"
                    >
                      Create Campaign & Continue
                    </button>
                  </div>
                </div>
              </form>

              {/* Progress Navigation */}
              <div className="mt-8 w-full">
                <div className="flex justify-between space-x-4">
                  <div
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit ${
                      pathname === "/createcampaign"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                    }`}
                  >
                    1. Create Campaign
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

          {/* Right Side - Steps and Package Info */}
          <div className="w-full px-4 lg:w-5/12">
            {/* Steps Guide */}
            <div className="mb-8 rounded-sm bg-white p-6 shadow-three dark:bg-gray-dark">
              <h3 className="mb-4 text-xl font-bold text-black dark:text-white">Steps to Complete Your Campaign</h3>
              <ol className="list-decimal pl-6 text-body-color dark:text-body-color-dark">
                <li className="mb-2">Create your campaign by entering a name</li>
                <li className="mb-2">Design your ad creative in the next step</li>
                <li className="mb-2">Generate AI-powered images for your ad</li>
                <li className="mb-2">Schedule or publish your campaign</li>
              </ol>
            </div>

            {/* Package Info */}
            <div className="rounded-sm bg-blue-50 p-6 shadow-three dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-bold text-black dark:text-white">Selected Package</h3>
              <div className="text-body-color dark:text-body-color-dark">
                <p className="mb-2">Trial Package</p>
                <ul className="list-disc pl-6">
                  <li>1 Campaign</li>
                  <li>3 AI-Generated Images</li>
                  <li>Basic Analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
