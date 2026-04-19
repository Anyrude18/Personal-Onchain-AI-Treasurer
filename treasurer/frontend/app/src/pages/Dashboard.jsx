import { useState } from "react";
import { ethers } from "ethers";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const abi = [
  "function addIncome() payable",
  "function sendExpense(address payable to,uint256 amount)",
  "function getBalance() view returns(uint256)"
];

export default function Dashboard() {
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("");

  async function connectWallet() {
    if (!window.ethereum) return alert("Install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    setWallet(address);

    loadBalance();
  }

  async function loadBalance() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      provider
    );

    const bal = await contract.getBalance();

    setBalance(
      parseFloat(ethers.formatEther(bal)).toFixed(4)
    );
  }

  async function addIncome() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    const tx = await contract.addIncome({
      value: ethers.parseEther(amount),
    });

    await tx.wait();

    loadBalance();
    setAmount("");
  }

  async function expense() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      abi,
      signer
    );

    const tx = await contract.sendExpense(
      wallet,
      ethers.parseEther(amount)
    );

    await tx.wait();

    loadBalance();
    setAmount("");
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-8">
        Real Time Wallet Dashboard
      </h1>

      <button
        onClick={connectWallet}
        className="bg-purple-600 px-5 py-3 rounded-xl"
      >
        Connect Wallet
      </button>

      <div className="mt-6">
        Wallet: {wallet || "Not Connected"}
      </div>

      <div className="mt-2 text-2xl text-green-400">
        Treasury Balance: {balance} ETH
      </div>

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
        className="mt-6 p-3 rounded text-black w-full"
      />

      <div className="flex gap-4 mt-4">
        <button
          onClick={addIncome}
          className="bg-green-600 px-5 py-3 rounded-xl"
        >
          Add Income
        </button>

        <button
          onClick={expense}
          className="bg-red-600 px-5 py-3 rounded-xl"
        >
          Expense
        </button>
      </div>
    </div>
  );
}