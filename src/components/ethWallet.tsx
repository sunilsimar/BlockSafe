import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { Wallet, HDNodeWallet } from 'ethers';
import axios from "axios";

export const EthWallet = ({mnemonic}: {mnemonic: string}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [wallets, setWallets] = useState<{ address: string; privateKey: string }[]>([]);
    const [balances, setBalances] = useState<{ [address: string]: number | null }>({});

    if (!mnemonic || !mnemonic.length) {
        console.error("Mnemonic is required to generate wallet!");
        return <div>Generate Seed Phrase first</div>;
    }

    async function getBalance(address: string){
        const balance = await axios.post('https://eth-sepolia.g.alchemy.com/v2/5sYrdbUp61JoUg7D-pkDCzWLRPSaD7wR', {
            "jsonrpc": "2.0",
            "id": 1,
            "method" : "eth_getBalance",
            "params": [address]
        })
    }

    return (
        <div>
            <button onClick={async function(){
                const seed = await mnemonicToSeed(mnemonic);
                const derivationPath = `m/44'/60'/${currentIndex}/0'`;
                const hdNode = HDNodeWallet.fromSeed(seed);
                const child = hdNode.derivePath(derivationPath);
                const privateKey = child.privateKey;
                const wallet = new Wallet(privateKey);
                setCurrentIndex(currentIndex + 1);
                setWallets([...wallets, { address: wallet.address, privateKey }]); 
            }}>
                Add ETH Wallet
            </button>

            <div>
                <h3>Generated Wallets:</h3>
                {wallets.map((wallet, index) => (
                    <div key={index}>
                        <p>
                            <strong>ETH Address:</strong> {wallet.address}
                        </p>
                        <p>
                            <strong>Private Key:</strong> {wallet.privateKey}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EthWallet;