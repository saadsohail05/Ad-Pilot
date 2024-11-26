"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyEmail, resendVerification } from "../../actions/actions"; // Adjust the import path as necessary
import Head from "next/head";
import { useSearchParams } from 'next/navigation';

const VerificationPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const router = useRouter();

  const [formData, setFormData] = useState({
    verificationCode: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await verifyEmail({
        verification_code: formData.verificationCode,
      });
      
      setSuccess(response.message);
      setError("");
      
      // Redirect to signin page after successful verification
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setResendError("Email address is missing");
      return;
    }
    
    setIsResending(true);
    try {
      const response = await resendVerification(email);
      setResendSuccess(response.message);
      setResendError("");
      
      // Clear success message after 3 seconds
      setTimeout(() => setResendSuccess(""), 3000);
    } catch (err: any) {
      setResendError(err.message);
      setResendSuccess("");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            <div className="w-full px-4">
              <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                 Verify Your Account
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  {email ? `Verify your account for ${email}` : 'Verify your account to access all features'}
                </p>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                {resendError && <p className="text-red-500 text-center mb-4">{resendError}</p>}
                {resendSuccess && <p className="text-green-500 text-center mb-4">{resendSuccess}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <label
                      htmlFor="verificationCode"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="verificationCode"
                      placeholder="Enter your Verification Code"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>
                  <div className="mb-6">
                    <button className="shadow-submit dark:shadow-submit-dark flex w-full items-center justify-center rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
                      Verify
                    </button>
                  </div>
                </form>

                <div className="text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
                  >
                    {isResending ? "Sending..." : "Resend verification code"}
                  </button>
                </div>
             
              </div>
            </div>
          </div>
        </div>
        <div className="absolute left-0 top-0 z-[-1]">
          <svg
            width="1440"
            height="969"
            viewBox="0 0 1440 969"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_95:1005"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="969"
            >
              <rect width="1440" height="969" fill="#090E34" />
            </mask>
            <g mask="url(#mask0_95:1005)">
              <path
                opacity="0.1"
                d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
                fill="url(#paint0_linear_95:1005)"
              />
              <path
                opacity="0.1"
                d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
                fill="url(#paint1_linear_95:1005)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_95:1005"
                x1="1178.4"
                y1="151.853"
                x2="780.959"
                y2="453.581"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_95:1005"
                x1="160.5"
                y1="220"
                x2="1099.45"
                y2="1192.04"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </>
  );
};

export default VerificationPage;
