import Link from "next/link";
import { Users, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-8 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            <span className="text-primary text-xl">🎓</span>
            MKAL Topluluk
          </Link>
          <p className="text-sm text-muted-foreground text-center md:text-left max-w-sm">
            MKAL'in babalarinin mekani
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <a
            href="https://instagram.com/mkaltopluluk"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Users className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-4 border-t border-border/40 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} MKAL Topluluk. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
