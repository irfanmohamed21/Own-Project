import { Link, useLocation } from "wouter";
import { AudioLines, BookOpenText, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const nav = [
    { href: "/", label: "Transcribe", icon: AudioLines },
    { href: "/history", label: "History", icon: Clock3 },
    { href: "/about", label: "About", icon: BookOpenText },
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/" className="brand" data-testid="link-brand">
        <span className="brand-mark"><AudioLines size={20} /></span>
         <span><span className="brand-name">ASR Tool</span><span className="brand-sub">Automatic Speech Recognition System</span></span>
      </Link>
      <div className="nav-label">Workspace</div>
      <nav aria-label="Main navigation">{nav.map(({ href, label, icon: Icon }) =>
        <Link key={href} href={href} className={`nav-link ${location === href ? "active" : ""}`} aria-current={location === href ? "page" : undefined} data-testid={`link-${label.toLowerCase()}`}>
          <Icon size={17} strokeWidth={1.8} />{label}
        </Link>)}</nav>
      <div className="sidebar-foot">A focused space for turning spoken words into searchable text.</div>
    </aside>
    <main className="main-area">
      <Header />
      {children}
    </main>
    <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(({ href, label, icon: Icon }) =>
      <Link key={href} href={href} className={location === href ? "active" : ""} aria-current={location === href ? "page" : undefined} data-testid={`mobile-link-${label.toLowerCase()}`}>
        <Icon size={19} />{label}
      </Link>)}</nav>
  </div>;
}
