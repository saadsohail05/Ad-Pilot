"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SchedulePublish from "@/components/schedule-publish/schedule-publish";
import LeftSidebar from "@/components/leftsidebar/leftsidebar";
import LoadingSpinner from "@/components/Common/LoadingSpinner";

const SchedulePublishPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check authentication
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  // Define the links for the sidebar
  const sidebarLinks = [
    { label: "View Analytics", href: "/viewanalytics" },
    { label: "Market Insights", href: "/marketinsights" },
    { label: "Chatbot for Queries", href: "/chatbotforqueries" },
    { label: "Manage Campaign", href: "/createcampaign" },
  ];

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex">
      <LeftSidebar username={user.username} links={sidebarLinks} />
      <div className="flex-1">
        <Breadcrumb
          pageName="Schedule / Publish"
          description="Schedule or immediately publish your ad campaign"
        />
        <SchedulePublish />
      </div>
    </div>
  );
};

export default SchedulePublishPage;
