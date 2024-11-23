import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { generateMnemonic } from "bip39";
import nacl from "tweetnacl";
import bs58 from "bs58";
import axios from "axios";
import { create } from "domain";


async function createMnemonic() {
    const mnemonic = await generateMnemonic();
    return mnemonic;
}

//{mnemonic}: {mnemonic: string}

export const SolanaWallet = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wallets, setWallets] = useState<{ address: string; privateKey: string }[]>([]);
    const [balances, setBalances] = useState<{ [address: string]: number | null }>({});
    const [mnemonic, setMnemonic] = useState<string>("");

    if (!mnemonic || !mnemonic.length) {
        console.error("Mnemonic is required to generate wallet!");
        return <div>Generate Seed Phrase first</div>;
    } else{
        createMnemonic().then((mnemonic) => setMnemonic(mnemonic));
    }

    async function getBalance(address: string) {
        const balance = await axios.post('https://solana-devnet.g.alchemy.com/v2/5sYrdbUp61JoUg7D-pkDCzWLRPSaD7wR', {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address]
        });
        const value = balance.data.result.value;
        const valueToSOL = value / 1000000000;
        return valueToSOL;
    }
    return (
        <div>
            <button onClick={async function(){
                const seed = await mnemonicToSeed(mnemonic);
                const path = `m/44'/501'/${currentIndex}'/0'`;
                const derivedSeed = derivePath(path, seed.toString("hex")).key;
                const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
                const keypair = Keypair.fromSecretKey(secret);
                setCurrentIndex(currentIndex + 1);
               
                //Convert private key to base 58
                const privateKey = bs58.encode(keypair.secretKey);

                setWallets(wallets.concat({
                    address: keypair.publicKey.toBase58(),
                    privateKey: privateKey
                }));
            }}>
               Add Sol Wallet
            </button>
           
            <div>
                <h3>Generated Wallets:</h3>
                {wallets.map((wallet, index) => (
                    <div key={index}>
                        <p>
                            <strong>Sol Address:</strong> {wallet.address} 
                        </p>
                        <p>
                            <strong>Private Key:</strong> {wallet.privateKey}
                        </p>
                        <button
                            onClick={async () => {
                                const balance = await getBalance(wallet.address);
                                setBalances((prevBalances) => ({
                                    ...prevBalances,
                                    [wallet.address]: balance,
                                }));
                            }}
                        >
                            Get Balance
                        </button>
                        <div>
                            {balances[wallet.address] === undefined
                                ? null
                                : balances[wallet.address] === null
                                ? <p style={{ color: "red" }}>Failed to fetch balance</p>
                                : <p><strong>Balance:</strong> {balances[wallet.address]} SOL</p>}
                        </div>
                    </div>
                ))}
            </div>
           
        </div>
    )
}

export default SolanaWallet;



