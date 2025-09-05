import { FaTwitter, FaLinkedin, FaDiscord } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="dark:bg-[var(--color-bg-black)] bg-white dark:text-gray-300 text-gray-700 py-10 px-10 md:px-40">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">

        {/* Left Section */}
        <div>
          <h2 className="dark:text-[var(--text-default)] text-gray-900 text-lg font-semibold">PixelBank</h2>
          <p className="mt-2 text-sm dark:text-gray-400 text-gray-600">
            Learn and grow your knowledge about Machine Learning using PixelBank
          </p>
        </div>

        {/* Middle Section */}
        <div>
          <h2 className="dark:text-[var(--text-default)] text-gray-900 text-lg font-semibold">Quick Links</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li><Link to="/problems" className="hover:text-gray-400">Problems</Link></li>
            <li><Link to="#" className="hover:text-gray-400">FAQ</Link></li>
            <li><Link to="#" className="hover:text-gray-400">Terms and Conditions</Link></li>
            <li><Link to="/problems" className="hover:text-gray-400">Submit Problem</Link></li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h2 className="dark:text-[var(--text-default)] text-gray-900 text-lg font-semibold">Connect With Us</h2>
          <div className="mt-3 flex space-x-4 text-xl">
            <Link to="https://x.com/" className="hover:text-gray-400"><FaX /></Link>
            <Link to="https://discord.com/invite/" className="hover:text-gray-400"><FaDiscord /></Link>
            <Link to="#" className="hover:text-gray-400"><MdEmail /></Link>
            <Link to="https://www.linkedin.com/company/" className="hover:text-gray-400"><FaLinkedin /></Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-10 pt-4 text-center text-sm text-gray-500">
        © 2025 PixelBank. All rights reserved.
      </div>
    </footer>
  );
}
