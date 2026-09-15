export function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__badges">
          <a
            href="https://www.npmjs.com/package/@biz42/cli"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="npm package"
          >
            <img
              src="https://img.shields.io/npm/v/@biz42/cli?style=flat-square&label=npm&color=3b82f6"
              alt="npm version"
              height="20"
            />
          </a>
          <a
            href="https://github.com/mrsimpson/biz42/actions"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="CI status"
          >
            <img
              src="https://img.shields.io/github/actions/workflow/status/mrsimpson/biz42/ci.yml?style=flat-square&label=CI"
              alt="CI status"
              height="20"
            />
          </a>
        </div>
        <div className="footer__links">
          <a
            href="https://github.com/mrsimpson/biz42/blob/main/LICENSE"
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT
          </a>
          <span className="footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            href="https://github.com/mrsimpson/biz42"
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
