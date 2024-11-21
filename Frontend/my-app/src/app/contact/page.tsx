import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started | Ad Pilot",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Get Started"
        description="Will use this as main features page"
      />

      <Contact />
    </>
  );
};

export default ContactPage;
