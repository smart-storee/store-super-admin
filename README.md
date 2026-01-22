# SaaS Store Admin Portal

A comprehensive super admin portal for managing multiple stores, billing, permissions, and platform-wide analytics in a SaaS e-commerce platform.

## 🚀 Features

### 1. **Authentication & Authorization**

- Secure login with JWT token-based authentication
- Role-based access control (Super Admin only)
- Session management with localStorage
- Automatic redirect for unauthenticated users

### 2. **Dashboard**

- **Overview Analytics**: Real-time platform statistics
  - Total Stores count
  - Total Customers across all stores
  - Total Revenue aggregated
  - Total Orders count
  - Categories, Products, and Variants statistics
- **Top Selling Products**: Last 30 days performance
- **Store Summary Table**: Quick view of all stores with key metrics

### 3. **Store Management**

- **Store List View** (`/stores`)
  - View all stores with search and filter capabilities
  - Filter by status (Active/Inactive) and billing status
  - Search by store name, owner name, or email
  - Export stores data to CSV
  - Delete stores with confirmation
  - View store details, billing status, and enabled features
- **Store Detail View** (`/stores/[id]`)
  - View complete store information
  - Manage store feature flags (enable/disable features)
  - Set resource limits (categories, products, variants, branches)
  - Update billing status and dates
  - Configure communication channels (SMS, Email, WhatsApp, Push Notifications)
- **Create New Store** (`/stores/new`)

  - Create new stores with owner credentials
  - Configure initial store settings
  - Set up owner account details
  - Generate and display owner login credentials

- **Store Permissions** (`/stores/[id]/permissions`)
  - Manage granular permissions for store staff roles
  - Group permissions by feature groups
  - Enable/disable specific permissions per store
  - Control what actions staff members can perform

### 4. **Billing & Invoice Management**

- **Invoice List** (`/billing`)
  - View all invoices across all stores
  - Filter by payment status (Paid, Pending, Overdue)
  - Create new invoices manually
  - View invoice details and payment history
- **Invoice Detail** (`/billing/[id]`)
  - View complete invoice breakdown
  - Update payment status
  - Record payment details (date, method, reference)
  - Add payment notes
  - View payment history timeline

### 5. **Feature Flags & Access Control**

- **Store-Level Features**:

  - Push Notifications
  - SMS Communication
  - WhatsApp Integration
  - Email Notifications
  - Add Options (Product customization)
  - Coupon Codes
  - App Settings
  - Customer Management
  - Employee Management
  - Home Configuration
  - Reports & Analytics
  - Branches Management
  - Categories Management
  - Products Management
  - Orders Management
  - Notifications
  - Communication Logs
  - Billing Access

- **Resource Limits**:
  - Max Categories (null = unlimited)
  - Max Products (null = unlimited)
  - Max Variants (null = unlimited)
  - Max Branches (null = unlimited)

### 6. **User Experience Features**

- **Dark Mode Support**: Full dark theme implementation
- **Responsive Design**: Mobile-first responsive layout
- **Search & Filter**: Real-time search with debouncing
- **Data Export**: CSV export functionality
- **Toast Notifications**: User-friendly success/error messages
- **Loading States**: Skeleton loaders and spinners
- **Confirmation Modals**: Safe delete operations
- **Copy to Clipboard**: Easy credential copying

## 📱 Screens & Routes

| Route                      | Screen            | Access      | Description                                                |
| -------------------------- | ----------------- | ----------- | ---------------------------------------------------------- |
| `/`                        | Home/Redirect     | Public      | Redirects to `/login` or `/dashboard` based on auth status |
| `/login`                   | Login             | Public      | Super admin authentication                                 |
| `/dashboard`               | Dashboard         | Super Admin | Platform overview and analytics                            |
| `/stores`                  | Stores List       | Super Admin | View and manage all stores                                 |
| `/stores/new`              | Create Store      | Super Admin | Create new store with owner account                        |
| `/stores/[id]`             | Store Detail      | Super Admin | Manage individual store settings and features              |
| `/stores/[id]/permissions` | Store Permissions | Super Admin | Manage granular permissions for store staff                |
| `/billing`                 | Billing List      | Super Admin | View and manage all invoices                               |
| `/billing/[id]`            | Invoice Detail    | Super Admin | View and update invoice payment status                     |

## 🔐 Role Access & Permissions

### Super Admin Role

- **Full Access**: Complete control over all platform features
- **Authentication**: JWT token-based (`superAdminToken` in localStorage)
- **Access Control**: All routes protected except `/login` and `/`
- **Session**: Persists in localStorage until logout

### Access Matrix

| Feature                  | Super Admin | Store Owner | Store Staff |
| ------------------------ | ----------- | ----------- | ----------- |
| View Dashboard           | ✅          | ❌          | ❌          |
| Create Stores            | ✅          | ❌          | ❌          |
| Edit Stores              | ✅          | ❌          | ❌          |
| Delete Stores            | ✅          | ❌          | ❌          |
| Manage Store Features    | ✅          | ❌          | ❌          |
| Manage Store Permissions | ✅          | ❌          | ❌          |
| Create Invoices          | ✅          | ❌          | ❌          |
| Update Invoice Payment   | ✅          | ❌          | ❌          |
| View All Stores          | ✅          | ❌          | ❌          |
| Export Data              | ✅          | ❌          | ❌          |

## 🗄️ Database Tables & API Endpoints

### Authentication

- **Table**: `super_admins`
- **API Endpoints**:
  - `POST /api/v1/super-admin/auth/login` - Authenticate super admin

### Stores

