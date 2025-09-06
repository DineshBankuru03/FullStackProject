const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FLAVORS_FILE = path.join(__dirname, "flavors.json");
const ORDERS_FILE = path.join(__dirname, "orders.json");

let flavors = [];
let orders = [];

// Load flavors
try {
  flavors = JSON.parse(fs.readFileSync(FLAVORS_FILE, "utf-8"));
} catch {
  flavors = [];
}

// Load orders
try {
  if (fs.existsSync(ORDERS_FILE)) {
    orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
  } else {
    orders = [];
  }
} catch {
  orders = [];
}

// Save orders to file
function saveOrders() {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// ✅ Get flavors
app.get("/flavors", (req, res) => {
  res.json(flavors);
});

// ✅ Place order
app.post("/order", (req, res) => {
  const { flavor, price, time } = req.body;
  if (!flavor || !price) {
    return res.status(400).json({ message: "Invalid order ❌" });
  }
  const order = {
    id: Date.now(),
    flavor,
    price,
    time: time || new Date().toISOString(),
    status: "Pending",
  };
  orders.push(order);
  saveOrders();
  res.json({ message: `Order placed for ${flavor} ✅`, order });
});

// ✅ Get only PENDING orders
app.get("/orders", (req, res) => {
  const pending = orders.filter((o) => o.status === "Pending");
  res.json(pending);
});

// ✅ Delete order (used for Confirm + Cancel)
app.delete("/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return res.status(404).json({ message: "Order not found ❌" });

  const removed = orders.splice(index, 1)[0];
  saveOrders();
  res.json({ message: `Order deleted`, order: removed });
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
