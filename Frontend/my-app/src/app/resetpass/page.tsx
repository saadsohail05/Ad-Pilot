"use client"
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { requestPasswordReset, verifyEmail } from "../actions/actions";


const ResetPasswordPage = () => {
  const router = useRouter();

  useEffect(() => {
    document.title = "Reset Password | Ad Pilot";
  }, []);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);

  const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    verificationCode: z.string()
      .min(8, "Verification code must be 8 characters")
      .max(8, "Verification code must be 8 characters")
      .regex(/^\d+$/, "Verification code must contain only numbers")
  });

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm({
    resolver: zodResolver(schema)
  });

  const handleSendCode = async () => {
    // Trigger email field validation
    const isEmailValid = await trigger("email");
    if (!isEmailValid) {
      return;
    }

    const email = getValues("email");
    try {
      const result = await requestPasswordReset(email);
      setIsCodeSent(true);
      setSuccess(result.message);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  const handleSubmitForm = async (data: any) => {
    try {
      const email = getValues("email");
      const result = await verifyEmail({ 
        verification_code: data.verificationCode 
      });
      if (result.message) {
        router.push(`/forgotpassword?email=${encodeURIComponent(email)}&code=${data.verificationCode}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Reset Your Password
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                Enter your email to receive a verification code
              </p>
              {error && <p className="text-red-500 text-center">{error}</p>}
              {success && <p className="text-green-500 text-center">{success}</p>}
              <form onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="mb-8">
                  <label
                    htmlFor="email"
                    className="mb-3 block text-sm text-dark dark:text-white"
                  >
                    Your Email
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="Enter your email"
                    className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                  />
                  {errors.email && <p className="text-red-500">{String(errors.email.message)}</p>}
                </div>
                <div className="mb-8">
                  <div className="flex items-center gap-4">
                    <div className="flex-grow">
                      <label
                        htmlFor="verificationCode"
                        className="mb-3 block text-sm text-dark dark:text-white"
                      >
                        Verification Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        {...register("verificationCode")}
                        placeholder="Enter 8-digit code"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendCode}
                      className="mt-8 px-4 py-3 text-sm font-medium text-white bg-primary rounded-sm hover:bg-primary/90"
                    >
                      Send Code
                    </button>
                  </div>
                  {errors.verificationCode && <p className="text-red-500">{String(errors.verificationCode.message)}</p>}
                </div>
                <div className="mb-6">
                  <button 
                    type="submit"
                    className="shadow-submit dark:shadow-submit-dark flex w-full items-center justify-center rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90"
                  >
                    Verify & Continue
                  </button>
                </div>
              </form>
              <p className="text-center text-base font-medium text-body-color">
                Remember your password?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
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
  );
};

export default ResetPasswordPage;

