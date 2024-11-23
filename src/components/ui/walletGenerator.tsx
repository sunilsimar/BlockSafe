import { useState } from 'react';
import { Eye, EyeOff, Copy, Trash2 } from 'lucide-react';
import axios from 'axios';
import bs58 from "bs58";
import { generateMnemonic } from 'bip39';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import { Wallet, HDNodeWallet } from 'ethers';
import { mnemonicToSeedSync, mnemonicToSeed } from 'bip39';
import { derivePath } from 'ed25519-hd-key';

interface wallet {
  id: number;
  publicKey: string;
  privateKey: string;
  balance: number | null;
}

// type WalletGeneratorProps = {
//     type: "Solana" | "Ethereum"; // Wallet type: Solana or Ethereum
//     fetchBalance?: (publicKey: string) => void; // Optional custom function for fetching balance
//   };


export function WalletGenerator({ type }: { type: string }) {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [wallets, setWallets] = useState<wallet[]>([]);
  const [copied, setCopied] = useState(false);
  const [privateKeyVisibility, setPrivateKeyVisibility] = useState<
    Record<number, boolean>
  >({});
  const [showMnemonic, setShowMnemonic] = useState(false);


  async function getBalance(address: string) {
    const balance = await axios.post('https://solana-devnet.g.alchemy.com/v2/5sYrdbUp61JoUg7D-pkDCzWLRPSaD7wR', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });
    const value = balance.data.result.value;
    const valueToSOL = value / 1_000_000_000; // Convert lamports to SOL

  // Update the balance of the wallet in state
  setWallets((prevWallets) =>
    prevWallets.map((wallet) =>
      wallet.publicKey === address
        ? { ...wallet, balance: valueToSOL }
        : wallet
    )
  );

}

  // Generate mnemonic
  async function createMnemonic() {
    const generatedMnemonic = await generateMnemonic();
    setMnemonic(generatedMnemonic);
  }

  // Clear all wallets
  const clearWallets = () => {
    setWallets([]);
    setMnemonic("");
    setShowMnemonic(false);
  };

  // Toggle mnemonic visibility
  const toggleMnemonicVisibility = () => {
    setShowMnemonic((prev) => !prev);
  };

  // Generate wallet
  async function generateWallet(type: string) {
    if (!mnemonic) {
      alert("Please generate or input a mnemonic first!");
      return;
    }

    if (type === "Solana") {
      const seed = mnemonicToSeedSync(mnemonic);
      const path = `m/44'/501'/${wallets.length}'/0'`;
      const derivedSeed = derivePath(path, seed.toString("hex")).key;
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      const newWallet: wallet = {
        id: wallets.length + 1,
        publicKey: keypair.publicKey.toBase58(),
        privateKey: bs58.encode(keypair.secretKey),
        balance: null,
      };

      setWallets((prevWallets) => [...prevWallets, newWallet]);
    } else {
      const seed = await mnemonicToSeed(mnemonic);
      const path = `m/44'/60'/${wallets.length}'/0'`;
      const hdNode = HDNodeWallet.fromSeed(seed);
      const child = hdNode.derivePath(path);
      const privateKey = child.privateKey;
      const WALLET = new Wallet(privateKey);

      const newWallet: wallet = {
        id: wallets.length + 1,
        publicKey: WALLET.address,
        privateKey: WALLET.privateKey,
        balance: null,
      };

      setWallets((prevWallets) => [...prevWallets, newWallet]);
    }
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

   // Toggle private key visibility for a specific wallet
   const togglePrivateKeyVisibility = (walletId: number) => {
    setPrivateKeyVisibility((prevVisibility) => ({
      ...prevVisibility,
      [walletId]: !prevVisibility[walletId],
    }));
  };

  // Delete wallet
  // const deleteWallet = (walletId: number) => {
  //   setWallets((prevWallets) =>
  //     prevWallets.filter((wallet) => wallet.id !== walletId)
  //   );
  // };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">

      <section className="space-y-4">
        <h1 className="text-5xl font-bold">
          {type === "Solana"
            ? "Solana Wallet Generator"
            : "Ethereum Wallet Generator"}
        </h1>
        <p className="text-gray-400">Save your mnemonic safely.</p>

        {!mnemonic ? (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your mnemonic or generate one"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white p-2 rounded-md w-full"
            />
            <button
              onClick={createMnemonic}
              className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md"
            >
              Generate Mnemonic
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={toggleMnemonicVisibility}
              className="bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              {showMnemonic ? "Your Secret Phrase" : "Your Secret Phrase"}
            </button>
            {showMnemonic && (
              <div
                className="mt-8 p-6 bg-gray-900 rounded-lg space-y-2 cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(mnemonic);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
                }}
              >
                <p className="grid grid-cols-4 gap-2">
                  {mnemonic.split(" ").map((word, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 p-2 rounded-md text-sm text-white text-center"
                    >
                      {word}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-500 text-center">
                  {copied ? "Copied!" : "Click to copy mnemonic"}
                </p>
              </div>
            )}
          </>
        )}
      </section>

        {/* Wallet Section */}
        {mnemonic && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">{type} Wallet</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => generateWallet(type)}
                  className="bg-white text-black text-sm font-medium py-1 px-2 rounded-md hover:bg-gray-200 transition-all duration-200 border border-gray-300"
                >
                  Add Wallet
                </button>
                <button
                  onClick={clearWallets}
                  className="bg-red-700 text-white text-sm font-medium py-2 px-6 rounded-md hover:bg-red-600 transition-all duration-200 border border-red-900"
                >
                  Clear Wallets
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-gray-900 p-6 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">
                      Wallet {wallet.id}
                    </h3>
                    <button
                      onClick={() =>
                        setWallets((prevWallets) =>
                          prevWallets.filter((w) => w.id !== wallet.id)
                        )
                      }
                      className="bg-red-600 hover:bg-red-500 p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">Public Key</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-800 p-2 rounded flex-1 font-mono">
                        {wallet.publicKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(wallet.publicKey)}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">Private Key</p>
                    <div className="flex items-center space-x-2">
                      <code className="bg-gray-800 p-2 rounded flex-1 font-mono">
                        {privateKeyVisibility[wallet.id]
                          ? wallet.privateKey
                          : "•".repeat(64)}
                      </code>
                      <button onClick={() => togglePrivateKeyVisibility(wallet.id)}>
                        {privateKeyVisibility[wallet.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {type === "Solana" && (
                    <>
                      <button
                        onClick={() => getBalance(wallet.publicKey)}
                        className="bg-blue-600 text-white text-sm font-medium py-1 px-2 rounded-md shadow-md hover:bg-blue-500 transition-all duration-200"
                      >
                        Check Balance
                      </button>
                      {wallet.balance != null && (
                        <p className="text-gray-400 mt-2">
                        Balance: {`${wallet.balance} SOL`}
                      </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default WalletGenerator;