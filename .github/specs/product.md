# Product Specification - RestoQ (PesenGo)

## 1. Product Overview
RestoQ is a Progressive Web Application (PWA) designed for high-volume smart restaurant ordering and kitchen operations (similar to Mie Gacoan).
Customers scan a table QR code to open the application, view menus, customize orders, and pay via QRIS or Cashier.
Staff roles (Admin, Cashier, Kitchen KDS, Runner) receive real-time order status updates via WebSockets without page reloads.

## 2. Target Roles & Access Control
- **Pelanggan (Guest)**: Scans QR code, browses catalog, adds notes/customizations, checks out (QRIS or Cashier payment), tracks order progress in real-time.
- **Admin**: Master management of categories, menus, tables, QR generation/download, staff users (RBAC), sales reports (PDF/Excel export), taxes, service charges, vouchers.
- **Kasir (Cashier)**: Active order management, cash payment confirmation, receipt printing (Thermal Bluetooth/LAN/Native), order cancellation (with reason), daily sales history.
- **Dapur (Kitchen KDS)**: Real-time FIFO order queue, timer tracking, status controls ("Mulai Masak" -> Cooking, "Selesai" -> Ready).
- **Runner**: Displays orders in "Ready" status with prominent table numbers, action button ("Sudah Diantar" -> Completed).

## 3. Order Status Flow
1. `PENDING_PAYMENT`: Order created, awaiting QRIS payment webhook or cashier cash confirmation.
2. `PAID`: Payment verified (webhook or cashier button).
3. `QUEUE_KITCHEN`: Auto-moved to kitchen queue upon payment.
4. `COOKING`: Kitchen staff clicked "Mulai Masak".
5. `READY`: Kitchen staff clicked "Selesai". Moved to Runner dashboard.
6. `DELIVERING`: Optional/Runner delivering food to table.
7. `COMPLETED`: Runner clicked "Sudah Diantar".
8. `CANCELLED`: Cancelled by Cashier/Admin with mandatory reason.

## 4. Key Business Logic & Rules
- Table QR code encodes unique table token preventing spoofing.
- Item stock & availability toggle dynamically prevents out-of-stock order placement.
- Tax and service charges automatically calculated at checkout based on outlet settings.
- Real-time updates via WebSocket / Socket.io across all dashboards simultaneously.
