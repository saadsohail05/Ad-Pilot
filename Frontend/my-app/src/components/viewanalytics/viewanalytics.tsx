"use client"; // Marks this file as a client component

import Link from "next/link";
import { usePathname } from "next/navigation";

const Contact = () => {
  const pathname = usePathname();

  return (
    <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          {/* Left Content */}
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Campaign Dashboard
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Visualize and track your campaign performance below.
              </p>

              {/* Graph Image */}
              <div className="mb-8">
                <img
                  src="https://attributer.io/wp-content/uploads/2022/07/Leads-by-Google-Ads-Campaign.png" // Replace with the actual image path
                  alt="Graphs showing campaign performance"
                  className="w-full rounded-sm"
                />
              </div>

              {/* Campaign Stats Table */}
              <div className="mb-6">
                <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                  Campaign Statistics
                </h3>
                <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-300 px-4 py-2 text-left dark:border-gray-600">
                        Metric
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Active Campaigns
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        15
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Active Ads
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        45
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Inactive Campaigns
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        5
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Inactive Ads
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        10
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Total Campaigns
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        20
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Total Ads
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        55
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Budget Spent
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        $12,000
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                        Budget Allotted
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        $20,000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Page Navigation Buttons */}
              <div className="w-full px-4">
                              </div>
            </div>
          </div>            
        </div>
      </div>
    </section>
  );
};

export default Contact;