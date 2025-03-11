"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { fetchAnalytics } from "@/actions/actions";
import { AnalyticsData } from "@/types/analytics";

const AnalyticsComponent = () => {
  const pathname = usePathname();
  const { user, accessToken } = useAuth();
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalyticsData() {
      if (!user || !accessToken) {
        setError("You need to be logged in to view analytics");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchAnalytics(user.id, accessToken);
        setAnalyticsData(data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics data");
        setIsLoading(false);
      }
    }

    loadAnalyticsData();
  }, [user, accessToken]);

  if (isLoading) {
    return (
      <section className="overflow-hidden py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !analyticsData) {
    return (
      <section className="overflow-hidden py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-red-500 mb-4">{error || "No analytics data available"}</p>
            <Link href="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className="overflow-hidden py-16 md:py-20 lg:py-28">
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

              {/* Engagement Distribution Chart */}
              {analyticsData?.charts.engagement_distribution && (
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                    Platform Engagement Distribution
                  </h3>
                  <div className="flex justify-center">
                    <img 
                      src={`data:image/png;base64,${analyticsData.charts.engagement_distribution}`}
                      alt="Engagement distribution chart"
                      className="w-full max-w-[500px] rounded-sm"
                    />
                  </div>
                </div>
              )}

              {/* Performance Charts */}
              {analyticsData.charts.campaign_performance && (
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                    Campaign Performance
                  </h3>
                  <img 
                    src={`data:image/png;base64,${analyticsData.charts.campaign_performance}`}
                    alt="Campaign performance chart"
                    className="w-full rounded-sm"
                  />
                </div>
              )}
              
              {/* Platform Comparison Charts */}
              {analyticsData.charts.platform_comparison && (
                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                    Platform Comparison
                  </h3>
                  <img 
                    src={`data:image/png;base64,${analyticsData.charts.platform_comparison}`}
                    alt="Platform comparison chart"
                    className="w-full rounded-sm"
                  />
                </div>
              )}

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
                        Total Campaigns
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                        {analyticsData.summary.total_campaigns}
                      </td>
                    </tr>
                    
                    {analyticsData.platforms_used.facebook && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                          Facebook Engagement
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                          {analyticsData.summary.total_fb_engagement}
                        </td>
                      </tr>
                    )}
                    
                    {analyticsData.platforms_used.instagram && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                          Instagram Engagement
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                          {analyticsData.summary.total_insta_engagement}
                        </td>
                      </tr>
                    )}
                    
                    {analyticsData.summary.best_performing_campaign && (
                      <tr>
                        <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                          Best Performing Campaign
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                          {analyticsData.summary.best_performing_campaign}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Metrics Details Table */}
              {analyticsData.metrics.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4 text-xl font-bold text-black dark:text-white">
                    Campaign Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                          <th className="border border-gray-300 px-4 py-2 text-left dark:border-gray-600">
                            Campaign
                          </th>
                          {analyticsData.platforms_used.facebook && (
                            <>
                              <th className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                FB Clicks
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                FB Interactions
                              </th>
                            </>
                          )}
                          {analyticsData.platforms_used.instagram && (
                            <>
                              <th className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                IG Clicks
                              </th>
                              <th className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                IG Interactions
                              </th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.metrics.map((metric, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                              {metric.campaign_name}
                            </td>
                            {analyticsData.platforms_used.facebook && (
                              <>
                                <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                  {metric.fb_post_clicks || 0}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                  {(metric.fb_likes || 0) + 
                                   (metric.fb_reactions || 0) + 
                                   (metric.fb_comments || 0) + 
                                   (metric.fb_shares || 0)}
                                </td>
                              </>
                            )}
                            {analyticsData.platforms_used.instagram && (
                              <>
                                <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                  {metric.insta_post_clicks || 0}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-right dark:border-gray-600">
                                  {(metric.insta_likes || 0) + 
                                   (metric.insta_reactions || 0) + 
                                   (metric.insta_comments || 0) + 
                                   (metric.insta_shares || 0)}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Metrics Message */}
              {analyticsData.metrics.length === 0 && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-sm">
                  <p className="text-center text-body-color">
                    No campaign metrics data available yet. Start a campaign to see analytics.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <div className="wow fadeInUp rounded-sm bg-white px-8 py-10 shadow-three dark:bg-gray-dark sm:px-10 sm:py-12 lg:px-6 lg:py-10 xl:px-10 xl:py-12">
              <h3 className="mb-8 text-2xl font-bold text-black dark:text-white">
                Performance Tips
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center text-base text-body-color">
                  <span className="mr-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-white">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="fill-current">
                      <path d="M9.70711 0.292893C10.0976 0.683418 10.0976 1.31658 9.70711 1.70711L4.70711 6.70711C4.31658 7.09763 3.68342 7.09763 3.29289 6.70711L0.292893 3.70711C-0.0976311 3.31658 -0.0976311 2.68342 0.292893 2.29289C0.683418 1.90237 1.31658 1.90237 1.70711 2.29289L4 4.58579L8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893Z"></path>
                    </svg>
                  </span>
                  Track engagement metrics regularly
                </li>
                <li className="flex items-center text-base text-body-color">
                  <span className="mr-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-white">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="fill-current">
                      <path d="M9.70711 0.292893C10.0976 0.683418 10.0976 1.31658 9.70711 1.70711L4.70711 6.70711C4.31658 7.09763 3.68342 7.09763 3.29289 6.70711L0.292893 3.70711C-0.0976311 3.31658 -0.0976311 2.68342 0.292893 2.29289C0.683418 1.90237 1.31658 1.90237 1.70711 2.29289L4 4.58579L8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893Z"></path>
                    </svg>
                  </span>
                  Compare performance across platforms
                </li>
                <li className="flex items-center text-base text-body-color">
                  <span className="mr-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-white">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="fill-current">
                      <path d="M9.70711 0.292893C10.0976 0.683418 10.0976 1.31658 9.70711 1.70711L4.70711 6.70711C4.31658 7.09763 3.68342 7.09763 3.29289 6.70711L0.292893 3.70711C-0.0976311 3.31658 -0.0976311 2.68342 0.292893 2.29289C0.683418 1.90237 1.31658 1.90237 1.70711 2.29289L4 4.58579L8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893Z"></path>
                    </svg>
                  </span>
                  Optimize for best performing content
                </li>
                <li className="flex items-center text-base text-body-color">
                  <span className="mr-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-white">
                    <svg width="10" height="8" viewBox="0 0 10 8" className="fill-current">
                      <path d="M9.70711 0.292893C10.0976 0.683418 10.0976 1.31658 9.70711 1.70711L4.70711 6.70711C4.31658 7.09763 3.68342 7.09763 3.29289 6.70711L0.292893 3.70711C-0.0976311 3.31658 -0.0976311 2.68342 0.292893 2.29289C0.683418 1.90237 1.31658 1.90237 1.70711 2.29289L4 4.58579L8.29289 0.292893C8.68342 -0.0976311 9.31658 -0.0976311 9.70711 0.292893Z"></path>
                    </svg>
                  </span>
                  A/B test campaign variations
                </li>
              </ul>

              <div className="mt-10">
                <Link 
                  href="/createcampaign" 
                  className="inline-flex items-center justify-center rounded-sm bg-primary px-10 py-4 text-center text-base font-medium text-white hover:bg-opacity-90"
                >
                  Create New Campaign
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsComponent;