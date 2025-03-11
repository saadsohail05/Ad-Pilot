export interface MetricsData {
    campaign_name: string;
    fb_post_clicks?: number;
    fb_likes?: number;
    fb_reactions?: number;
    fb_shares?: number;
    fb_comments?: number;
    insta_post_clicks?: number;
    insta_likes?: number;
    insta_reactions?: number;
    insta_shares?: number;
    insta_comments?: number;
    total_engagement?: number;
}

export interface AnalyticsSummary {
    total_campaigns: number;
    total_fb_engagement?: number;
    total_insta_engagement?: number;
    best_performing_campaign?: string;
}

export interface PlatformsUsed {
    facebook: boolean;
    instagram: boolean;
}

export interface AnalyticsCharts {
    platform_comparison?: string;
    campaign_performance?: string;
    engagement_distribution?: string;  // Added new chart type
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    charts: AnalyticsCharts;
    metrics: MetricsData[];
    platforms_used: PlatformsUsed;
}