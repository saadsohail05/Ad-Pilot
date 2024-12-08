'use client';

import { useState } from "react";
import PricingBox from "@/components/Pricing/PricingBox";
import { CreditCard, AppleIcon, ChromeIcon as GoogleIcon } from 'lucide-react';

const CheckoutPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("");

  const handlePlanSelection = (plan: string) => {
    setSelectedPlan(plan);
  };

  return (
    <section className="overflow-hidden py-16 md:py-20 lg:py-28">
      <div className="container">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
              <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                Checkout
              </h2>
              <p className="mb-6 text-base font-medium text-body-color">
                Enter your payment details below.
              </p>

              <form>
                <div className="mb-8">
                  <label htmlFor="cardNumber" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark"
                  />
                </div>

                <div className="flex mb-8 space-x-4">
                  <div className="w-1/2">
                    <label htmlFor="expiryDate" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      Expiry Date
                    </label>
                    <input
                      type="month"
                      id="expiryDate"
                      className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark"
                    />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="cvc" className="mb-3 block text-sm font-medium text-dark dark:text-white">
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      placeholder="123"
                      className="w-full rounded-sm border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:text-body-color-dark"
                    />
                  </div>
                </div>

                <div className="mb-8 flex items-center justify-center space-x-4">
                  <CreditCard className="w-8 h-8" />
                  <AppleIcon className="w-8 h-8" />
                  <GoogleIcon className="w-8 h-8" />
                </div>

                <div className="mb-8">
                  <h3 className="mb-4 text-xl font-bold text-dark dark:text-white">Select a Payment Plan</h3>
                  <div className="flex space-x-4 overflow-x-auto">
                    <PricingBox
                      price="29"
                      duration="month"
                      packageName="Basic"
                      subtitle="Perfect for small businesses"
                    >
                      <button
                        onClick={() => handlePlanSelection("Basic")}
                        className={`w-full rounded-sm p-3 text-base font-semibold text-white transition duration-300 ease-in-out ${
                          selectedPlan === "Basic" ? "bg-primary" : "bg-body-color"
                        }`}
                      >
                        {selectedPlan === "Basic" ? "Selected" : "Select Plan"}
                      </button>
                    </PricingBox>
                    <PricingBox
                      price="49"
                      duration="month"
                      packageName="Standard"
                      subtitle="Ideal for growing companies"
                    >
                      <button
                        onClick={() => handlePlanSelection("Standard")}
                        className={`w-full rounded-sm p-3 text-base font-semibold text-white transition duration-300 ease-in-out ${
                          selectedPlan === "Standard" ? "bg-primary" : "bg-body-color"
                        }`}
                      >
                        {selectedPlan === "Standard" ? "Selected" : "Select Plan"}
                      </button>
                    </PricingBox>
                    <PricingBox
                      price="99"
                      duration="month"
                      packageName="Premium"
                      subtitle="Advanced features for pros"
                    >
                      <button
                        onClick={() => handlePlanSelection("Premium")}
                        className={`w-full rounded-sm p-3 text-base font-semibold text-white transition duration-300 ease-in-out ${
                          selectedPlan === "Premium" ? "bg-primary" : "bg-body-color"
                        }`}
                      >
                        {selectedPlan === "Premium" ? "Selected" : "Select Plan"}
                      </button>
                    </PricingBox>
                  </div>
                </div>

                <div className="w-full px-4 mb-6">
                  <button
                    type="submit"
                    className="w-full rounded-sm bg-primary px-6 py-3 text-base font-medium text-white shadow-submit duration-300 hover:bg-primary/90 dark:shadow-submit-dark"
                  >
                    Complete Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;
