# Super Admin Portal

Super Admin Portal for managing stores, features, and billing in the SaaS Store platform.

## Features

- **Dashboard**: Overview of all stores, customers, revenue, and top products
- **Store Management**: View and manage stores with feature flags
- **Feature Control**: Enable/disable features per store (SMS, Push Notifications, Coupons, etc.)
- **Billing Management**: Create and manage monthly invoices, track payments

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3001

## Database Migration

Before using the portal, run the database migration:

```bash
mysql -u root -p saas_store < ../saas-store-api/migrations/create_super_admin_tables.sql
```

## API Endpoints

All API endpoints are prefixed with `/api/v1/super-admin`:

- `POST /auth/login` - Super admin login
- `GET /dashboard` - Dashboard summary
- `GET /stores` - Get all stores
- `GET /stores/:store_id` - Get store details
- `PUT /stores/:store_id/features` - Update store features
- `GET /billing/invoices` - Get all invoices
- `POST /billing/invoices` - Create invoice
- `PUT /billing/invoices/:invoice_id/payment` - Update payment status

## Authentication

Super admin users must have `role_id = 1` or `role_name = 'super_admin'` in the `admin_users` table.
# store-super-admin
