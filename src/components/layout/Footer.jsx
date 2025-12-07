export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} Organisation Manager</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Help</a>
        </div>
      </div>
    </footer>
  );
}
