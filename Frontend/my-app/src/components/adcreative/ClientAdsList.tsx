'use client';

import { useEffect, useState } from "react";
import { Ad } from "@/types/ad";
import { fetchAds } from "../adcreative/addata";
import SingleBlog from "./singlead";

const ClientAdsList = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    loadAds(currentPage);
  }, [currentPage]);

  const loadAds = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetchAds((page - 1) * itemsPerPage, itemsPerPage);
      setAds(response.ads);
      setTotalPages(response.total_pages);
    } catch (err) {
      console.error('Error loading ads:', err);
      setError('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) return <div>Loading ads...</div>;
  if (error) return <div>Error: {error}</div>;
  if (ads.length === 0) return <div>No ads found</div>;

  return (
    <>
      <div className="-mx-4 flex flex-wrap justify-center">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
          >
            <SingleBlog blog={ad} />
          </div>
        ))}
      </div>
      
      {/* Pagination Controls */}
      <div className="w-full px-4">
        <ul className="flex items-center justify-center pt-8">
          <li className="mx-1">
            <button
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white disabled:cursor-not-allowed"
            >
              Prev
            </button>
          </li>
          
          {[...Array(totalPages)].map((_, idx) => (
            <li key={idx} className="mx-1">
              <button
                onClick={() => handlePageChange(idx + 1)}
                className={`flex h-9 min-w-[36px] items-center justify-center rounded-md ${
                  currentPage === idx + 1
                    ? 'bg-primary text-white'
                    : 'bg-body-color bg-opacity-[15%] text-body-color'
                } px-4 text-sm transition hover:bg-primary hover:bg-opacity-100 hover:text-white`}
              >
                {idx + 1}
              </button>
            </li>
          ))}

          <li className="mx-1">
            <button
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex h-9 min-w-[36px] items-center justify-center rounded-md bg-body-color bg-opacity-[15%] px-4 text-sm text-body-color transition hover:bg-primary hover:bg-opacity-100 hover:text-white disabled:cursor-not-allowed"
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ClientAdsList;