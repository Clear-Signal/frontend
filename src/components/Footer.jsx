import { FaTwitter, FaLinkedin, FaDiscord } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-black)] text-gray-300 py-10 px-10 md:px-40">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">

        {/* Left Section */}
        <div>
          <h2 className="text-[var(--text-default)] text-lg font-semibold">Clear-Signal</h2>
          <p className="mt-2 text-sm text-gray-400">
            Learn and grow your knowledge about Machine Learning using Clear-Signal
          </p>
        </div>

        {/* Middle Section */}
        <div>
          <h2 className="text-[var(--text-default)] text-lg font-semibold">Quick Links</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li><Link to="#" className="hover:text-gray-400">Problems</Link></li>
            <li><Link to="#" className="hover:text-gray-400">FAQ</Link></li>
            <li><Link to="#" className="hover:text-gray-400">Terms and Conditions</Link></li>
            <li><Link to="#" className="hover:text-gray-400">Submit Problem</Link></li>
            <li><Link to="#" className="hover:text-gray-400">Creator Program</Link></li>
          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h2 className="text-[var(--text-default)] text-lg font-semibold">Connect With Us</h2>
          <div className="mt-3 flex space-x-4 text-xl">
            <Link to="#" className="hover:text-gray-400"><FaTwitter /></Link>
            <Link to="#" className="hover:text-gray-400"><FaDiscord /></Link>
            <Link to="#" className="hover:text-gray-400"><MdEmail /></Link>
            <Link to="#" className="hover:text-gray-400"><FaLinkedin /></Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 mt-10 pt-4 text-center text-sm text-gray-500">
        © 2025 Clear-Signal. All rights reserved.
      </div>
    </footer>
  );
}
