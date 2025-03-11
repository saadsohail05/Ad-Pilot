'use client';

import { Ad } from "@/types/ad";

interface AdsResponse {
  ads: Ad[];
  total: number;
  page: number;
  total_pages: number;
}

export async function fetchAds(skip: number = 0, limit: number = 6): Promise<AdsResponse> {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:8000/user/ads?skip=${skip}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Fetched data:', data);

    if (!data.ads || !Array.isArray(data.ads)) {
      console.error('Invalid data format:', data);
      return { ads: [], total: 0, page: 1, total_pages: 1 };
    }

    const transformedAds = data.ads.map((ad: any) => ({
      id: ad.id,
      title: ad.productname || 'Untitled',
      paragraph: ad.adcopy || '',
      image: ad.imglink || "/images/blog/blog-01.jpg",
      cover_imglink: ad.cover_imglink || null,
      author: {
        name: ad.username || 'Anonymous',
        image: "/images/blog/author-03.png",
        designation: ad.product_category || 'Uncategorized'
      },
      tags: [ad.product_category || 'Uncategorized'],
      publishDate: new Date().toLocaleDateString(),
      adcopy: ad.adcopy || '',
      productname: ad.productname || '',
      product_category: ad.product_category || '',
      username: ad.username || ''
    }));

    return {
      ads: transformedAds,
      total: data.total || 0,
      page: data.page || 1,
      total_pages: data.total_pages || 1
    };

  } catch (error) {
    console.error('Error fetching ads:', error);
    return { ads: [], total: 0, page: 1, total_pages: 1 };
  }
}
