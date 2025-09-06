const LoadingScreen = () => (
    <div className="min-h-screen w-full flex items-center justify-center dark:bg-zinc-900 bg-white">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-8 dark:border-gray-200 border-gray-800 dark:border-t-zinc-800 border-t-zinc-200 rounded-full animate-spin mb-6"></div>
            <div className="dark:text-white text-black text-2xl font-semibold tracking-wide drop-shadow-sm sm:text-lg">
                Loading...
            </div>
        </div>
    </div>
);

export default LoadingScreen;
