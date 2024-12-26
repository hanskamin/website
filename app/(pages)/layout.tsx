"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-[family-name:var(--font-geist-mono)]">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="absolute top-4 left-4 z-50 p-2 bg-black text-white rounded focus:outline-none"
      >
        {/* Hamburger Icon */}
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white mb-1"></span>
        <span className="block w-6 h-0.5 bg-white"></span>
      </button>

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-black text-white p-6 transform ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300`}
      >
        <button
          onClick={closeMenu}
          className="absolute top-4 right-4 text-white"
        >
          ✕
        </button>
        <nav className="flex flex-col space-y-4 mt-10">
          <Link onClick={closeMenu} href="/" className="hover:underline">
            Home
          </Link>
          <Link onClick={closeMenu} href="/music" className="hover:underline">
            Music
          </Link>
          <Link onClick={closeMenu} href="/software" className="hover:underline">
            Software
          </Link>
          <Link onClick={closeMenu} href="/volunteering" className="hover:underline">
            Volunteering
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <main className="w-full">{children}</main>
    </div>
  );
}