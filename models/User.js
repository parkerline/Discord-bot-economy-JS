const mongoose = require("mongoose");

// Схема для инвентаря
const inventorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

// Схема для транзакций
const transactionsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Схема для профиля пользователя
const profileSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    crystall: { type: Number, default: 0 },
    crypto: { type: Number, default: 0 },
    inventory: { type: [inventorySchema], default: () => [] },
    bank: { type: Number, default: 0 },
    lvl: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 },
    status: { type: String, default: "Не установлено" },
  },
  { _id: false }
);

// Основная схема пользователя
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  profile: { type: profileSchema, default: () => ({}) },
  online: { type: Number, default: 0 },
  online_day: { type: Number, default: 0 },
  rep_cooldown: { type: Date, default: null },
  timely_cooldown: { type: Date, default: null },
  transactions: { type: [transactionsSchema], default: () => [] },
});

// Экспорт модели пользователя
module.exports = mongoose.model("User", userSchema);
