import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="font-sans text-white bg-black min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Wallet Creator</h1>
          <nav>
            {/* Add navigation items here if needed */}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text leading-tight" style={{paddingBottom: '5px'}}>
          Create Your Crypto Wallet in Seconds
        </h1>
        <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto">
          Secure, easy-to-use wallet generator for Ethereum and Solana. Start your crypto journey today.
        </p>
      </section>

      {/* Wallet Options */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {/* Ethereum Wallet Card */}
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 w-full md:w-96">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Ethereum Wallet</h2>
            <p className="text-gray-400 mb-6">Generate a secure Ethereum wallet with just one click.</p>
            <button
              onClick={() => router.push("/ethereum")}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Create Ethereum Wallet
            </button>
          </div>

          {/* Solana Wallet Card */}
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 w-full md:w-96">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400">Solana Wallet</h2>
            <p className="text-gray-400 mb-6">Generate a secure Solana wallet with enhanced speed.</p>
            <button
              onClick={() => router.push("/solana")}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Create Solana Wallet
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2024 Wallet Creator. All rights reserved.
          </p>
          <p className="text-sm text-white-500">
            Developed by <a href="https://sunilsimar.me/" className="text-blue-400 hover:underline">Sunil</a>
          </p>
        </div>
      </footer>
    </div>
  );
}