"use client";

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ContentGenerationBoxProps {
  content: string;
  metadata?: {
    product: string;
    product_type: string;
    category: string;
  };
}

const ContentGenerationBox = ({ content, metadata }: ContentGenerationBoxProps) => {
  const processMarkdown = (text: string) => {
    return text
      // Ensure headings have proper spacing and formatting
      .replace(/#{1,6} /g, match => `\n\n${match}`)
      // Ensure lists have proper spacing
      .replace(/^[-*] /gm, '\n* ')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('http://localhost:8000/content/download-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          metadata: metadata || {
            product: 'Report',
            category: 'Analysis',
            product_type: 'Market Report'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      
      // Get filename from content-disposition header if available
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'market_analysis.pdf';
        
      element.download = filename;
      
      // Trigger download
      document.body.appendChild(element);
      element.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(element);

    } catch (error) {
      console.error('Download failed:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl font-semibold text-black dark:text-white">
        Market Analysis Report
      </h3>

      <div className="mb-6 max-h-[70vh] overflow-y-auto px-4">
        <ReactMarkdown 
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
          className="text-base"
          components={{
            h1: ({node, ...props}) => (
              <h1 className="text-lg font-bold mt-4 mb-2 text-black dark:text-white" {...props} />
            ),
            h2: ({node, ...props}) => (
              <h2 className="text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200" {...props} />
            ),
            h3: ({node, ...props}) => (
              <h3 className="text-base font-medium mt-2 mb-1 text-gray-700 dark:text-gray-300" {...props} />
            ),
            p: ({node, ...props}) => (
              <p className="text-sm mb-2 text-gray-600 dark:text-gray-400" {...props} />
            ),
            ul: ({node, ...props}) => (
              <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
            ),
            li: ({node, ...props}) => (
              <li className="text-sm text-gray-600 dark:text-gray-400" {...props} />
            ),
            strong: ({node, ...props}) => (
              <strong className="font-medium text-gray-800 dark:text-gray-200" {...props} />
            ),
          }}
        >
          {processMarkdown(content)}
        </ReactMarkdown>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
        >
          {/* Download Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v12m0 0l3-3m-3 3l-3-3m9 3h-6a9 9 0 01-9-9V4a9 9 0 019-9h6a9 9 0 019 9v6a9 9 0 01-9 9z"
            />
          </svg>
          Download PDF
        </button>
      </div>

      <div>
        <span className="absolute left-2 top-7">
          <svg
            width="57"
            height="65"
            viewBox="0 0 57 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.5"
              d="M0.407629 15.9573L39.1541 64.0714L56.4489 0.160793L0.407629 15.9573Z"
              fill="url(#paint0_linear_1028_600)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_600"
                x1="-18.3187"
                y1="55.1044"
                x2="37.161"
                y2="15.3509"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>

        <span className="absolute right-2 top-[140px]">
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.5"
              d="M10.6763 35.3091C23.3976 41.6367 38.1681 31.7045 37.107 17.536C36.1205 4.3628 21.9407 -3.46901 10.2651 2.71063C-2.92254 9.69061 -2.68321 28.664 10.6763 35.3091Z"
              fill="url(#paint0_linear_1028_602)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_1028_602"
                x1="-0.571054"
                y1="-37.1717"
                x2="28.7937"
                y2="26.7564"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" stopOpacity="0.62" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ContentGenerationBox;
