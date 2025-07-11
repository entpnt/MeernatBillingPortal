# Meernat Billing Portal

A modern billing portal for service providers and network operators, built with React, TypeScript, and Vite.

## Features

- **Clerk Authentication**: Secure user authentication and management
- **Role-based Dashboard**: Different views for Service Providers and Network Operators
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Data**: Integration with Supabase for real-time updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Clerk account for authentication
- Supabase project (optional, for backend features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MeernatBillingPortal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication (Required)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Tempo Devtools (Optional)
VITE_TEMPO=true
```

### Setting up Clerk

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application in your Clerk dashboard
3. Copy your publishable key from the Clerk dashboard
4. Add the key to your `.env` file as `VITE_CLERK_PUBLISHABLE_KEY`

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Usage

1. **Authentication**: Users sign in through the Clerk authentication system
2. **Role Selection**: After signing in, users select their role (Service Provider or Network Operator)
3. **Dashboard Access**: Users are taken to their appropriate dashboard based on their selected role
4. **Role Switching**: Users can switch between roles or sign out at any time

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── LoginPage.tsx # Clerk login component
│   ├── home.tsx      # Main dashboard with role selection
│   └── ...
├── types/            # TypeScript type definitions
└── ...
```

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Clerk** for authentication
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Supabase** for backend services (optional)

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
