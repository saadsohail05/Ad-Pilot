import React from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/CreateImage/CreateImage";
import LeftSidebar from "@/components/leftsidebar/leftsidebar"; // Import the LeftSidebar component

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Image | Ad Pilot",
  // other metadata
};

const ContactPage = () => {
  // Define the links for the sidebar
  const sidebarLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
    // Add more links as needed
  ];

  return (
    <div className="flex">
      <LeftSidebar username="User" links={sidebarLinks} /> {/* Add the LeftSidebar */}
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
