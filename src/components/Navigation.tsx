"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, Play, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Record Voice",
      icon: Mic,
    },
    {
      href: "/clone",
      label: "Clone Voice",
      icon: Waves,
    },
    {
      href: "/playback",
      label: "Voice Playback",
      icon: Play,
    },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-center">
          <div className="flex space-x-6">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-link transition-all duration-300 ease-in-out",
                  pathname === href && "active"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
