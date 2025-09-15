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
    router.replace("/buyers");
  }

  return (
    <div className="rounded bg-white p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <input
          aria-label="Search by name, phone or email"
          placeholder="Search name, phone or email"
          className="rounded border px-3 py-2 text-gray-800 text-gray-800"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded border px-2 py-2 text-gray-800">
          <option value="">City</option>
          <option value="CHANDIGARH">Chandigarh</option>
          <option value="MOHALI">Mohali</option>
          <option value="ZIRAKPUR">Zirakpur</option>
          <option value="PANCHKULA">Panchkula</option>
          <option value="OTHER">Other</option>
        </select>

        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="rounded border px-2 py-2 text-gray-800">
          <option value="">Property</option>
          <option value="APARTMENT">Apartment</option>
          <option value="VILLA">Villa</option>
          <option value="PLOT">Plot</option>
          <option value="OFFICE">Office</option>
          <option value="RETAIL">Retail</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded border px-2 py-2 text-gray-800">
          <option value="">Status</option>
          <option value="NEW">New</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="CONTACTED">Contacted</option>
          <option value="VISITED">Visited</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="CONVERTED">Converted</option>
          <option value="DROPPED">Dropped</option>
        </select>

        <select value={timeline} onChange={(e) => setTimeline(e.target.value)} className="rounded border px-2 py-2 text-gray-800">
          <option value="">Timeline</option>
          <option value="ZERO_TO_THREE">0-3m</option>
          <option value="THREE_TO_SIX">3-6m</option>
          <option value="MORE_THAN_SIX">&gt;6m</option>
          <option value="EXPLORING">Exploring</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => applyFilters({ q, city, propertyType, status, timeline })} className="rounded border px-3 py-2 text-gray-800">
          Apply
        </button>
        <button onClick={reset} className="rounded border px-3 py-2 text-gray-800">
          Reset
        </button>
      </div>
    </div>
  );
}
