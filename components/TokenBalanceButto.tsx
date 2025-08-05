"use client";

import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { useState } from "react";

const USDT_ADDRESS = "0x617f3112bf5397D0467D315cC709EF968D9ba546";
const USDT_ABI = [
  "function balanceOf(address) view returns (uint)",
];

export default function TokenBalanceButton() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");

  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isConnected) throw new Error("Wallet not connected");
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(USDT_ADDRESS, USDT_ABI, signer);
      const raw = await contract.balanceOf(address);
      setBalance(formatUnits(raw, 18));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={getBalance}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-800"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Check USDT Balance"}
      </button>

      {balance && <p className="mt-2 text-green-600">Balance: {balance} USDT</p>}
      {error && <p className="mt-2 text-red-500">Error: {error}</p>}
    </div>
  );
}
