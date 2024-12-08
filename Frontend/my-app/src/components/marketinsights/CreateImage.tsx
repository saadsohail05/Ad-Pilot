"use client"; // Marks this file as a client component

import { useState } from "react"; // Import useState for managing state
import Link from "next/link";
import { usePathname } from "next/navigation";
import NewsLatterBox from "./GenerateImage"; // Assuming NewsLatterBox is your GenerateImage component

const Contact = () => {
  const pathname = usePathname();
  const [imageGenerated, setImageGenerated] = useState(false); // State for image generation

  // Handle click for generating image
  const handleGenerateImage = () => {
    setImageGenerated(true); // Update state to show generated image component
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
                Create Campaign
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Enter product details below and submit.
              </p>

              {/* Form Input Fields */}
              <form>
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

                  {/* Image Upload and Generate Image Buttons */}
                  <div className="w-full px-4 mb-6 flex space-x-4">
                    <button
                      type="button"
                      className="flex items-center justify-center rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark"
                    >
                      <svg
                        className="mr-2 h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2 12l1.5-1.5 4 4L9 10l5 5 6-6"
                        />
                      </svg>
                      Upload Image
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateImage} // Handle image generation
                      className="rounded-sm bg-green-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-green-600 dark:shadow-submit-dark"
                    >
                      Generate Image
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full px-4 mb-6">
                    <button
                      type="submit"
                      className="rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600 dark:shadow-submit-dark"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </form>

              {/* Page Navigation Buttons */}
              <div className="w-full px-4">
                <div className="flex justify-between space-x-4">
                  <Link
                    href="/contact"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/create-campaign"
                        ? "bg-blue-500"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    Create Campaign
                  </Link>
                  <Link
                    href="/create-ad"
                    className={`rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit duration-300 ${
                      pathname === "/create-ad"
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
            {/* Conditionally render NewsLatterBox */}
            {imageGenerated && <NewsLatterBox content="Generated image" />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
