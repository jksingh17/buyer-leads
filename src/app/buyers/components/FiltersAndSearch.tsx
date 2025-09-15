// app/buyers/components/FiltersAndSearch.tsx
'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FiltersAndSearch({ initial }: { initial: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initial.q ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [propertyType, setPropertyType] = useState(initial.propertyType ?? "");
  const [status, setStatus] = useState(initial.status ?? "");
  const [timeline, setTimeline] = useState(initial.timeline ?? "");
  const [isExpanded, setIsExpanded] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      applyFilters({ q, city, propertyType, status, timeline });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, city, propertyType, status, timeline]);

  function applyFilters(values: any) {
    const params = new URLSearchParams(Object.fromEntries(searchParams.entries()));
    // reset page when filters change
    params.set("page", "1");
    if (values.q) params.set("q", values.q); else params.delete("q");
    if (values.city) params.set("city", values.city); else params.delete("city");
    if (values.propertyType) params.set("propertyType", values.propertyType); else params.delete("propertyType");
    if (values.status) params.set("status", values.status); else params.delete("status");
    if (values.timeline) params.set("timeline", values.timeline); else params.delete("timeline");

    router.replace(`/buyers?${params.toString()}`);
  }

  function reset() {
    setQ("");
    setCity("");
    setPropertyType("");
    setStatus("");
    setTimeline("");
    setIsExpanded(false);
    router.replace("/buyers");
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className={`${isExpanded ? 'block' : 'hidden'} md:block space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-3`}>
        {/* Search Input */}
        <div className="w-full md:flex-1">
          <input
            aria-label="Search by name, phone or email"
            placeholder="Search name, phone or email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Filter Dropdowns - Grid layout for mobile */}
        <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-2">
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm"
          >
            <option value="">All Cities</option>
            <option value="CHANDIGARH">Chandigarh</option>
            <option value="MOHALI">Mohali</option>
            <option value="ZIRAKPUR">Zirakpur</option>
            <option value="PANCHKULA">Panchkula</option>
            <option value="OTHER">Other</option>
          </select>

          <select 
            value={propertyType} 
            onChange={(e) => setPropertyType(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm"
          >
            <option value="">All Properties</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="PLOT">Plot</option>
            <option value="OFFICE">Office</option>
            <option value="RETAIL">Retail</option>
          </select>

          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm"
          >
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONTACTED">Contacted</option>
            <option value="VISITED">Visited</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="DROPPED">Dropped</option>
          </select>

          <select 
            value={timeline} 
            onChange={(e) => setTimeline(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm"
          >
            <option value="">All Timelines</option>
            <option value="ZERO_TO_THREE">0-3m</option>
            <option value="THREE_TO_SIX">3-6m</option>
            <option value="MORE_THAN_SIX">&gt;6m</option>
            <option value="EXPLORING">Exploring</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 md:pt-0 border-t border-gray-200 md:border-t-0">
          <button 
            onClick={() => applyFilters({ q, city, propertyType, status, timeline })} 
            className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm"
          >
            Apply
          </button>
          <button 
            onClick={reset} 
            className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}