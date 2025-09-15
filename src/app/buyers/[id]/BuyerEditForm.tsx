// src/app/buyers/[id]/BuyerEditForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { buyerCreateSchema } from "@/lib/buyer-schemas";

type Buyer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: number | null;
  budgetMax: number | null;
  timeline: string;
  source: string;
  notes: string | null;
  tags: string[];
  status: string;
  updatedAt: string;
};

export default function BuyerEditForm({ buyer }: { buyer: Buyer }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: buyer.fullName ?? "",
    email: buyer.email ?? "",
    phone: buyer.phone ?? "",
    city: buyer.city ?? "CHANDIGARH",
    propertyType: buyer.propertyType ?? "APARTMENT",
    bhk: buyer.bhk ?? "",
    purpose: buyer.purpose ?? "BUY",
    budgetMin: buyer.budgetMin ?? "",
    budgetMax: buyer.budgetMax ?? "",
    timeline: buyer.timeline ?? "ZERO_TO_THREE",
    source: buyer.source ?? "WEBSITE",
    notes: buyer.notes ?? "",
    tags: (buyer.tags || []).join(", "),
    status: buyer.status ?? "NEW",
    updatedAt: buyer.updatedAt, // concurrency token (ISO string)
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(name: string, value: any) {
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
    setServerMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setServerMessage(null);

    const payload: Buyer = {
      id: buyer.id,
      fullName: form.fullName,
      email: form.email ,
      phone: form.phone,
      city: form.city,
      propertyType: form.propertyType,
      bhk: form.bhk ,
      purpose: form.purpose,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
      timeline: form.timeline,
      source: form.source,
      notes: form.notes || null,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      status: form.status,
      updatedAt: form.updatedAt,
    };

    // local validation with Zod (optional, same schema used server-side)
    const parsed = buyerCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fld = parsed.error.flatten().fieldErrors;
      const fieldErrors: Record<string, string> = {};
      for (const key of Object.keys(fld)) {
        const k = key as keyof typeof fld;
        if (fld[k] && fld[k]![0]) fieldErrors[key] = fld[k]![0]!;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/buyers/${buyer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

type ServerError = {
  error?: string;
  message?: string;
};

const text = await res.text();
let json: ServerError | null = null;

try {
  json = text ? (JSON.parse(text) as ServerError) : null;
} catch {
  json = null;
}

if (!res.ok) {
  switch (res.status) {
    case 409:
      setServerMessage(json?.message ?? "Record changed on server. Please refresh.");
      break;
    case 400:
      setServerMessage(json?.error ?? "Validation failed on server.");
      break;
    case 401:
    case 403:
      setServerMessage("You are not allowed to perform this action.");
      break;
    default:
      setServerMessage(json?.error ?? `Save failed (${res.status})`);
      break;
  }
  setSaving(false);
  return;
}


      // success: refresh server data (page is server-rendered)
      router.refresh();
    } catch (err: unknown) {
  if (err instanceof Error) {
    setServerMessage(err.message);
  } else {
    setServerMessage("Network error");
  }
  setSaving(false);
}

  }

  const showBhk = form.propertyType === "APARTMENT" || form.propertyType === "VILLA";

  return (
    <form onSubmit={handleSave} className="space-y-6" aria-labelledby="edit-heading">
      {/* Contact Information Section */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full name <span className="text-red-500">*</span></label>
            <input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 ${
                errors.fullName ? 'border-red-500' : 'border'
              }`}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? "err-fullName" : undefined}
              required
            />
            {errors.fullName && (
              <p id="err-fullName" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 ${
                errors.email ? 'border-red-500' : 'border'
              }`}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 ${
                errors.phone ? 'border-red-500' : 'border'
              }`}
              aria-invalid={!!errors.phone}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              id="city"
              name="city"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-gray-800 border bg-white"
            >
              <option>CHANDIGARH</option>
              <option>MOHALI</option>
              <option>ZIRAKPUR</option>
              <option>PANCHKULA</option>
              <option>OTHER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Property Preferences Section */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          Property Preferences
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
            <select
              id="propertyType"
              name="propertyType"
              value={form.propertyType}
              onChange={(e) => updateField("propertyType", e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-gray-800 border bg-white"
            >
              <option>APARTMENT</option>
              <option>VILLA</option>
              <option>PLOT</option>
              <option>OFFICE</option>
              <option>RETAIL</option>
            </select>
          </div>

          {showBhk && (
            <div>
              <label htmlFor="bhk" className="block text-sm font-medium text-gray-700 mb-1">BHK</label>
              <select
                id="bhk"
                name="bhk"
                value={form.bhk}
                onChange={(e) => updateField("bhk", e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-gray-800 border bg-white"
              >
                <option value="">— select —</option>
                <option>STUDIO</option>
                <option>ONE</option>
                <option>TWO</option>
                <option>THREE</option>
                <option>FOUR</option>
              </select>
              {errors.bhk && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.bhk}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-gray-800 border bg-white"
            >
              <option>NEW</option>
              <option>QUALIFIED</option>
              <option>CONTACTED</option>
              <option>VISITED</option>
              <option>NEGOTIATION</option>
              <option>CONVERTED</option>
              <option>DROPPED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget & Timeline Section */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
          Budget & Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budgetMin" className="block text-sm font-medium text-gray-700 mb-1">Budget min (₹)</label>
            <div className="relative mt-1 rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                id="budgetMin"
                name="budgetMin"
                inputMode="numeric"
                value={form.budgetMin}
                onChange={(e) => updateField("budgetMin", e.target.value)}
                className={`block w-full pl-8 pr-3 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 text-gray-800 ${
                  errors.budgetMin ? 'border-red-500' : 'border'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.budgetMin && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.budgetMin}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="budgetMax" className="block text-sm font-medium text-gray-700 mb-1">Budget max (₹)</label>
            <div className="relative mt-1 rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                id="budgetMax"
                name="budgetMax"
                inputMode="numeric"
                value={form.budgetMax}
                onChange={(e) => updateField("budgetMax", e.target.value)}
                className={`block w-full pl-8 pr-3 py-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 text-gray-800 ${
                  errors.budgetMax ? 'border-red-500' : 'border'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.budgetMax && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.budgetMax}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
            <select
              id="timeline"
              name="timeline"
              value={form.timeline}
              onChange={(e) => updateField("timeline", e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 text-gray-800 border bg-white"
            >
              <option value="ZERO_TO_THREE">0-3 months</option>
              <option value="THREE_TO_SIX">3-6 months</option>
              <option value="MORE_THAN_SIX">More than 6 months</option>
              <option value="EXPLORING">Exploring options</option>
            </select>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              id="source"
              name="source"
              value={form.source}
              onChange={(e) => updateField("source", e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 text-gray-800 border bg-white"
            >
              <option>WEBSITE</option>
              <option>REFERRAL</option>
              <option>WALK_IN</option>
              <option>CALL</option>
              <option>OTHER</option>
            </select>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Additional Information
        </h3>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-gray-800 border min-h-[100px]"
            placeholder="Add any additional notes about this buyer..."
          />
        </div>

        <div className="mt-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={(e) => updateField("tags", e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-gray-800 border"
            placeholder="Enter comma-separated tags (e.g., premium, urgent, first-time)"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>
      </div>

      {/* hidden concurrency token */}
      <input type="hidden" name="updatedAt" value={form.updatedAt} />

      {/* server / action responses */}
      {serverMessage && (
        <div role="status" className="rounded-lg p-4 bg-red-50 border border-red-200 text-gray-800 text-red-700 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{serverMessage}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-gray-800">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
        
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition duration-200 text-gray-800"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}