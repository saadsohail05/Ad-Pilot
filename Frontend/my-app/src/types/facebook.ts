export interface FacebookAdRequest {
  message: string;
  image_urls: string[];
  scheduled_time?: string;
  adId: number; // Add this field for existing ad ID
}

export interface FacebookAdResponse {
  success: boolean;
  post_id: string;
  campaign_id: string;
  adset_id: string;
  creative_id: string;
  ad_id: string;
  post_link: string;
  scheduled_time?: string;
}

export interface InstagramAdRequest {
  message: string;
  image_urls: string[];
  scheduled_time?: string;
  adId: number;
}

export interface InstagramAdResponse {
  success: boolean;
  post_id: string;
  campaign_id: string;
  adset_id: string;
  creative_id: string;
  ad_id: string;
  post_link: string;
  scheduled_time?: string;
}

export interface AdScheduleData {
  publishDate: string;
  publishTime: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  status: 'scheduled' | 'publish' | 'draft';
}

export interface CampaignData {
  campaignName: string;
  campaignObjective: string;
  targetAudience: string;
  budget: number;
  [key: string]: any;
}

export interface AdData {
  adCopy: string;
  targetKeywords: string[];
  callToAction: string;
  [key: string]: any;
}

export interface ImageData {
  imageUrl: string;
  imagePrompt?: string;
  generatedAlt?: string;
  [key: string]: any;
}