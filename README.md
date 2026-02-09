# SplitMint 🌿

A clean, professional expense-splitting platform inspired by Splitwise. Built with modern web technologies for performance and reliability.

![SplitMint Dashboard](https://placehold.co/1200x600?text=SplitMint+Dashboard+Preview)

## 🚀 Features

- **Authentication**: Secure email/password login via NextAuth.js.
- **Groups**: Create and manage expense groups easily.
- **Expenses**: Add expenses with flexible split options:
  - **Equal Split**: Split cost evenly among selected members.
  - **Exact Amounts**: Specify exact amounts for each person.
  - **Percentage**: Split by percentage (must total 100%).
- **Balances**: Real-time calculation of "who owes who".
- **Settlements**: Minimal transaction suggestions to settle debts efficiently.
- **Dashboard**: Overview of total spending and group activities.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (e.g., from [Neon](https://neon.tech/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/splitmint.git
   cd splitmint
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   # Connect to your NeonDB (or any PostgreSQL instance)
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-random-string"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Deployment

### Vercel Deployment

1. Push your code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and sign in.
3. Click **"Add New..."** -> **"Project"**.
4. Import your `splitmint` repository.
5. In the **"Environment Variables"** section, add:
   - `DATABASE_URL`: Your production database URL.
   - `NEXTAUTH_SECRET`: A strong random string.
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://splitmint.vercel.app`).
6. Click **"Deploy"**.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
