import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">404 - Not Found</h2>
      <p className="text-gray-500 mb-6">Could not find the requested resource</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}