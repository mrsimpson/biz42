import { useState } from "react";

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    if (ok) resolve();
    else reject(new Error("execCommand copy failed"));
  });
}

export function Hero() {
  const [copied, setCopied] = useState(false);
  const startCmd = "npx @doctc/biz42 --help";

  const handleCopy = () => {
    copyToClipboard(startCmd)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Copy failed — nothing to show, button state stays unchanged
      });
  };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="container hero__inner">
        <p className="hero__eyebrow">Business Model · Alignment · ISO 9001</p>
        <h1 className="hero__headline">
          Business goals that
          <br />
          <em>agents can read.</em>
        </h1>
        <p className="hero__sub">
          Plain-text. Outside-in. Traceable from business goal to product to feature.
        </p>
        <div className="hero__install" role="group" aria-label="Install command">
          <span className="hero__install-prompt">$</span>
          <code>{startCmd}</code>
          <button
            className="hero__install-copy"
            onClick={handleCopy}
            aria-label={copied ? "Copied!" : "Copy install command"}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
        <div className="hero__ctas">
          <a href="./docs/" className="btn btn--primary">
            View architecture docs →
          </a>
          <a href="./acme-emergency/" className="btn btn--outline">
            See acme example →
          </a>
        </div>
        <a
          href="#getting-started"
          className="hero__scroll-hint"
          aria-label="Scroll to getting started"
        >
          <ChevronDownIcon />
        </a>
      </div>
    </section>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
