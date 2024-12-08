"use client";

import { useTheme } from "next-themes";

interface ContentGenerationBoxProps {
  content: string;
  onRetry?: () => void;
  onApprove?: () => void;
}

const ContentGenerationBox = ({
  content,
  onRetry,
  onApprove,
}: ContentGenerationBoxProps) => {
  const { theme } = useTheme();

  return (
    <div className="relative z-10 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-dark sm:p-11 lg:p-8 xl:p-11">
      <h3 className="mb-4 text-2xl font-semibold text-black dark:text-white">
        Generated Content
      </h3>

      <div className="mb-6 border-b border-body-color border-opacity-25 pb-6 text-base leading-relaxed text-body-color dark:border-white dark:border-opacity-25">
        {content}
      </div>

      {/* Demo Image */}
      <div className="mb-6">
        <img
          src="https://aitificial.blog/wp-content/uploads/2024/02/ai-image-generators.jpg"
          alt="Generated Demo"
          className="w-full h-auto rounded-lg shadow-lg"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onApprove}
          className="flex items-center gap-2 px-5 py-2 mr-10 rounded-md bg-green-500 hover:bg-green-600 text-white"
        >
          {/* Modern Approve Icon */}
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
              d="M5 13l4 4L19 7"
            />
          </svg>
          Approve
        </button>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
        >
          {/* Modern Retry Icon */}
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
              d="M12 2v4m0 0l2-2m-2 2l-2-2M12 16v4m0 0l-2-2m2 2l2-2M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z"
            />
          </svg>
          Retry
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

export default ContentGenerationBox;
