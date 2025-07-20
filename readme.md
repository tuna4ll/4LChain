# 4LChain - Minimal Blockchain API and Frontend

## About the Project

4LChain is a minimal and simple blockchain API written with Node.js and Express.
It is specifically designed for learning fundamental blockchain concepts, transaction management, block mining, and balance tracking.

The frontend is built with Next.js and React TSX. It easily communicates with the API to create transactions, perform mining, and display the chain.

---

## Özellikler

- Basic Proof-of-Work mining algorithm

- Transaction creation, validation, and addition

- Address-based balance queries

- Initial coin creation via the `SYSTEM` address

-CORS support for API calls from different origins


---

## Installation and Running

### 1. Backend

```bash
git clone https://github.com/tuna4ll/4LChain
cd backend
npm install
npm start
````
The backend runs by default at `http://localhost:5000`.


### 2. Frontend

```bash
cd frontend
npm install
npm run dev
````
The frontend runs at `http://localhost:3000`.

---

## API Usage

### Adding a Transaction
First, mint coins from the `SYSTEM` address to your own address:
```bash
curl -X POST http://localhost:5000/transactions/new \
-H "Content-Type: application/json" \
-d '{"from":"SYSTEM","to":"sender_address","amount":1000}'
```
Then perform mining:
```bash
curl http://localhost:5000/mine
```
### Sending a Normal Transaction
```bash
curl -X POST http://localhost:5000/transactions/new \
-H "Content-Type: application/json" \
-d '{"from":"sender_address","to":"receiver_address","amount":100}'
```

### Viewing the Chain
```bash
curl http://localhost:5000/chain
```

### Checking Address Balance
```bash
curl http://localhost:5000/balance/sender_address
```

---

## Important Notes

- The `SYSTEM` address is specially used to create new coins in the blockchain.

- You must perform mining to include transactions in blocks before sending them.

- CORS settings are configured for frontend-API communication.

---
## Development
- Features like Proof-of-Stake, digital signatures, and P2P networking can be added.

- A VM can be developed for smart contract integration.

---
## Lisans
MIT © Tuna4L
