# Technical Architecture Specification - RestoQ (PesenGo)

## 1. Technology Stack
- **Framework**: Next.js 15 (App Router, React 19, TypeScript strict mode)
- **Styling**: Tailwind CSS v4 / Vanilla CSS, Lucide icons, Dark mode, CSS custom variables
- **Database & ORM**: PostgreSQL / SQLite (with Prisma ORM, Prisma Client, schema migrations / db push)
- **Backend API & Realtime Server**: Next.js API Routes / Express server + Socket.IO Server for real-time WebSocket communication
- **Authentication**: JWT-based auth with HTTP-only cookies/headers, custom RBAC middleware (`ADMIN`, `KASIR`, `DAPUR`, `RUNNER`)
- **PWA**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`), Installable PWA support
- **Export Capabilities**: PDF generation (pdfmake / jspdf / html2pdf) and Excel export (xlsx)
- **Thermal Printing**: Web Bluetooth API (ESC/POS command generation) + Browser Thermal Receipt layout fallback

## 2. Directory & Architecture Structure
```
PesenGo/
├── .github/specs/           # Specification documents
├── prisma/                  # Prisma schema and seed data
│   ├── schema.prisma
│   └── seed.ts
├── public/                  # Static assets & PWA manifest
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── src/
│   ├── app/                 # Next.js App Router pages & APIs
│   │   ├── (customer)/      # Customer PWA routes (menu, cart, checkout, order status)
│   │   ├── (auth)/          # Staff login page
│   │   ├── (dashboard)/     # Role-based dashboards (admin, kasir, dapur, runner)
│   │   └── api/             # REST API endpoints & Webhook handlers
│   ├── components/          # Reusable UI components & Layouts
│   │   ├── customer/
│   │   ├── cashier/
│   │   ├── kitchen/
│   │   ├── runner/
│   │   ├── admin/
│   │   └── ui/
│   ├── lib/                 # Core utilities (Prisma client, JWT, Socket.io client, printing, export)
│   ├── server/              # Socket.io WebSocket server initialization
│   └── types/               # TypeScript interfaces and enum definitions
```

## 3. Database Schema Blueprint
- `User`: id, username, email, passwordHash, name, role, outletId, isActive, createdAt
- `Outlet`: id, name, address, taxRate, serviceRate, createdAt
- `Table`: id, outletId, tableNumber, qrToken, status, capacity, createdAt
- `Category`: id, outletId, name, sortOrder, createdAt
- `MenuItem`: id, categoryId, name, description, price, imageUrl, isAvailable, stock, createdAt
- `Order`: id, orderNumber, tableId, outletId, customerName, customerPhone, status, paymentMethod, paymentStatus, subtotal, tax, serviceCharge, discount, total, notes, createdAt, updatedAt
- `OrderItem`: id, orderId, menuItemId, quantity, unitPrice, subtotal, notes
- `Payment`: id, orderId, method, gatewayRef, status, qrCodeUrl, paidAt, createdAt
- `Promo`: id, code, discountType, discountValue, minSpend, validUntil, isActive
- `AuditLog`: id, userId, action, details, createdAt

## 4. Coding Standards & Guidelines
- Strictly 0 truncation / placeholder policy.
- Zero emoji policy in TypeScript, React components, CSS, and backend code.
- Zero TypeScript & ESLint errors.
- Always include `// File: relative/path/to/file` header on all generated code files.
- Prefer Server Components where feasible, `"use client"` for interactive components.
