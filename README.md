# 🛒 POS-ERP Desktop Application

An integrated **Point-of-Sale (POS)** and **Enterprise Resource Planning (ERP)** desktop application built for retail and store operations. Designed for speed, accuracy, and operational reliability, this system streamlines inventory management, real-time cashier checkout, automated stock deduction, and flexible multi-period sales reporting.

---

## 🚀 Tech Stack

* **Core Runtime & Language:** Java 21 LTS (Eclipse Temurin)
* **Backend Core Engine:** Spring Boot (Spring Web, Spring Data JPA / Hibernate)
* **Database:** PostgreSQL
* **Build Tool:** Maven
* **Desktop Client (Planned Integration):** React + Tauri / Electron (standalone desktop executable)

---

## 🔄 Application Workflow

```text
[1. Master Data Setup] ──▶ [2. Cashier Checkout Input] ──▶ [3. Validation & Calculation]
                                                                     │
[5. Sales Reporting]   ◀── [4. Receipt & Stock Update] ◀─────────────┘
```

1. **Master Data Setup:** Administrators configure product categories, measurement units, user roles, staff accounts, and the product catalog complete with unit pricing and initial stock levels.
2. **Cashier Checkout Input:** During checkout, the cashier selects purchased items, enters quantities, and inputs the customer's payment amount through the desktop interface.
3. **Automated Validation & Calculation:** The core engine verifies real-time stock availability and payment sufficiency, locks in unit prices at the time of sale (*price snapshot*), and automatically computes line-item subtotals, total bill amount, and customer change.
4. **Receipt Persistence & Stock Deduction:** Once validated, the transaction receipt and itemized details are committed to PostgreSQL while product inventory is deducted automatically. If stock is insufficient or payment falls short, the entire operation is rolled back to preserve data consistency.
5. **Sales Monitoring & Reporting:** Store owners and administrators review transaction histories and analyze total transaction volume and revenue across customizable date ranges.

---

## ✨ Key Features

* **Master Data Management (CRUD):** Structured management for Products, Categories, Measurement Units, Users, and Roles.
* **ACID-Compliant Cashier Checkout (`@Transactional`):** Guarantees data integrity across transactions and inventory with automatic database rollbacks if any validation fails mid-process.
* **Real-Time Stock Deduction & Price Snapshots:** Automatically updates inventory upon checkout while recording exact unit prices at the time of purchase, ensuring historical receipts remain accurate even if master prices change later.
* **Backend-Driven Financial Calculations:** Line-item subtotals, total transaction amounts, and customer change are computed strictly on the server side to prevent calculation discrepancies and input tampering.
* **Multi-Period Sales Reporting:** Aggregates total transaction counts and revenue across flexible date filters, including **Today**, **This Week**, **This Month**, **This Year**, **Specific Month**, and **Custom Date Ranges**.
* **Centralized Error Handling & Data Protection:** Safeguards system stability against malformed inputs, duplicate entries, relational delete conflicts, stock shortages, and underpayments.
* **Desktop-Ready Architecture (Upcoming Enhancements):** Engineered to be packaged as a standalone desktop application with upcoming support for low-stock alerts, role-based access control (**Admin** vs. **Cashier**), and thermal receipt printing.