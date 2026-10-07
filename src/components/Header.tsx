import { AudioLines, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="topbar">
      <div className="topbar-brand" data-testid="header-brand">
        <span className="topbar-mark" aria-hidden="true">
          <AudioLines size={18} />
        </span>
        <span className="topbar-title">
          <strong>ASR Tool</strong>
          <span>Automatic Speech Recognition System</span>
        </span>
      </div>
      <span className="secure-note">
        <ShieldCheck size={14} />
        Files sent only to your configured service
      </span>
    </header>
  );
}
