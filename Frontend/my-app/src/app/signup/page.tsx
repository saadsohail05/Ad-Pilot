"use client"
import Link from "next/link";
import { useState } from "react";
import { registerUser } from "../../actions/actions"; // Adjust the import path as necessary
import Head from "next/head";
// import { metadata } from "./metadata"; // Import the metadata
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const SignupPage = () => {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Add this line

  useEffect(() => {
    document.title = "Sign Up | Ad Pilot";
  }, []);

  const schema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(6, "Password must be at least 6 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    isChecked: z.boolean().refine(val => val === true, "Please accept the Terms and Conditions")
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const handleSubmitForm = async (data: any) => {
    if (!data.isChecked) {
      setError("Please accept the Terms and Conditions");
      return;
    }

    try {
      const response = await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      if (response && response.status === "success") {
        setSuccess(response.message);
        setError("");
        // Redirect to verification page with email
        router.push(`/verification?email=${encodeURIComponent(data.email)}`);
      } else {
        throw new Error(response?.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    }
  };

  return (
    <>
      <Head>
      <title>Sign Up - Your App Name</title> {/* This sets the page title */}
      <meta name="description" content="Sign up for our app!" />
  </Head>     
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Create your account
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  It’s totally free and super easy
                </p>
                {error && <p className="text-red-500 text-center">{error}</p>}
                {success && <p className="text-green-500 text-center">{success}</p>}
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                  <div className="mb-8">
                    <label
                      htmlFor="username"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      {" "}
                      Username{" "}
                    </label>
                    <input
                      type="text"
                      {...register("username")}
                      placeholder="Enter your username"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                    {errors.username && <p className="text-red-500">{String(errors.username.message)}</p>}
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="email"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      {" "}
                      Work Email{" "}
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="Enter your Email"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                    {errors.email && <p className="text-red-500">{String(errors.email.message)}</p>}
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="mb-3 block text-sm text-dark dark:text-white"
                    >
                      {" "}
                      Your Password{" "}
                    </label>
                    <input
                      type="password"
                      {...register("password")}
                      placeholder="Enter your Password"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                    {errors.password && <p className="text-red-500">{String(errors.password.message)}</p>}
                  </div>
                  <div className="mb-8 flex items-center">
                    <input
                      type="checkbox"
                      {...register("isChecked")}
                      id="isChecked"
                      className="mr-2"
                    />
                    <label
                      htmlFor="isChecked"
                      className="text-sm font-medium text-body-color cursor-pointer"
                    >
                      By creating an account, you agree to the
                      <a href="#0" className="text-primary hover:underline">
                        {" "}Terms and Conditions{" "}
                      </a>
                      and our
                      <a href="#0" className="text-primary hover:underline">
                        {" "}Privacy Policy{" "}
                      </a>
                    </label>
                  </div>
                  {errors.isChecked && <p className="text-red-500">{String(errors.isChecked.message)}</p>}
                  <div className="mb-6">
                    <button className="shadow-submit dark:shadow-submit-dark flex w-full items-center justify-center rounded-sm bg-primary px-9 py-4 text-base font-medium text-white duration-300 hover:bg-primary/90">
                      Sign up
                    </button>
                  </div>
                </form>
                <p className="text-center text-base font-medium text-body-color">
                  Already using Ad Pilot ?{" "}
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
    </>
  );
};

export default SignupPage;
