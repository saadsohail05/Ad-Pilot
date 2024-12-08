import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/marketinsights/index"
import LeftSidebar from "@/components/leftsidebar/leftsidebar"; // Import the LeftSidebar component

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Market Insights | Ad Pilot",
  description: "Comprehensive market analysis and competitor insights"
};

const ContactPage = () => {
  // Define the links for the sidebar
  const sidebarLinks = [
    { label: "View Analytics", href: "/viewanalytics" },
    { label: "Market Insights", href: "/marketinsights" },
    { label: "Chatbot for Queries", href: "/chatbotforqueries" },
    { label: "Manage Campaign", href: "/createcampaign" },
    // Add more links as needed
  ];

  return (
    <div className="flex">
      <LeftSidebar username="User" links={sidebarLinks} /> {/* Add the LeftSidebar */}
      <div className="flex-1">
        <Breadcrumb
          pageName="Market Insights"
          description="Comprehensive market analysis and competitor insights"
        />
        <Contact />
      </div>
    </div>
  );
};

export default ContactPage;
