import React, { useState, useMemo } from "react";
import { toast } from "react-hot-toast";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Simple, robust email check (no overfitting)
  const emailRegex = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
    []
  );

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Please enter your email.");
      return false;
    }
    if (/\s/.test(trimmed)) {
      toast.error("Email cannot contain spaces.");
      return false;
    }
    if (trimmed.length > 254) {
      toast.error("Email is too long.");
      return false;
    }
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateEmail(email)) return;

    try {
      setSubmitting(true);

      // TODO: replace with your API call
      // await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) });

      toast.success("Subscribed! You’ll now receive our best deals.");
      setEmail("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 mt-16 px-0 py-8 sm:px-6 md:mt-24 md:p-10">
      {/* Local toaster for this section (or move one Toaster to App root) */}


      <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
      <p className="md:text-lg text-gray-500/70 pb-8">
        Subscribe to get the latest offers, new arrivals, and exclusive discounts
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-2xl w-full"
        noValidate
      >
        <input
          className="bg-white border border-gray-300 rounded-md min-h-12 sm:border-r-0 outline-none min-w-0 w-full sm:rounded-r-none px-3 text-gray-700"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email address"
          aria-invalid={email.length > 0 && !emailRegex.test(email)}
        />

        <button
          type="submit"
          disabled={submitting}
          className={`bg-[var(--herbal)] md:px-12 px-6 min-h-12 shrink-0 text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md sm:rounded-l-none
            ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {submitting ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
