"use client"; // Marks this file as a client component

import Link from "next/link";
import { usePathname } from "next/navigation";

const Contact = () => {
  const pathname = usePathname();

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
                Enter campaign details below and submit.
              </p>

              {/* Form Input Fields */}
              <form>
                <div className="-mx-4 flex flex-wrap">
                  {/* Campaign Name */}
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

                  {/* Objective */}
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="objective"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Objective
                      </label>
                      <input
                        type="text"
                        id="objective"
                        name="objective"
                        placeholder="Enter campaign objective"
                        className="border-stroke w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark dark:shadow-two dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="w-full px-4">
                    <div className="mb-6">
                      <label
                        htmlFor="budget"
                        className="mb-3 block text-sm font-medium text-dark dark:text-white"
                      >
                        Budget
                      </label>
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        placeholder="Enter campaign budget"
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
                      Submit
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
