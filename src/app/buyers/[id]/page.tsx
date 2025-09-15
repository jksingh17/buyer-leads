import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BuyerEditFormWrapper from "./BuyerEditFormWrapper";

// Use Promise for params to match Next.js 14+ types
type Props = { params: Promise<{ id: string }> };

export default async function BuyerPage({ params }: Props) {
  // Await the params to resolve the Promise
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const buyer = await prisma.buyers.findUnique({
    where: { id },
    include: {
      buyer_history: { orderBy: { changedAt: "desc" }, take: 5 },
    },
  });

  if (!buyer) return notFound();

  // convert dates to ISO strings for the client form
  const clientBuyer = {
    ...buyer,
    createdAt: buyer.createdAt.toISOString(),
    updatedAt: buyer.updatedAt.toISOString(),
    buyer_history: buyer.buyer_history.map((h: any) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
    })),
  };

  // Function to format timeline for display
  const formatTimeline = (timeline: string) => {
    const timelineMap: Record<string, string> = {
      ZERO_TO_THREE: "0-3 months",
      THREE_TO_SIX: "3-6 months",
      MORE_THAN_SIX: "6+ months",
      EXPLORING: "Exploring options"
    };
    return timelineMap[timeline] || timeline;
  };

  // Function to format budget for display
  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return "—";
    if (!min) return `Up to ₹${max?.toLocaleString()}`;
    if (!max) return `₹${min.toLocaleString()}+`;
    return `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Buyer Details</h1>
            <p className="text-gray-600 mt-1">Manage and track buyer information</p>
          </div>
        </div>

        {/* Summary card */}
        <section className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold leading-tight">{buyer.fullName}</h1>
                <p className="text-blue-100 opacity-90 mt-1">{buyer.email ?? "No email provided"}</p>
              </div>

              <div className="text-blue-100 text-sm bg-blue-500/20 p-3 rounded-lg">
                <div>Last updated: <span className="font-medium">{new Date(buyer.updatedAt).toLocaleString()}</span></div>
                <div className="mt-1">Assigned to: <span className="font-medium">{buyer.ownerId}</span></div>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Contact Info</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{buyer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{buyer.city}</span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Budget & Timeline</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{formatBudget(buyer.budgetMin, buyer.budgetMax)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V极" clipRule="evenodd" />
                  </svg>
                  <span>{formatTimeline(buyer.timeline)}</span>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 极 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 极 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2极2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Property Preferences</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{buyer.propertyType}</span>
                </div>
                {buyer.bhk && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">BHK:</span>
                    <span>{buyer.bhk}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Purpose:</span>
                  <span>{buyer.purpose}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit card */}
          <section className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828极" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Lead Details</h2>
            </div>
            <BuyerEditFormWrapper buyer={clientBuyer} />
          </section>

          {/* History card */}
          <section className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap极2 mb-4">
              <div className="p-2 bg-purple-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>

            {clientBuyer.buyer_history.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 极 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 mt-2">No activity recorded yet</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {clientBuyer.buyer_history.map((h: any) => (
                  <li key={h.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <svg xmlns="http极www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0极4a1 1 0 00.293.707l2.828 2.829a1 1 极 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-gray-900">{new Date(h.changedAt).toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">By: {h.changedBy}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-800 bg-blue-50 p-3 rounded-lg border border-blue-100 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(h.diff, null, 2)}</pre>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}