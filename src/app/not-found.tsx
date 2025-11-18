import Link from "next/link"

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-t-gray px-4">
      <div className="w-full max-w-md rounded-[32px] bg-t-black p-8 text-white shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-4 border-white text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl font-semibold mb-6">Page not found</p>
        <p className="text-white/60 mb-8">The page you're looking for doesn't exist.</p>
        <Link 
          href="/" 
          className="inline-block rounded-full bg-white hover:bg-t-orange-light text-black font-semibold px-6 py-3 transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default NotFound