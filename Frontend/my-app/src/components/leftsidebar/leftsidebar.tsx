"use client";

import React from 'react';
import Link from 'next/link';
import { User, ChevronRight } from 'lucide-react';

type NavigationLink = {
  label: string;
  href: string;
};

interface LeftSidebarProps {
  username: string;
  links: NavigationLink[];
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ username, links }) => {
  return (
    <div className="w-64 mt-36 bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300 opacity-100 hover:opacity-25">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3 text-gold">
          <User className="h-8 w-8" />
          <span className="font-bold text-lg">{username}</span>
        </div>
      </div>
      <div className="py-4">
        <nav>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} passHref legacyBehavior>
                  <a className="flex items-center justify-between py-3 px-6 text-gold hover:bg-gold hover:text-gray-900 transition-all duration-300 rounded-md mx-2 group">
                    <span className="font-medium group-hover:font-bold">
                      {link.label}
                    </span>
                    <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transform transition-all duration-300 group-hover:translate-x-1" />
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default LeftSidebar;