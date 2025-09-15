// app/buyers/new/page.tsx
"use client";

import React, { useState } from "react";
import { buyerCreateValidated } from "@/lib/buyer-schemas";
import { useRouter } from "next/navigation";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  source: string;
  notes: string;
  tags: string;
};

export default function NewBuyerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    city: "CHANDIGARH",
    propertyType: "APARTMENT",
    bhk: "",
    purpose: "BUY",
    budgetMin: "",
    budgetMax: "",
    timeline: "ZERO_TO_THREE",
    source: "WEBSITE",
    notes: "",
    tags: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const payload: any = {
      fullName: form.fullName,
      email: form.email || undefined,
      phone: form.phone,
      city: form.city,
      propertyType: form.propertyType,
      bhk: form.bhk || undefined,
      purpose: form.purpose,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      timeline: form.timeline,
      source: form.source,
      notes: form.notes || undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    };

    const result = buyerCreateValidated.safeParse(payload);
    if (!result.success) {
      const zErr = result.error.flatten();
      const fieldErrors: Record<string, string> = {};
      for (const [k, v] of Object.entries(zErr.fieldErrors)) {
        if (v && v.length) fieldErrors[k] = v[0];
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) {
        setServerError(json?.error || "Failed to create buyer");
        setSubmitting(false);
        return;
      }

      const id = json?.buyer?.id;
      if (id) {
        router.push(`/buyers/${id}`);
      } else {
        router.push("/buyers");
      }
    } catch (err: any) {
      setServerError(err?.message || "Network error");
      setSubmitting(false);
    }
  }

  const showBhk = form.propertyType === "APARTMENT" || form.propertyType === "VILLA";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Buyer Lead</h1>
          <p className="text-gray-600">Fill in the details below to create a new buyer profile</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-xl font-semibold">Buyer Information</h2>
            <p className="text-blue-100 opacity-90">Enter the primary details of the potential buyer</p>
          </div>
          
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full name <span className="text-red-500">*</span></label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border ${
                    errors.fullName ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter full name"
                />
                {errors.fullName && <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.fullName}
                </p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  className={`mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">City</label>
                <select
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
                >
                  <option>CHANDIGARH</option>
                  <option>MOHALI</option>
                  <option>ZIRAKPUR</option>
                  <option>PANCHKULA</option>
                  <option>OTHER</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Property type</label>
                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={onChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
                  >
                    <option>APARTMENT</option>
                    <option>VILLA</option>
                    <option>PLOT</option>
                    <option>OFFICE</option>
                    <option>RETAIL</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <select
                    name="purpose"
                    value={form.purpose}
                    onChange={onChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
                  >
                    <option>BUY</option>
                    <option>RENT</option>
                  </select>
                </div>

                {showBhk && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">BHK</label>
                    <select
                      name="bhk"
                      value={form.bhk}
                      onChange={onChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
                    >
                      <option value="">— select —</option>
                      <option>STUDIO</option>
                      <option>ONE</option>
                      <option>TWO</option>
                      <option>THREE</option>
                      <option>FOUR</option>
                    </select>
                    {errors.bhk && <p className="text-sm text-red-600 mt-1 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.bhk}
                    </p>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Budget min (INR)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    name="budgetMin"
                    value={form.budgetMin}
                    onChange={onChange}
                    className="block w-full pl-7 pr-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Budget max (INR)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    name="budgetMax"
                    value={form.budgetMax}
                    onChange={onChange}
                    className={`block w-full pl-7 pr-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border ${
                      errors.budgetMax ? 'border-red-500' : ''
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.budgetMax && <p className="text-sm text-red-600 mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.budgetMax}
                </p>}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Timeline</label>
                  <select 
                    name="timeline" 
                    value={form.timeline} 
                    onChange={onChange} 
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
                  >
                    <option value="ZERO_TO_THREE">0-3 months</option>
                    <option value="THREE_TO_SIX">3-6 months</option>
                    <option value="MORE_THAN_SIX">More than 6 months</option>
                    <option value="EXPLORING">Just exploring</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <select 
                    name="source" 
                    value={form.source} 
                    onChange={onChange} 
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border bg-white"
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={onChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border min-h-[100px]"
                placeholder="Add any additional notes about this buyer..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <input
                name="tags"
                value={form.tags}
                onChange={onChange}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 p-3 border"
                placeholder="Enter comma-separated tags (e.g., premium, urgent, first-time)"
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>

            {serverError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{serverError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/buyers")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition duration-200"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Lead...
                  </>
                ) : (
                  <>Create Buyer Lead</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}