"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePublish() {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    facebook: true,
    instagram: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [action, setAction] = useState<"publish" | "draft" | "schedule" | "none">("none");
  const [times, setTimes] = useState({
    facebook: "10:00",
    instagram: "10:00"
  });
  const [adData, setAdData] = useState<any>(null);
  const [imageData, setImageData] = useState<any>(null);

  useEffect(() => {
    // Load both ad data and image data from localStorage
    const storedAdData = localStorage.getItem('adData');
    const storedImageData = localStorage.getItem('imageData');
    const storedCampaignData = localStorage.getItem('CampaignData');

    if (!storedAdData || !storedImageData) {
      setError('Missing required ad information');
      router.push('/createad');
      return;
    }

    try {
      const parsedAdData = JSON.parse(storedAdData);
      const parsedImageData = JSON.parse(storedImageData);
      const parsedCampaignData = storedCampaignData ? JSON.parse(storedCampaignData) : null;

      // Validate that we have all required data
      if (!parsedAdData.adcopy || !parsedImageData.uploadedImage || !parsedImageData.generatedImage) {
        throw new Error('Missing required ad content or images');
      }

      // If we have campaign data with a website URL, append it to the ad copy
      if (parsedCampaignData?.websiteUrl) {
        parsedAdData.adcopy = `${parsedAdData.adcopy}\n\n${parsedCampaignData.websiteUrl}`;
      }

      setAdData(parsedAdData);
      setImageData(parsedImageData);
    } catch (err) {
      setError('Error loading ad data');
      console.error('Error parsing stored data:', err);
    }
  }, [router]);

  const handlePlatformChange = (platform: string) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleTimeChange = (platform: string, value: string) => {
    setTimes(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleActionClick = (actionType: "publish" | "draft" | "schedule") => {
    setAction(actionType);
  };

  const handleConfirmClick = async () => {
    try {
      if (!adData || !imageData) {
        throw new Error("Missing required ad information");
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Get campaign data to ensure latest website URL is included
      const storedCampaignData = localStorage.getItem('CampaignData');
      let finalAdCopy = adData.adcopy;
      
      // Append website URL if available in campaign data
      if (storedCampaignData) {
        const parsedCampaignData = JSON.parse(storedCampaignData);
        if (parsedCampaignData?.websiteUrl) {
          let websiteUrl = parsedCampaignData.websiteUrl;
          if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            websiteUrl = 'https://' + websiteUrl;
          }
          if (!finalAdCopy.toLowerCase().includes(websiteUrl.toLowerCase())) {
            finalAdCopy = `${finalAdCopy.trim()}\n\n${websiteUrl}`;
          }
        }
      }

      // Prepare the API request with both product and cover images
      const apiRequest = {
        message: finalAdCopy,
        image_urls: [imageData.generatedImage, imageData.uploadedImage],
        ad_id: adData.id
      };

      const selectedPlatformsList = Object.entries(selectedPlatforms)
        .filter(([_, isSelected]) => isSelected)
        .map(([platform]) => platform);

      if (selectedPlatformsList.length === 0) {
        throw new Error("Please select at least one platform");
      }

      if (action === "publish") {
        let messages = [];
        
        for (const platform of selectedPlatformsList) {
          const endpoint = platform === 'facebook' 
            ? "http://localhost:8000/content/facebook-ad/post-now"
            : "http://localhost:8000/content/instagram-ad/post-now";

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              ...apiRequest,
              platform: platform === 'facebook' ? 'facebook' : 'instagram'
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to publish ${platform} post: ${errorData.detail}`);
          }

          messages.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
        }

        setSuccessMessage(`Successfully published to ${messages.length > 1 ? 'both ' : ''}${messages.join(" and ")}!`);
        localStorage.removeItem('adData');
        localStorage.removeItem('imageData');
        setTimeout(() => {
          router.push('/AdCreatives');
        }, 2000);

      } else if (action === "schedule") {
        if (!date) throw new Error("Date is required for scheduling");

        let messages = [];
        
        for (const platform of selectedPlatformsList) {
          const scheduleDate = new Date(date);
          const [hours, minutes] = times[platform].split(":");
          scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const scheduledTime = scheduleDate.toISOString().replace(".000Z", "");
          
          const endpoint = platform === 'facebook'
            ? "http://localhost:8000/content/facebook-ad/schedule"
            : "http://localhost:8000/content/instagram-ad/schedule";

          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              ...apiRequest,
              scheduled_time: scheduledTime,
              platform: platform === 'facebook' ? 'facebook' : 'instagram'
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to schedule ${platform} post: ${errorData.detail}`);
          }

          messages.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
        }

        setSuccessMessage(`Successfully scheduled to ${messages.length > 1 ? 'both ' : ''}${messages.join(" and ")}!`);
        localStorage.removeItem('adData');
        localStorage.removeItem('imageData');
        setTimeout(() => {
          router.push('/AdCreatives');
        }, 2000);
      }

      setAction("none");
      setIsLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  // Show preview of the content
  const renderPreview = () => {
    if (!adData || !imageData) return null;

    return (
      <div className="mt-8 p-4 border rounded-lg bg-white dark:bg-gray-800">
        <h3 className="text-xl font-medium mb-4">Preview</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Ad Copy:</h4>
            <p className="text-gray-600 dark:text-gray-300">{adData.adcopy}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Product Image:</h4>
              <img 
                src={imageData.uploadedImage} 
                alt="Product" 
                className="mt-2 rounded-lg max-h-48 object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium">Cover Image:</h4>
              <img 
                src={imageData.generatedImage} 
                alt="Cover" 
                className="mt-2 rounded-lg max-h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 mb-24 p-8 border rounded-lg shadow-lg bg-transparent">
      <div className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">Schedule Your Post</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {renderPreview()}

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
                      value={times.facebook}
                      onChange={(e) => handleTimeChange("facebook", e.target.value)}
                      className="border rounded p-2"
                      step="60"
                      min="00:00"
                      max="23:59"
                    />
                  </div>
                )}
                {selectedPlatforms.instagram && (
                  <div className="flex items-center space-x-2">
                    <span>Instagram</span>
                    <input
                      type="time"
                      value={times.instagram}
                      onChange={(e) => handleTimeChange("instagram", e.target.value)}
                      className="border rounded p-2"
                      step="60"
                      min="00:00"
                      max="23:59"
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
                disabled={isLoading}
              >
                {action === "publish" ? "Publish" : action === "schedule" ? "Schedule" : "Save as Draft"}
              </button>
              <button
                className="bg-gray-500 text-white p-4 rounded-lg w-full sm:w-auto"
                onClick={() => setAction("none")}
                disabled={isLoading}
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
