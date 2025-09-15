import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserServer } from "@/lib/auth";
import FiltersAndSearch from "./components/FiltersAndSearch";

const PAGE_SIZE = 10;

function getSearchParam(
  params: { [key: string]: string | string[] | undefined }, 
  key: string
): string | undefined {
  const value = params[key];
  return typeof value === 'string' ? value : Array.isArray(value) ? value[0] : undefined;
}
export default async function BuyersPage({
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await searchParams;
  const _user = await getCurrentUserServer();
  const page = Number(getSearchParam(resolvedSearchParams, 'page') || '1');
  const q = getSearchParam(resolvedSearchParams, 'q') || '';
  const city = getSearchParam(resolvedSearchParams, 'city');
  const propertyType = getSearchParam(resolvedSearchParams, 'propertyType');
  const status = getSearchParam(resolvedSearchParams, 'status');
  const timeline = getSearchParam(resolvedSearchParams, 'timeline');


  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, buyers] = await Promise.all([
    prisma.buyers.count({ where }),
    prisma.buyers.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Buyer Leads</h1>
              <p className="text-gray-600 mt-2">Manage and track all your potential buyers in one place</p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`/api/buyers/export?${serializeParams({ q, city, propertyType, status, timeline })}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Export CSV
              </a>
              <Link 
                href="/buyers/new" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create Lead
              </Link>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <section className="mb-6">
          <FiltersAndSearch initial={{ q, city, propertyType, status, timeline }} />
        </section>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-800">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(buyers) && buyers.length > 0 ? (
                  buyers.map((b: any) => {
                    const id = String(b?.id ?? "");
                    const fullName = b?.fullName ?? "—";
                    const phone = b?.phone ?? "—";
                    const email = b?.email ?? "";
                    const city = String(b?.city ?? "");
                    const propertyType = String(b?.propertyType ?? "");
                    const budgetMin = b?.budgetMin ?? null;
                    const budgetMax = b?.budgetMax ?? null;
                    const timeline = String(b?.timeline ?? "");
                    const status = String(b?.status ?? "");
                    const updatedAtRaw = b?.updatedAt ?? null;
                    const updatedAt = updatedAtRaw ? new Date(String(updatedAtRaw)).toLocaleString() : "—";

                    return (
                      <tr key={id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-800">{fullName}</div>
                              {email && <div className="text-xs text-gray-600">{email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{propertyType}</div>
                          {b.bhk && <div className="text-xs text-gray-600">{b.bhk} BHK</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{budgetText(budgetMin, budgetMax)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{formatTimeline(timeline)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">{updatedAt}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            href={`/buyers/${id}`} 
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-800 mb-1">No leads found</h3>
                        <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Pagination current={page} total={totalPages} baseParams={{ q, city, propertyType, status, timeline }} />
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

function budgetText(min?: number | null, max?: number | null) {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  if (min != null) return `₹${min.toLocaleString()}+`;
  return `Up to ₹${max?.toLocaleString()}`;
}

function formatTimeline(timeline: string) {
  const timelineMap: Record<string, string> = {
    ZERO_TO_THREE: "0-3 months",
    THREE_TO_SIX: "3-6 months",
    MORE_THAN_SIX: "6+ months",
    EXPLORING: "Exploring"
  };
  return timelineMap[timeline] || timeline;
}

function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    QUALIFIED: "bg-purple-100 text-purple-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    VISITED: "bg-orange-100 text-orange-800",
    NEGOTIATION: "bg-indigo-100 text-indigo-800",
    CONVERTED: "bg-green-100 text-green-800",
    DROPPED: "bg-red-100 text-red-800"
  };
  return statusColors[status] || "bg-gray-100 text-gray-800";
}

function serializeParams(params: Record<string, any>) {
  const url = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") url.set(k, String(v));
  });
  return url.toString();
}

/* ---------- pagination (server-rendered links) ---------- */
function Pagination({ current, total, baseParams }: { current: number; total: number; baseParams: any }) {
  const canPrev = current > 1;
  const canNext = current < total;

  const base = serializeParams(baseParams);

  if (total <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
      <div className="text-sm text-gray-800">
        Showing page <span className="font-semibold">{current}</span> of <span className="font-semibold">{total}</span>
      </div>
      <div className="flex gap-2">
        <Link 
          href={`/buyers?${base}&page=${Math.max(1, current - 1)}`} 
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 ${canPrev ? "text-gray-800 bg-white hover:bg-gray-50" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </Link>
        <Link 
          href={`/buyers?${base}&page=${Math.min(total, current + 1)}`} 
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 ${canNext ? "text-gray-800 bg-white hover:bg-gray-50" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}