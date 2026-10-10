# ISP Reseller Billing & Profit Monitoring SaaS

A specialized Multi-Tenant SaaS platform designed for **ISP Resellers** to monitor and maximize monthly profitability by automatically tracking operating revenues, Mother ISP package disbursements, subscriber equipment deployments, physical service maintenance tickets, and subscriber wallets.

---

## 🚀 Key Business Features

### 1. The Three Operating Expenses
1. **Mother ISP Package Disbursements (Expense #1)**:
   - Reseller purchases bandwidth packages from a Mother ISP on a configurable percentage basis (e.g., **49% disbursed to Mother ISP, 51% retained by Reseller**).
   - This disbursement percentage is **configurable per reseller workspace**, and can even be customized per subscriber.
   - When each subscriber's new billing month begins, the reseller's payout obligation to the Mother ISP is automatically recorded.
2. **Subscriber Equipment Purchases (Expense #2)**:
   - Routers, GPON ONUs, optical fiber drop cables, media converters, and fast connectors purchased by the reseller.
   - Reseller can choose whether the component is **billed to the subscriber** or **absorbed by the reseller** as free promotional installation.
3. **Physical Service Maintenance (Expense #3)**:
   - When physical issues are reported (e.g., fiber cuts, red light LOS, line shifts, re-splicing), operational costs (technician transportation, labor, and splicing consumables) are logged as operating expenses.

### 2. Operating Revenue
1. **Subscriber Internet Package Collections**: Monthly fees paid by subscribers for fiber internet packages.
2. **Equipment Collections**: Payments collected from subscribers for provided hardware.

### 3. Subscriber Billing Cycles & Wallets
- **Join Anniversary Billing Cycle**: Each subscriber's billing cycle begins on their join date (e.g., joining on the 15th means their cycle renews on the 15th of every month).
- **Automated Cycle Incurrence**: On renewal day, the Mother ISP disbursement is logged immediately, and the subscriber's monthly fee is billed.
- **Subscriber Wallet Management**:
  - **Advance Payments**: Customers can deposit money in advance (positive wallet balance). When renewal occurs, the package fee is automatically deducted from their advance balance.
  - **Delayed / Overdue Payments**: If the customer hasn't paid yet, the cycle continues while recording negative wallet balance / due invoice for tracking delayed collection.

### 4. Reseller Profit Formula
$$\text{Package Gross Profit} = \text{Subscriber Package Collections} - \text{Mother ISP Payouts}$$
$$\text{Net Monthly Reseller Profit} = \text{Total Operating Revenue} - (\text{Mother ISP Payouts} + \text{Equipment Purchases} + \text{Physical Service Costs})$$

---

## 🏢 SaaS Multi-Tenancy & Security
- **JWT-Based Authentication**: Secure stateless session tokens.
- **Role-Based Access Control (RBAC)**:
  - `ROLE_SUPER_ADMIN`: Global platform oversight, unlimited SaaS reseller workspace provisioning, tenant percentage configuration.
  - `ROLE_RESELLER_ADMIN`: Workspace-isolated data access (subscribers, packages, expenses, wallets, and profit dashboards).
- **Workspace Isolation**: Every entity belongs to a `reseller_id` tenant partition.

---

## 🛠️ Technology Stack
- **Backend**: Spring Boot 4.1.1 (Java 21) & Apache Maven 3.9
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Database**: MySQL running at port 5624 (`isp_billing_db`)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Jenkinsfile Declarative Pipeline

---

## 🔑 Default Accounts (Ready to Test)

| Role | Username | Password | Notes |
|---|---|---|---|
| **Super Admin** | `superadmin` | `Password@123` | Can create & manage all SaaS reseller workspaces |
| **Reseller Admin** | `reseller_apex` | `Password@123` | Apex Broadband workspace (49% Mother ISP share) |

---

## 🏃 Running Locally

### 1. Backend (Spring Boot 4.1.1)
```powershell
cd D:\Codes\isp-billing-only\backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*
*Health Check: `http://localhost:8080/api/health`*

### 2. Frontend (React + Vite)
```powershell
cd D:\Codes\isp-billing-only\frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` (proxies `/api` to port 8080)*

---

## 🐳 Running with Docker Compose
```bash
cd D:\Codes\isp-billing-only
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

---

## ⚙️ Deploying with Jenkins
The included `Jenkinsfile` provides an end-to-end CI/CD pipeline:
1. **Checkout Code**
2. **Build & Test Backend** (`mvn clean package`)
3. **Build Frontend Assets** (`npm run build`)
4. **Build Multi-stage Docker Images**
5. **Deploy with Docker Compose** (`docker compose up -d --build`)
6. **Automated Health Check** (`/api/health`)
