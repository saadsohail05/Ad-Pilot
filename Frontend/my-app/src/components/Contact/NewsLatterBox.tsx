"use client";

import { useTheme } from "next-themes";

interface NewsLatterBoxProps {
  content: string;
  onRetry: () => void;
  onApprove: (content: string) => void;
  productData: any;
}

const NewsLatterBox = ({ content, onRetry, onApprove, productData }: NewsLatterBoxProps) => {
  const { theme } = useTheme();
  
  const handleApproveClick = (content: string) => {
    console.log('Approve button clicked');
    try {
      onApprove(content);
    } catch (error) {
      console.error('Error in handleApproveClick:', error);
    }
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl font-bold text-black dark:text-white">
        Generated Advertisement
      </h3>
      <p className="mb-6 text-base font-medium text-body-color">
        Review the generated advertisement for {productData?.product}
      </p>
      <div className="border rounded-lg p-4 mb-6 bg-gray-50 dark:bg-gray-800">
        <p className="text-body-color whitespace-pre-wrap">{content}</p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => handleApproveClick(content)}
          className="flex items-center justify-center rounded-md bg-green-500 px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-green-600 dark:shadow-submit-dark"
        >
          Approve & Continue
        </button>
        <button
          onClick={onRetry}
          className="flex items-center justify-center rounded-md bg-gray-500 px-9 py-4 text-base font-medium text-white shadow-submit duration-300 hover:bg-gray-600 dark:shadow-submit-dark"
        >
          Generate Another
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
                <stop
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0.62"
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
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
                <stop
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0.62"
                />
                <stop
                  offset="1"
                  stopColor={theme === "light" ? "#4A6CF7" : "#fff"}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </div>
    </div>
  );
};

export default NewsLatterBox;