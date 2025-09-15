// app/page.tsx
import Link from "next/link";
import { getCurrentUserServer } from "@/lib/auth";
import React from "react";
import LogoutButton from "./components/LogoutButton"; // client component

export default async function HomePage() {
  const user = await getCurrentUserServer();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              RealEstate CRM
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Capture, manage and import/export buyer leads with our powerful CRM system
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {user ? (
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[120px] sm:max-w-none">
                      {user.name ?? user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge text="Signed in" />
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base"
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
          <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10">
            <Card 
              title="Leads Management" 
              description="View, search and manage all your buyer leads in one place" 
              to="/buyers" 
              cta="View Leads"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 极 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414极3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            />
          </section>
        ) : (
          <section className="bg-white rounded-xl p-6 shadow-lg mb-8 sm:mb-10 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg xmlns="http://www.w3.org/2000/s极" className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">Authentication Required</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Please sign in to access the lead management features</p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                Sign In Now
              </Link>
            </div>
          </section>
        )}

        {/* Quick Start Guide */}
        <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6极3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-极 3z" />
            </svg>
            Getting Started Guide
          </h2>
          <ol className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5">1</span>
              <span className="text-sm sm:text-base text-gray-700">Sign in using the demo login on the <Link href="/login" className="text-blue-600 font-medium">login page</Link></span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5">2</span>
              <span className="text-sm sm:text-base text-gray-700">Create a new lead using the comprehensive form at <Link href="/buyers/new" className="text-blue-600 font-medium">/buyers/new</Link></span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5">3</span>
              <span className="text-sm sm:text-base text-gray-700">View and filter all leads at <Link href="/buyers" className="text-blue-600 font-medium">/buyers</Link></span>
            </li>
            <li className="flex items-start gap-2 sm:gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 mt-0.5">4</span>
              <span className="text-sm sm:text-base text-gray-700">Use CSV import/export features from the buyers page for bulk operations</span>
            </li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="text-center text-xs sm:text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-2">
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
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
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
    <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm border border-gray-200 hover:shadow-md transition duration-200">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">{title}</h3>
        {icon}
      </div>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{description}</p>
      <div className="mt-3 sm:mt-4">
        <Link
          href={to}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium rounded-lg hover:from-blue-100 hover:to-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 border border-blue-200 text-sm sm:text-base"
        >
          {cta}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}