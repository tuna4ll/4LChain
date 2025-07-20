const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
app.use(cors());   
app.use(bodyParser.json());

const DIFFICULTY = 3;

class Block {
  constructor(index, previousHash, timestamp, transactions, nonce = 0) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
          this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest("hex");
  }

  mineBlock() {
    const target = "0".repeat(DIFFICULTY);
    while (!this.hash.startsWith(target)) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.balances = {};
  }

  createGenesisBlock() {
    return new Block(0, "0", Date.now(), [], 0);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    const { from, to, amount } = transaction;
    if (!from || !to || typeof amount !== "number" || amount <= 0) {
      return false;
    }
    if (from !== "SYSTEM" && (this.balances[from] || 0) < amount) {
      return false;
    }
    this.pendingTransactions.push(transaction);
    return true;
  }

  minePendingTransactions() {
    if (this.pendingTransactions.length === 0) return false;

    const block = new Block(
      this.chain.length,
      this.getLatestBlock().hash,
      Date.now(),
      this.pendingTransactions
    );
    block.mineBlock();

    this.chain.push(block);

    // Bakiyeleri güncelle
    this.pendingTransactions.forEach(({ from, to, amount }) => {
      if (from !== "SYSTEM") {
        this.balances[from] = (this.balances[from] || 0) - amount;
      }
      this.balances[to] = (this.balances[to] || 0) + amount;
    });

    this.pendingTransactions = [];
    return true;
  }
}

const myChain = new Blockchain();

app.post("/transactions/new", (req, res) => {
  const { from, to, amount } = req.body;
  console.log("Gelen veri:", req.body);
  if (!from || !to || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "Geçersiz işlem verisi." });
  }
  const added = myChain.addTransaction(req.body);
  if (added) {
    res.status(201).json({ message: "İşlem eklendi." });
  } else {
    res.status(400).json({ message: "Bakiye yetersiz veya geçersiz." });
  }
});


app.get("/mine", (req, res) => {
  const success = myChain.minePendingTransactions();
  if (success) {
    res.json({ message: "Blok başarıyla kazıldı." });
  } else {
    res.status(400).json({ message: "Kazılacak işlem yok." });
  }
});

app.get("/chain", (req, res) => {
  res.json(myChain.chain);
});

app.get("/balance/:address", (req, res) => {
  const balance = myChain.balances[req.params.address] || 0;
  res.json({ address: req.params.address, balance });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`4LChain minimal API ${PORT} portunda çalışıyor.`);
});
