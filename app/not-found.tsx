import Link from "next/link";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-6 text-gray-400 dark:text-gray-600" />

        <h1 className="text-6xl font-space font-bold mb-4 text-gray-900 dark:text-gray-100">
          404
        </h1>

        <h2 className="text-2xl font-space font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-8 font-sf">
          Sorry, we couldn't find the page you're looking for. The article may not exist in our database yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium hover:opacity-80 transition-opacity font-sf"
          >
            Back to Home
          </Link>

          <Link
            href="/search"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors font-sf"
          >
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
