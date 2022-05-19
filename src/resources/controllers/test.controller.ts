import db from "../models/db_test";
import mail from "../../utils/mail_test";

import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken";
dotenv.config();

// Testing numbers
const absolute = (num: number) => {
  return num >= 0 ? num : -num;
};

// Testing strings
const greet = (name: string) => {
  return `Welcome ${name}!`;
};

// Testing arrays
const getCurrencies = () => {
  return ["AUD", "EUR", "USD"];
};

// Testing objects
const getProduct = (id: string) => {
  return { id, price: 10, category: "a" };
};

// Testing exceptions
const registerUser = (username: string | any) => {
  if (!username) throw new Error("Username is required");
  return { id: new Date().getTime(), username };
};

// Practise
const fizzBuzz = (input: number | any) => {
  if (typeof input !== "number") throw new Error("Input should be a number");
  if (input % 3 === 0 && input % 5 === 0) return "FizzBuzz";
  if (input % 3 === 0) return "Fizz";
  if (input % 5 === 0) return "Buzz";

  return input;
};

// Mock function
interface IOrder {
  customerId: string;
  totalPrice?: number | any;
}
const applyDiscount = (order: IOrder) => {
  const customer = db.getCustomerSync(order.customerId);

  if (customer.points > 10) order.totalPrice *= 0.9;
};

// Mock function - interaction testing
interface IOrder {
  customerId: string;
  totalPrice?: number | any;
}

const notifyCustomer = (order: IOrder) => {
  const customer = db.getCustomerSync(order.customerId);

  mail.send(customer.email, "Your order was placed successfully");
};

// Practise

export {
  absolute,
  greet,
  getCurrencies,
  getProduct,
  registerUser,
  fizzBuzz,
  applyDiscount,
  notifyCustomer,
};
