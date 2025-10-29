export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search bar skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-full max-w-2xl"></div>
        </div>

        {/* Results skeleton */}
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
