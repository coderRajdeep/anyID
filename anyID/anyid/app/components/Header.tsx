import Link from 'next/link'

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gradient">
          anyID
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">About</Link></li>
            <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header