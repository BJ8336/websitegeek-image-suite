const LINKS = [
  { label: 'Home', href: 'https://websitegeek.net/' },
  { label: 'About This Suite', href: 'https://websitegeek.net/image-suite-info/' },
  { label: 'Privacy Policy', href: 'https://websitegeek.net/privacy-policy/' },
  { label: 'Terms of Service', href: 'https://websitegeek.net/terms-conditions/' },
  { label: 'Report Bug / Contact Us', href: 'https://websitegeek.net/contact-us/' },
]

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} WebsiteGeek.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-1">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-700 hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
