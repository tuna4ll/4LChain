'use client'

import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

interface Block {
  index: number;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
}

interface BalanceResponse {
  address: string;
  balance: number;
}

interface MessageResponse {
  message: string;
}

export default function Home() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number | null>(null);
  const [address, setAddress] = useState<string>("");
  const [chain, setChain] = useState<Block[]>([]);
  const [message, setMessage] = useState<string>("");

  const API = "http://localhost:5000";

  useEffect(() => {
    fetchChain();
  }, []);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }
    axios
      .get<BalanceResponse>(`${API}/balance/${address}`)
      .then((res) => setBalance(res.data.balance))
      .catch(() => setBalance(null));
  }, [address]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    setter(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  const sendTransaction = async (): Promise<void> => {
    if (!from || !to || amount <= 0) {
      setMessage("Lütfen geçerli işlem bilgileri girin.");
      return;
    }
    try {
      const res = await axios.post<MessageResponse>(`${API}/transactions/new`, {
        from,
        to,
        amount,
      });
      setMessage(res.data.message);
      fetchChain();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const err = error as AxiosError<MessageResponse>;
        setMessage(err.response?.data?.message ?? "Bir hata oluştu.");
      } else {
        setMessage("Bir hata oluştu.");
      }
    }
  };

  const mineBlock = async (): Promise<void> => {
    try {
      const res = await axios.get<MessageResponse>(`${API}/mine`);
      setMessage(res.data.message);
      fetchChain();
    } catch {
      setMessage("Mining başarısız.");
    }
  };

  const fetchChain = (): void => {
    axios
      .get<Block[]>(`${API}/chain`)
      .then((res) => setChain(res.data))
      .catch(() => setChain([]));
  };

  return (
    <div
      style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}
    >
      <h1>4LChain Minimal Frontend</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Sender (from)"
          value={from}
          onChange={(e) => handleInputChange(e, setFrom)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          placeholder="Receiver (to)"
          value={to}
          onChange={(e) => handleInputChange(e, setTo)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={handleAmountChange}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
          min={1}
        />
        <button onClick={sendTransaction} style={{ width: "100%", padding: 10 }}>
          İşlem Gönder
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Bakiye kontrolü için adres"
          value={address}
          onChange={(e) => handleInputChange(e, setAddress)}
          style={{ width: "100%", marginBottom: 8, padding: 8 }}
        />
        <p>Bakiye: {balance !== null ? balance : "-"}</p>
      </div>

      <div>
        <button onClick={mineBlock} style={{ width: "100%", padding: 10 }}>
          Blok Kaz
        </button>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>Blockchain Zinciri</h3>
        {chain.length === 0 && <p>Henüz blok yok.</p>}
        {chain.map((block) => (
          <div
            key={block.hash}
            style={{
              border: "1px solid #ddd",
              padding: 10,
              marginBottom: 10,
              borderRadius: 6,
              backgroundColor: "#f9f9f9",
            }}
          >
            <p>
              <b>Index:</b> {block.index}
            </p>
            <p>
              <b>Hash:</b> {block.hash.slice(0, 20)}...
            </p>
            <p>
              <b>Önceki Hash:</b> {block.previousHash.slice(0, 20)}...
            </p>
            <p>
              <b>Nonce:</b> {block.nonce}
            </p>
            <p>
              <b>İşlemler:</b>
            </p>
            <ul>
              {block.transactions.map((tx, i) => (
                <li key={i}>
                  {tx.from} → {tx.to}: {tx.amount}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, color: "green" }}>{message}</p>
    </div>
  );
}
