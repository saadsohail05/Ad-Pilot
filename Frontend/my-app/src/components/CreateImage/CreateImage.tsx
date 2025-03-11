"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/actions/actions";

interface ImagePromptResponse {
  prompt: string;
}

interface GenerateImageResponse {
  prompt: string;
  image_url: string;
}

const CreateImage = () => {
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { accessToken } = useAuth(); // Changed from token to accessToken
  const [previousData, setPreviousData] = useState({
    campaign: null,
    ad: null
  });
  const [imageData, setImageData] = useState({
    uploadedImage: null as string | null,
    generatedImage: null as string | null,
    uploadedImageApproved: false,
    generatedImageApproved: false
  });
  const [actionsCompleted, setActionsCompleted] = useState({
    uploaded: false,
    generated: false
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    // Get saved data with error logging
    try {
      const adData = localStorage.getItem('adData');
      console.log('Retrieved adData:', adData);
      
      if (!adData) {
        console.error('No adData found in localStorage');
        router.push('/createad');
        return;
      }

      const parsedAdData = JSON.parse(adData);
      console.log('Parsed adData:', parsedAdData);

      if (!parsedAdData || !parsedAdData.adcopy) {
        console.error('Invalid or missing ad content in saved data');
        router.push('/createad');
        return;
      }

      const campaignData = localStorage.getItem('campaignData');
      const parsedCampaignData = campaignData ? JSON.parse(campaignData) : null;
      
      setPreviousData({
        campaign: parsedCampaignData,
        ad: parsedAdData
      });

      // Check for existing image data
      const savedImageData = localStorage.getItem('imageData');
      if (savedImageData) {
        const parsedImageData = JSON.parse(savedImageData);
        if (parsedImageData.adId === parsedAdData.id) {
          setImageData({
            uploadedImage: parsedImageData.uploadedImage || null,
            generatedImage: parsedImageData.generatedImage || null,
            uploadedImageApproved: false,
            generatedImageApproved: false
          });
          setActionsCompleted({
            uploaded: !!parsedImageData.uploadedImage,
            generated: !!parsedImageData.generatedImage
          });
          if (parsedImageData.prompt) {
            setGeneratedPrompt(parsedImageData.prompt);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      router.push('/createad');
    }
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken || !previousData.ad?.id) {
      const missingRequirements = {
        file: !file,
        accessToken: !accessToken,
        adId: !previousData.ad?.id
      };
      console.error('Missing upload requirements:', missingRequirements);
      
      // Provide specific feedback about what's missing
      if (!file) {
        alert('Please select a file to upload');
        return;
      }
      if (!accessToken) {
        alert('You need to be logged in to upload images');
        return;
      }
      if (!previousData.ad?.id) {
        alert('Missing ad information. Please create an ad first');
        router.push('/createad');
        return;
      }
      return;
    }

    try {
      console.log('Starting upload for ad ID:', previousData.ad.id);
      
      // Upload to backend first
      const result = await uploadImage(file, previousData.ad.id, accessToken);
      console.log('Upload successful:', result);
      
      // Use the Cloudinary URL from the backend response
      setImageData(prev => ({
        ...prev,
        uploadedImage: result.url
      }));
      
      setActionsCompleted(prev => ({
        ...prev,
        uploaded: true
      }));

      // Store only the Cloudinary URL
      localStorage.setItem('imageData', JSON.stringify({
        ...JSON.parse(localStorage.getItem('imageData') || '{}'),
        uploadedImage: result.url,
        type: 'uploaded',
        adId: previousData.ad.id
      }));

    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.message || 'Error uploading image. Please try again.');
      setImageData(prev => ({
        ...prev,
        uploadedImage: null
      }));
      setActionsCompleted(prev => ({
        ...prev,
        uploaded: false
      }));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateImage = async () => {
    if (!previousData.ad?.adcopy) {
      console.error('No ad content found:', previousData.ad);
      alert('No ad content found. Please create an ad first.');
      router.push('/createad');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch('http://localhost:8000/content/generate-combined-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ad_content: previousData.ad.adcopy,
          style: "digital art",
          mood: "professional"
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      // Upload as cover image first to get Cloudinary URL
      const imageResponse = await fetch(`http://localhost:8000${data.image_url}`);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'generated_cover.png', { type: 'image/png' });
      
      // Create form data
      const formData = new FormData();
      formData.append('file', imageFile);

      // Upload to get Cloudinary URL
      const uploadResponse = await fetch(`http://localhost:8000/user/upload-cover-image/${previousData.ad.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to set generated image as cover image');
      }

      const uploadResult = await uploadResponse.json();
      const cloudinaryUrl = uploadResult.data.url;
      
      setImageData(prev => ({
        ...prev,
        generatedImage: cloudinaryUrl
      }));
      setActionsCompleted(prev => ({
        ...prev,
        generated: true
      }));
      setGeneratedPrompt(data.prompt);
      
      // Store the Cloudinary URL for the generated image
      localStorage.setItem('imageData', JSON.stringify({
        ...JSON.parse(localStorage.getItem('imageData') || '{}'),
        generatedImage: cloudinaryUrl,
        type: 'generated',
        adId: previousData.ad.id
      }));

    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleRetryGeneration = () => {
    setImageData(prev => ({
      ...prev,
      generatedImage: null
    }));
    setActionsCompleted(prev => ({
      ...prev,
      generated: false
    }));
    handleGenerateImage();
  };

  const handleApproveProductImage = () => {
    setImageData(prev => ({
      ...prev,
      uploadedImageApproved: true
    }));
  };

  const handleApproveCoverImage = () => {
    setImageData(prev => ({
      ...prev,
      generatedImageApproved: true
    }));
  };

  const handleContinueToSchedule = () => {
    if (!imageData.uploadedImage || !imageData.generatedImage) {
      alert('Please both upload a product image and generate a cover image before proceeding');
      return;
    }

    if (!imageData.uploadedImageApproved || !imageData.generatedImageApproved) {
      alert('Please approve both the product image and cover image before proceeding');
      return;
    }

    // Update local storage with final image data - keep both URLs separate
    localStorage.setItem('imageData', JSON.stringify({
      uploadedImage: imageData.uploadedImage,
      generatedImage: imageData.generatedImage,
      type: 'both',
      adId: previousData.ad.id,
      isApproved: true
    }));
    
    // Proceed to next step
    router.push('/schedule-publish');
  };

  const generateImagePrompt = async () => {
    if (!previousData.ad?.content) {
      alert('No ad content found. Please create an ad first.');
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const response = await fetch('http://localhost:8000/content/generate-image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ad_content: previousData.ad.content,
          style: "digital art",
          mood: "professional"
        })
      });

      if (!response.ok) throw new Error('Failed to generate image prompt');
      
      const data: ImagePromptResponse = await response.json();
      setGeneratedPrompt(data.prompt);
    } catch (error) {
      console.error('Error generating image prompt:', error);
      alert('Failed to generate image prompt. Please try again.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const proceedToNextStep = () => {
    if (actionsCompleted.uploaded && actionsCompleted.generated) {
      router.push('/schedule-publish');
    }
  };

  if (!previousData.campaign || !previousData.ad) {
    return null;
  }

  return (
    <section className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
            <div
              className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
              data-wow-delay=".15s"
            >
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Ad Images
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Create images for your ad in {previousData.campaign?.campaignName}
              </p>

              {/* Add Prompt Generation Section */}


              <div className="flex flex-col space-y-4 mb-8">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold mb-2">Product Images</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload product-specific images to showcase your products in detail
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={handleUploadClick}
                    className="flex items-center justify-center rounded-sm bg-blue-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-blue-600"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Product Images
                  </button>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Cover Image</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generate an AI-powered cover image that captures your ad's message
                  </p>
                  <button
                    onClick={handleGenerateImage}
                    className="flex items-center justify-center rounded-sm bg-green-500 px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-green-600"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Generate Cover Image
                  </button>
                </div>
              </div>

              {/* Progress Navigation */}
              <div className="w-full px-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between space-x-4">
                    <div
                      className="rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit bg-green-500 opacity-70 cursor-not-allowed"
                    >
                      1. Campaign ✓
                    </div>
                    <div
                      className="rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit bg-green-500 opacity-70 cursor-not-allowed"
                    >
                      2. Ad ✓
                    </div>
                    <div
                      className="rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit bg-blue-500"
                    >
                      3. Images
                    </div>
                    <div
                      className="rounded-sm px-6 py-3 text-base font-medium text-white shadow-submit bg-gray-500"
                    >
                      4. Schedule
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleContinueToSchedule}
                      disabled={!imageData.uploadedImage || !imageData.generatedImage || !imageData.uploadedImageApproved || !imageData.generatedImageApproved}
                      className={`rounded-sm px-8 py-3 text-base font-medium text-white shadow-submit ${
                        imageData.uploadedImage && imageData.generatedImage && imageData.uploadedImageApproved && imageData.generatedImageApproved
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {!imageData.uploadedImage && !imageData.generatedImage 
                        ? "Upload and Generate Images to Continue"
                        : !imageData.uploadedImage 
                        ? "Upload Product Image to Continue"
                        : !imageData.generatedImage
                        ? "Generate Cover Image to Continue"
                        : !imageData.uploadedImageApproved || !imageData.generatedImageApproved
                        ? "Approve Both Images to Continue"
                        : "Continue to Schedule →"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
            <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
              <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
                Image Preview
              </h3>

              {/* Loading State */}
              {isGeneratingImage && (
                <div className="mb-6 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Generating your cover image...</p>
                </div>
              )}

              {/* Generated/Uploaded Image Preview */}
              {!isGeneratingImage && (imageData.generatedImage || imageData.uploadedImage) && (
                <div className="mb-6">
                  <div className="relative w-full aspect-video mb-4">
                    <img
                      src={imageData.generatedImage || imageData.uploadedImage}
                      alt={imageData.generatedImage ? "Cover Image Preview" : "Product Image Preview"}
                      className="rounded-lg shadow-md w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {imageData.generatedImage ? "Generated Cover Image" : "Uploaded Product Image"}
                  </p>
                  {generatedPrompt && imageData.generatedImage && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Generated using:</span><br/>
                        {generatedPrompt}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={imageData.generatedImage ? handleRetryGeneration : handleUploadClick}
                      className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {imageData.generatedImage ? "Generate New Cover" : "Upload New Product Image"}
                    </button>
                    <button
                      onClick={imageData.generatedImage ? handleApproveCoverImage : handleApproveProductImage}
                      disabled={imageData.generatedImage ? imageData.generatedImageApproved : imageData.uploadedImageApproved}
                      className={`px-4 py-2 text-sm ${
                        imageData.generatedImage 
                          ? imageData.generatedImageApproved 
                            ? "bg-green-700 cursor-not-allowed" 
                            : "bg-green-500 hover:bg-green-600"
                          : imageData.uploadedImageApproved
                            ? "bg-green-700 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                      } text-white rounded-md flex items-center`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {imageData.generatedImage
                        ? imageData.generatedImageApproved ? "Cover Image Approved" : "Approve Cover Image"
                        : imageData.uploadedImageApproved ? "Product Image Approved" : "Approve Product Image"
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!isGeneratingImage && !imageData.generatedImage && !imageData.uploadedImage && (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-600 dark:text-blue-400 mb-2">No images yet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upload product images or generate a cover image for your ad
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateImage;
