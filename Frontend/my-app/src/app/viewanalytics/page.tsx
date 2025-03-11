"use client";

import AnalyticsComponent from "@/components/viewanalytics/viewanalytics";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ViewAnalyticsPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
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

  return (
    <>
      <Breadcrumb
        pageName="Analytics Dashboard"
        description="View your campaign performance analytics"
      />
      <AnalyticsComponent />
    </>
  );
};

export default ViewAnalyticsPage;
