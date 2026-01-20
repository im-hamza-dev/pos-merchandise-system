# POS & Merchandise System

A comprehensive Point of Sale (POS) and Merchandise Management System built with Next.js, designed for clubs and organizations to manage in-person sales, inventory, and promotional content.

## Overview

This application enables clubs to:
- Sell physical goods in person through a streamlined checkout workflow
- Manage a complete merchandise catalog with inventory tracking
- Control front-end promotional visibility with banner management
- Maintain auditable sales records and transaction history
- Configure system settings including tax rates and discount rules

**Note:** This application currently uses **mock/dummy data** for development and demonstration purposes. The service layer is designed to be easily scalable for integration with real API endpoints in the future.

## Tech Stack

### Core Framework
- **Next.js 16.1.3** (App Router) - React framework with server-side rendering
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe development

### State Management
- **Zustand 5.0.10** - Lightweight state management with localStorage persistence
- **Axios 1.13.2** - HTTP client for API service layer

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI primitives
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library

### Data Visualization
- **Recharts 3.6.0** - Charting library for analytics and reports

### Additional Libraries
- **date-fns 4.1.0** - Date utility functions
- **Sonner 2.0.7** - Toast notifications
- **React Hook Form 7.71.1** - Form handling
- **Zod 4.3.5** - Schema validation

## Major Features

### 1. Checkout Module
The primary workflow for front-desk staff to complete in-person sales.

**Features:**
- Product search and category filtering
- Real-time cart management (add, remove, update quantities)
- Customer selection (member or guest)
- Member discount calculation (configurable percentage)
- Tax calculation (configurable rate)
- Multiple payment methods
- Active banner display with linked product promotion
- Inventory decrement on successful checkout
- Transaction record creation

### 2. Catalog Management
Complete product and inventory management system.

**Product Management:**
- Create, edit, and delete products
- Product details (name, description, price, images)
- Variant support (size, color, custom options)
- Inventory tracking with stock levels
- Reorder threshold alerts
- Product status (active, hidden, out-of-stock)
- Promotion management (promote products, set priority, custom labels)
- Category assignment

**Category Management:**
- Create and manage product categories
- Category visibility control
- Display order management

**Inventory Management:**
- Real-time stock tracking
- Manual inventory adjustments with reason tracking
- Low stock and out-of-stock alerts
- Inventory activity audit trail

### 3. Banner Management
Control front-end visual promotions and messaging.

**Features:**
- Create static banners (image, headline, subtext, CTA link)
- Create product-based banners (linked to promoted products)
- Banner activation/deactivation
- Date range scheduling (start/end dates)
- Priority-based ordering
- Display on checkout page with linked products

### 4. Sales & Transactions
Complete transaction history and management.

**Features:**
- View all transactions with filtering
- Transaction details (items, customer, payment method, totals)
- Filter by customer type (member/guest) and payment method
- Pickup management (pending, completed, cancelled)
- Refund processing (permission-based)
- Transaction audit trail

### 5. Settings & Reports
System configuration and analytics.

**Settings:**
- Tax rate configuration
- Member discount percentage
- Default reorder threshold
- All changes logged for audit

**Reports:**
- Sales by date
- Sales by category
- Top-selling products
- Member vs. guest spend analysis
- Inventory movement reports

### 6. Overview Dashboard
Real-time analytics and key metrics.

**Metrics:**
- Total revenue
- Total transactions
- Low stock items count
- Out of stock items count

**Charts:**
- Sales by date (line chart)
- Sales by category (bar chart)
- Member vs. guest spend (pie chart)

## Role-Based Access Control

The application implements a comprehensive role-based access control (RBAC) system with three distinct roles:

### Staff Role
**Access:**
- ✅ Checkout (primary workflow)
- ✅ Overview dashboard
- ✅ Catalog (view-only)
- ✅ Sales (view-only)

**Restrictions:**
- ❌ Cannot edit products or categories
- ❌ Cannot access Banners
- ❌ Cannot issue refunds or cancel pickups
- ❌ Cannot access Settings

### Manager Role
**Access:**
- ✅ All Staff permissions, plus:
- ✅ Catalog (full edit access)
- ✅ Banners management
- ✅ Sales (with refund and pickup cancellation)
- ✅ Settings

**Capabilities:**
- Full product and category management
- Banner creation and management
- Transaction refunds
- Pickup cancellation
- System settings configuration

### Owner Role
**Access:**
- ✅ All Manager permissions
- ✅ Full system access

**Note:** Currently, Owner and Manager have identical permissions, but the structure allows for future differentiation.

### Implementation Details

- **Role Selection:** Users select their role on the login page
- **Persistent Storage:** Role is stored in localStorage via Zustand persist middleware
- **Route Protection:** Protected routes redirect to login if no role is selected
- **UI Adaptation:** Navigation and action buttons are conditionally rendered based on permissions
- **Permission Checks:** Granular permission checks throughout the application

## Data Architecture

### Mock Data
The application currently uses mock data stored in `lib/mock-data/index.ts`:
- Mock products with variants
- Mock categories
- Mock customers (members and guests)
- Mock transactions
- Mock banners

### Service Layer
The service layer (`lib/api/services/`) is designed for easy migration to real APIs:
- **Modular Services:** Separate service files for each module (checkout, catalog, banners, sales, settings)
- **Axios Integration:** Ready for API endpoint integration
- **Type Safety:** Full TypeScript support
- **Error Handling:** Structured for API error responses

### State Management
- **Zustand Stores:** Module-based stores for checkout, catalog, banners, sales, and settings
- **Local Persistence:** Auth store persists role selection in localStorage
- **Reactive Updates:** Components automatically update when store state changes

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pos-merchandise-system
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Select a role on the login page to begin:
   - **Staff** - Redirects to Checkout
   - **Manager/Owner** - Redirects to Overview dashboard

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
pos-merchandise-system/
├── app/                    # Next.js App Router pages
│   ├── checkout/          # Checkout module
│   ├── catalog/            # Catalog management
│   ├── banners/            # Banner management
│   ├── sales/              # Sales & transactions
│   ├── settings/           # Settings & reports
│   ├── login/              # Role selection/login
│   └── page.tsx            # Overview dashboard
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── auth/               # Authentication components
│   └── catalog/             # Catalog-specific components
├── lib/
│   ├── api/
│   │   └── services/       # API service layer (mock data)
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types.ts            # TypeScript type definitions
│   └── mock-data/          # Mock data for development
└── public/                 # Static assets
```

## Key Design Decisions

1. **Service-Based Architecture:** Separation of concerns with dedicated service files for each module
2. **Mock Data First:** Development with mock data, designed for easy API integration
3. **Type Safety:** Full TypeScript coverage for maintainability
4. **Component Reusability:** shadcn/ui components customized with Tailwind
5. **Permission-Based UI:** Dynamic UI rendering based on user role
6. **Local Storage Persistence:** Role selection persists across sessions

 
---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**
