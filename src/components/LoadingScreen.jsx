const LoadingScreen = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-900">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-8 border-gray-200 border-t-zinc-800 rounded-full animate-spin mb-6"></div>
            <div className="text-white text-2xl font-semibold tracking-wide drop-shadow-sm sm:text-lg">
                Loading...
            </div>
        </div>
    </div>
);

export default LoadingScreen;
