import { FaGoogle } from "react-icons/fa";
import { MdEmail, MdVisibility } from "react-icons/md";
import { RiKey2Fill } from "react-icons/ri";
import { BiLogIn } from "react-icons/bi";
import Navbar from "../components/Navbar";

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] relative">
          {/* Background subtle dots */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-[#1a1a1a] rounded-2xl shadow-lg">
            {/* Logo */}
            <div className="flex justify-center items-center mb-6">
              <img src="/Logo.jpg" alt="Clear-Signal" className="w-10 h-10 rounded-full" />
              <h1 className="text-white text-xl font-bold ml-2">Clear-Signal</h1>
            </div>

            {/* Heading */}
            <h2 className="text-center text-2xl font-bold text-white">
              Welcome back
            </h2>
            <p className="text-center text-gray-400 mt-1 mb-6">
              Sign in to access your Clear-Signal profile and progress
            </p>

            {/* Google Button */}
            <button className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-lg transition cursor-pointer">
              <FaGoogle className="" /> Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span className="px-2 text-sm text-gray-500">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                <MdEmail />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full bg-transparent outline-none text-white"
                />
              </label>
            </div>

            {/* Password Input */}
            <div className="mb-2">
              <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                <RiKey2Fill />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-white"
                />
                <MdVisibility className="cursor-pointer" />
              </label>
            </div>

            {/* Forgot password */}
            <p className="text-sm text-gray-400 mb-4 cursor-pointer hover:text-white">
              Forgot your password?
            </p>

            {/* Sign in Button */}
            <button className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition cursor-pointer">
              <BiLogIn /> Sign in
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-400 mt-4">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-white font-semibold hover:underline cursor-pointer">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
