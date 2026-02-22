"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Gamepad2, LayoutDashboard, Search } from "lucide-react";

const navLinks = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/search", label: "検索", icon: Search },
  { href: "/backlog", label: "積みリスト", icon: BookOpen },
];

export function Header({ session }: { session: Session }) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span>ツミホビ</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image ?? undefined} />
                <AvatarFallback>
                  {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm font-medium">{session.user?.name}</div>
            <div className="px-2 pb-1.5 text-xs text-muted-foreground">
              {session.user?.email}
            </div>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer"
            >
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
