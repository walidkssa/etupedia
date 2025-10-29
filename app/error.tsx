"use client";

import { useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === "development") {
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Cross2Icon className="w-16 h-16 mx-auto mb-6 text-red-500 dark:text-red-400" />

        <h1 className="text-6xl font-space font-bold mb-4 text-gray-900 dark:text-gray-100">
          Error
        </h1>

        <h2 className="text-2xl font-space font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Something went wrong
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-2 font-sf">
          An unexpected error occurred while loading this page.
        </p>

        {error.message && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8 font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
            {error.message}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-80 transition-opacity font-sf"
          >
            Try Again
          </button>

          <a
            href="/"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-sf"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
