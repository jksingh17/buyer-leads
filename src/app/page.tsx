// app/page.tsx
import Link from "next/link";
import { getCurrentUserServer } from "@/lib/auth";
import React from "react";
import LogoutButton from "./components/LogoutButton"; // client component

export default async function HomePage() {
  const user = await getCurrentUserServer();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              RealEstate CRM
            </h1>
            <p className="mt-2 text-gray-600">
              Capture, manage and import/export buyer leads with our powerful CRM system
            </p>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name ?? user.email}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="ml-2">
                  <StatusBadge text="Signed in" />
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Sign in (Demo)
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Feature Cards - Only show for authenticated users */}
        {user ? (
          <section className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
            <Card 
              title="Leads Management" 
              description="View, search and manage all your buyer leads in one place" 
              to="/buyers" 
              cta="View Leads"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              }
            />
            <Card
              title="Create New Lead"
              description="Add a new buyer lead with comprehensive form validation"
              to="/buyers/new"
              cta="Create Lead"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              }
            />
            <Card
              title="Import & Export"
              description="Upload CSV files or export filtered lists for data management"
              to="/buyers"
              cta="Data Tools"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            />
          </section>
        ) : (
          <section className="bg-white rounded-xl p-8 shadow-lg mb-10 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to access the lead management features</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Sign In Now
              </Link>
            </div>
          </section>
        )}

        {/* Quick Start Guide */}
        <section className="bg-white rounded-xl p-6 shadow-sm mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Getting Started Guide
          </h2>
          <ol className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
              <span className="text-gray-700">Sign in using the demo login on the <Link href="/login" className="text-blue-600 font-medium">login page</Link></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
              <span className="text-gray-700">Create a new lead using the comprehensive form at <Link href="/buyers/new" className="text-blue-600 font-medium">/buyers/new</Link></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
              <span className="text-gray-700">View and filter all leads at <Link href="/buyers" className="text-blue-600 font-medium">/buyers</Link></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-6 w-6 flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
              <span className="text-gray-700">Use CSV import/export features from the buyers page for bulk operations</span>
            </li>
          </ol>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Note: This is a development demo. In production, ensure proper authentication, session security, and cookie protection.</span>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span>Built with Next.js</span>
            <span>•</span>
            <span>Prisma</span>
            <span>•</span>
            <span>Zod</span>
          </div>
          <p>© {new Date().getFullYear()} RealEstate CRM. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

/* ---------- Small helper components (server-side) ---------- */

function StatusBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
      {text}
    </span>
  );
}

function Card({
  title,
  description,
  to,
  cta,
  icon,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {icon}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <div className="mt-4">
        <Link
          href={to}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium rounded-lg hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 border border-blue-200"
        >
          {cta}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}