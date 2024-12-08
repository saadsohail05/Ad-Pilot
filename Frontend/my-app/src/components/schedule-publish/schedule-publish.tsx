"use client";

import { useState } from "react";

export default function SchedulePublish() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    facebook: true,
    instagram: true,
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [action, setAction] = useState<"publish" | "draft" | "schedule" | "none">("none");

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleActionClick = (actionType: "publish" | "draft" | "schedule") => {
    setAction(actionType);
  };

  const handleConfirmClick = () => {
    // For now, simply log confirmation; You can add further logic here
   
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 mb-24 p-8 border rounded-lg shadow-lg bg-transparent">
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">Schedule Your Post</h2>

        {action === "none" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium">Select Platforms</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.facebook}
                    onChange={() => handlePlatformChange("facebook")}
                    className="mr-2"
                  />
                  <span>Facebook</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.instagram}
                    onChange={() => handlePlatformChange("instagram")}
                    className="mr-2"
                  />
                  <span>Instagram</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium">Select Time</h3>
              <div className="space-y-4">
                {selectedPlatforms.facebook && (
                  <div className="flex items-center space-x-2">
                    <span>Facebook</span>
                    <input
                      type="time"
                      defaultValue="10:00"
                      className="border rounded p-2"
                    />
                  </div>
                )}
                {selectedPlatforms.instagram && (
                  <div className="flex items-center space-x-2">
                    <span>Instagram</span>
                    <input
                      type="time"
                      defaultValue="10:00"
                      className="border rounded p-2"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium">Schedule Date</h3>
              <input
                type="date"
                value={date?.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="border rounded p-2 w-full"
              />
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                className="bg-blue-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={() => handleActionClick("publish")}
              >
                Publish Now
              </button>
              <button
                className="bg-gray-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={() => handleActionClick("schedule")}
              >
                Schedule
              </button>
              <button
                className="bg-gray-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={() => handleActionClick("draft")}
              >
                Save as Draft
              </button>
            </div>
          </div>
        )}

        {action !== "none" && (
          <div className="space-y-6">
            <p className="text-lg text-center">
              Are you sure you want to {action} now?
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                className="bg-red-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={handleConfirmClick}
              >
                {action === "publish" ? "Publish" : action === "schedule" ? "Schedule" : "Save as Draft"}
              </button>
              <button
                className="bg-gray-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={() => setAction("none")}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
