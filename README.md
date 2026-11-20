# OrderCraft: Mastering Manufacturing Management

A web-based Order Management System (OMS) for manufacturing organizations. It automates the flow from sales order to payment: BOM generation, purchase orders, invoicing and payment tracking, with role-based access and analytics.

## Problem Statement

Manufacturing companies often manage orders, material planning, purchasing and billing in separate spreadsheets and chats. This causes calculation errors, delayed purchases, poor payment tracking and no visibility for management.

## Solution

OrderCraft brings the complete cycle into one platform:

- Sales orders with automatic order numbers
- Automatic Bill of Materials (BOM) with live shortage calculation
- Purchase orders per vendor, with goods receipt and stock update
- Invoices with tax snapshot and payment tracking
- Role-based access (Admin, Sales, Purchase, Accounts)
- Dashboard with reports and analytics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Python, Django, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | MySQL |
| Version Control | Git, GitHub |

## Workflow

Customer -> Sales Order -> BOM -> Stock Check -> Purchase Order -> Vendor -> Goods Received -> Dispatch -> Invoice -> Payment -> Reports

## Project Structure

```
ordercraft/
├── backend/     Django project (apps: accounts, masters, sales, bom, purchase, billing, reports)
├── frontend/    React app
├── database/    SQL scripts and dataset
└── docs/        Diagrams and presentation
```

## Setup (Backend)

1. Clone the repository
   ```
   git clone https://github.com/YOUR_USERNAME/ordercraft.git
   cd ordercraft/backend
   ```
2. Create and activate a virtual environment
   ```
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies
   ```
   python -m pip install -r requirements.txt
   ```
4. Create a MySQL database
   ```sql
   CREATE DATABASE ordercraft_db CHARACTER SET utf8mb4;
   ```
5. Copy `.env.example` to `.env` and set your MySQL password
6. Run migrations and create an admin user
   ```
   python manage.py migrate
   python manage.py createsuperuser
   ```
7. Start the server
   ```
   python manage.py runserver
   ```

Admin panel: http://127.0.0.1:8000/admin/

## Setup (Frontend)

```
cd frontend
npm install
npm run dev
```

## API Overview

| Module | Endpoint |
|---|---|
| Auth | `POST /api/auth/login/` |
| Masters | `/api/masters/customers/`, `/vendors/`, `/products/` |
| Sales | `/api/sales/orders/` |
| BOM | `/api/bom/boms/` |
| Purchase | `/api/purchase/orders/` |
| Billing | `/api/billing/invoices/`, `/payments/` |
| Reports | `GET /api/reports/dashboard/` |

## Roles

| Role | Can write |
|---|---|
| Admin | Everything |
| Sales | Customers, sales orders |
| Purchase | Vendors, products, purchase orders |
| Accounts | Invoices, payments |

All roles can view data.

## Author

Your Name | FSD Python


## Screenshots

![Home](docs/screenshots/home.png)
![Dashboard](docs/screenshots/dashboard.png)
![Orders](docs/screenshots/orders.png)
![BOM](docs/screenshots/bom.png)