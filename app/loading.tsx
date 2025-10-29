export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-800 border-t-black dark:border-t-white"></div>
        <p className="text-sm text-muted-foreground font-sf">Loading...</p>
      </div>
    </div>
  );
}
