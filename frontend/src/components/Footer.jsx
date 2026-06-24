export default function Footer() {
  return (
    <footer className="bg-surface-container-low py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center text-on-surface-variant text-label-sm font-label-sm">
        <p>© 2026 SEO Insight Pro. All rights reserved.</p>
        <div className="flex gap-stack-md mt-stack-sm md:mt-0">
          <a className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
          <a className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
          <a className="hover:text-primary transition-colors cursor-pointer">API Support</a>
        </div>
      </div>
    </footer>
  )
}