- **Table**: `stores`
- **API Endpoints**:
  - `GET /api/v1/super-admin/stores` - List all stores
  - `POST /api/v1/super-admin/stores` - Create new store
  - `GET /api/v1/super-admin/stores/[id]` - Get store details
  - `DELETE /api/v1/super-admin/stores/[id]` - Delete store
  - `PUT /api/v1/super-admin/stores/[id]/features` - Update store features

### Permissions

- **Table**: `permissions`, `store_permissions` (junction table)
- **API Endpoints**:
  - `GET /api/v1/super-admin/permissions` - List all permissions
  - `GET /api/v1/super-admin/permissions/store/[id]` - Get store permissions
  - `PUT /api/v1/super-admin/permissions/store/[id]` - Update store permissions

### Billing & Invoices

- **Table**: `invoices`, `invoice_payments`, `invoice_history`
- **API Endpoints**:
  - `GET /api/v1/super-admin/billing/invoices` - List all invoices
  - `POST /api/v1/super-admin/billing/invoices` - Create new invoice
  - `GET /api/v1/super-admin/billing/invoices/[id]` - Get invoice details
  - `PUT /api/v1/super-admin/billing/invoices/[id]/payment` - Update payment status

### Dashboard

- **API Endpoint**:
  - `GET /api/v1/super-admin/dashboard` - Get dashboard statistics

### Database Schema (Inferred)

-- Super Admins
super_admins (
id, email, password_hash, created_at, updated_at
)

-- Stores
stores (
store_id, store_name, owner_name, owner_email, owner_phone,
is_active, billing_status, billing_paid_until, last_billing_date,
push_notifications_enabled, sms_enabled, whatsapp_enabled, email_enabled,
max_categories, max_products, max_variants, max_branches,
add_options_enabled, coupon_codes_enabled, app_settings_enabled,
customers_enabled, employees_enabled, home_config_enabled,
reports_enabled, branches_enabled, categories_enabled,
products_enabled, orders_enabled, notifications_enabled,
communication_logs_enabled, billings_enabled,
address, city, pincode, created_at, updated_at
)

-- Permissions
permissions (
permission_id, permission_code, permission_name,
permission_description, feature_group, created_at, updated_at
)

-- Store Permissions (Junction Table)
store_permissions (
id, store_id, permission_id, store_enabled, created_at, updated_at
)

-- Invoices
invoices (
invoice_id, invoice_number, store_id, billing_month,
base_amount, sms_charges, push_notification_charges,
additional_charges, total_amount, payment_status,
due_date, payment_date, payment_method, payment_reference,
payment_notes, created_at, updated_at
)

-- Invoice History
invoice_history (
id, invoice_id, action_type, notes, created_at
)## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **API Communication**: Fetch API with custom wrapper
- **Authentication**: JWT tokens stored in localStorage

## 📦 Installation & Setup

# Install dependencies

yarn install

# Set environment variables

NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Run development server

yarn dev

# Build for production

yarn build

# Start production server

yarn start## 🔧 Environment Variables

NEXT_PUBLIC_API_BASE_URL=http://localhost:3000## 📋 Key Features by Screen

### Dashboard Screen

- **Data Source**: `/api/v1/super-admin/dashboard`
- **Features**:
  - Summary cards with key metrics
  - Top selling products table
  - Stores overview table
  - Real-time data refresh

### Stores List Screen

- **Data Source**: `/api/v1/super-admin/stores`
- **Features**:
  - Search functionality (debounced)
  - Status filtering (Active/Inactive/Billing Status)
  - CSV export
  - Delete with confirmation
  - Create new store button

### Store Detail Screen

- **Data Source**: `/api/v1/super-admin/stores/[id]`
- **Features**:
  - Store information display
  - Feature flags toggle
  - Resource limits configuration
  - Billing status management
  - Save changes functionality

### Store Permissions Screen

- **Data Source**: `/api/v1/super-admin/permissions/store/[id]`
- **Features**:
  - Grouped permissions by feature
  - Toggle individual permissions
  - Bulk save permissions
  - Permission descriptions

### Billing Screen

- **Data Source**: `/api/v1/super-admin/billing/invoices`
- **Features**:
  - Invoice list with status indicators
  - Create new invoice modal
  - Filter by payment status
  - View invoice details

### Invoice Detail Screen

- **Data Source**: `/api/v1/super-admin/billing/invoices/[id]`
- **Features**:
  - Invoice breakdown display
  - Payment status update
  - Payment details form
  - Payment history timeline

## 🔒 Security Features

- JWT token-based authentication
- Protected routes with automatic redirect
- Token stored securely in localStorage
- API requests include Authorization header
- Input validation on all forms
- Confirmation modals for destructive actions

## 📊 Data Flow

1. **Authentication Flow**:

   - User enters credentials → POST `/api/v1/super-admin/auth/login`
   - Token stored in localStorage → Redirect to dashboard

2. **Data Fetching Flow**:

   - Component mounts → Check auth token
   - If authenticated → Fetch data from API
   - Display data with loading states

3. **Update Flow**:
   - User makes changes → Form validation
   - API request with updated data → Success/Error toast
   - Refresh data if successful

## 🎨 UI/UX Features

- Modern, clean design with Tailwind CSS
- Dark mode support throughout
- Responsive mobile-first layout
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback
- Accessible form controls
- Consistent color scheme and typography

## 📝 Notes

- All API endpoints require Bearer token authentication
- Token is automatically included in request headers
- Failed requests show error messages via toast notifications
- Empty states provide helpful guidance to users
- Search functionality uses debouncing for performance
- CSV export includes filtered results only

## 🤝 Contributing

This is a private super admin portal. For issues or feature requests, please contact the development team.

## 📄 License

Proprietary - All rights reserved
