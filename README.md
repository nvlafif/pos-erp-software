# POS-ERP Desktop Application

An integrated **Point-of-Sale (POS)** and **Enterprise Resource Planning (ERP)** desktop application built for retail and store operations. Designed for speed, accuracy, and operational reliability, this system streamlines inventory management, real-time cashier checkout, automated stock deduction, and flexible multi-period sales reporting.

---

## Tech Stack

* **Core Runtime & Language:** Java 21 LTS (Eclipse Temurin)
* **Backend Core Engine:** Spring Boot (Spring Web, Spring Data JPA / Hibernate)
* **Database:** PostgreSQL
* **Build Tool:** Maven
* **Desktop Client (Planned Integration):** React + Tauri / Electron (standalone desktop executable)

---

## User Interface & Feature Showcase

* **Login**
<img width="1474" height="718" alt="Screenshot_24-11-2026_14049_localhost" src="https://github.com/user-attachments/assets/8aed5a17-20d4-4000-b9a3-edbd8f3a76f8" />

* **Owner Dashboard**
<img width="1474" height="1258" alt="Screenshot_24-11-2026_14136_localhost" src="https://github.com/user-attachments/assets/9529465f-9ed1-4fe8-b81b-9346b9e782b1" />

* **Point of Sale (POS)**
<img width="1474" height="718" alt="Screenshot_24-11-2026_14156_localhost" src="https://github.com/user-attachments/assets/ae342b12-e556-411f-81d6-3bb808accab0" />

* **Transactions History**
<img width="1474" height="749" alt="Screenshot_24-11-2026_1429_localhost" src="https://github.com/user-attachments/assets/00849f7c-f5bf-4159-9097-818dbf431fca" />

* **Inventory Dashboard**
<img width="1474" height="973" alt="Screenshot_24-11-2026_14226_localhost" src="https://github.com/user-attachments/assets/a3fab0a6-16e8-455d-82e9-91ba0c60ca28" />

* **Master Data**
<img width="1474" height="718" alt="Screenshot_24-11-2026_14236_localhost" src="https://github.com/user-attachments/assets/f072241c-2b8b-402c-a370-49b43e48dc2a" />

* **Transaction Receipt**
<img width="1474" height="772" alt="Screenshot_24-11-2026_1432_localhost" src="https://github.com/user-attachments/assets/b7c136df-57b9-4c3f-8285-945c94f5d595" />

* **Product Catalog**
<img width="1474" height="995" alt="Screenshot_24-11-2026_14433_localhost" src="https://github.com/user-attachments/assets/c1eac514-0cf2-4b90-87bb-4fe24fcf3119" />

---

## Application Workflow

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

## Key Features

* **Master Data Management (CRUD):** Structured management for Products, Categories, Measurement Units, Users, and Roles.
* **ACID-Compliant Cashier Checkout (`@Transactional`):** Guarantees data integrity across transactions and inventory with automatic database rollbacks if any validation fails mid-process.
* **Real-Time Stock Deduction & Price Snapshots:** Automatically updates inventory upon checkout while recording exact unit prices at the time of purchase, ensuring historical receipts remain accurate even if master prices change later.
* **Backend-Driven Financial Calculations:** Line-item subtotals, total transaction amounts, and customer change are computed strictly on the server side to prevent calculation discrepancies and input tampering.
* **Multi-Period Sales Reporting:** Aggregates total transaction counts and revenue across flexible date filters, including **Today**, **This Week**, **This Month**, **This Year**, **Specific Month**, and **Custom Date Ranges**.
* **Centralized Error Handling & Data Protection:** Safeguards system stability against malformed inputs, duplicate entries, relational delete conflicts, stock shortages, and underpayments.
* **Desktop-Ready Architecture (Upcoming Enhancements):** Engineered to be packaged as a standalone desktop application with upcoming support for low-stock alerts, role-based access control (**Admin** vs. **Cashier**), and thermal receipt printing.
