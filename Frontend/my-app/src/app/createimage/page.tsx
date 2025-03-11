'use client';

import React, { useEffect } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/CreateImage/CreateImage";
import LeftSidebar from "@/components/leftsidebar/leftsidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const ContactPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sidebarLinks = [
    { label: "View Analytics", href: "/viewanalytics" },
    { label: "Market Insights", href: "/marketinsights" },
    { label: "Chatbot for Queries", href: "/chatbotforqueries" },
    { label: "Manage Campaign", href: "/createcampaign" },
  ];

  return (
    <div className="flex">
      <LeftSidebar username={user.username || "User"} links={sidebarLinks} />
      <div className="flex-1">
        <Breadcrumb
          pageName="Image Creation"
          description=""
        />
        <Contact />
      </div>
    </div>
  );
};

export default ContactPage;
