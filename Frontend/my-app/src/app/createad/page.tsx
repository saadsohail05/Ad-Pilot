'use client';
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import LeftSidebar from "@/components/leftsidebar/leftsidebar";

const ContactPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  // Define the links for the sidebar
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
          pageName="Ad Creation"
          description=""
        />
        <Contact />
      </div>
    </div>
  );
};

export default ContactPage;