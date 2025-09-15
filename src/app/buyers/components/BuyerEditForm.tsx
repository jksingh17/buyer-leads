// components/BuyerEditForm.tsx
"use client";

import React, { useState } from "react";
import { buyerCreateSchema} from "@/lib/buyer-schemas";
import { useRouter } from "next/navigation";

export default function BuyerEditForm({ buyer }: any) {
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
    tags: (buyer.tags || []).join(","),
    status: buyer.status ?? "NEW",
    updatedAt: buyer.updatedAt,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  }

  async function handleSave(e: React.FormEvent) {
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
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : undefined,
      status: form.status,
      updatedAt: form.updatedAt,
    };

    const parsed = buyerCreateSchema.safeParse(payload);
    if (!parsed.success) {
      const fld = parsed.error.flatten().fieldErrors;
      const errs: Record<string, string> = {};
      for (const k of Object.keys(fld)) {
        const arr = (fld as Record<string, string[] | undefined>)[k];
        if (arr && arr[0]) errs[k] = arr[0];
      }
      setErrors(errs);
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

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setServerError(json?.message || "Record changed on server. Please refresh.");
        } else {
          setServerError(json?.error || "Failed to save");
        }
        setSaving(false);
        return;
      }

      // Update the form with the latest data including the new updatedAt timestamp
      if (json.buyer) {
        setForm(prev => ({
          ...prev,
          updatedAt: json.buyer.updatedAt,
          // Update other fields that might have been modified by the server
          ...json.buyer
        }));
      }
      
      // Show success message temporarily
      setServerError("Changes saved successfully!");
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setServerError(null);
      }, 2000);
      
    } catch (err: any) {
      setServerError(err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  const showBhk = form.propertyType === "APARTMENT" || form.propertyType === "VILLA";

  return (
    <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Full name</label>
          <input 
            name="fullName" 
            value={form.fullName} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
          />
          {errors.fullName && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.fullName}
          </p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
          <input 
            name="email" 
            value={form.email} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
          />
          {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.email}
          </p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Phone</label>
          <input 
            name="phone" 
            value={form.phone} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
          />
          {errors.phone && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.phone}
          </p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">City</label>
          <select 
            name="city" 
            value={form.city} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          >
            <option>CHANDIGARH</option>
            <option>MOHALI</option>
            <option>ZIRAKPUR</option>
            <option>PANCHKULA</option>
            <option>OTHER</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Property Type</label>
          <select 
            name="propertyType" 
            value={form.propertyType} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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
            <label className="block text-sm font-medium text-gray-800 mb-2">BHK</label>
            <select 
              name="bhk" 
              value={form.bhk} 
              onChange={onChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">— Select —</option>
              <option>STUDIO</option>
              <option>ONE</option>
              <option>TWO</option>
              <option>THREE</option>
              <option>FOUR</option>
            </select>
            {errors.bhk && <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.bhk}
            </p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-2">Status</label>
          <select 
            name="status" 
            value={form.status} 
            onChange={onChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
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

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-2">Notes</label>
        <textarea 
          name="notes" 
          value={form.notes} 
          onChange={onChange} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 min-h-[120px]" 
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <button 
          type="submit" 
          disabled={saving} 
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-sm hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition duration-200 flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Save changes
            </>
          )}
        </button>
        <button 
          type="button" 
          onClick={() => router.refresh()} 
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
        >
          Refresh
        </button>
      </div>

      {serverError && (
        <div className={`p-3 rounded-lg ${serverError.includes("successfully") ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
          <div className="flex items-center gap-2">
            {serverError.includes("successfully") ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {serverError}
          </div>
        </div>
      )}
    </form>
  );
}