"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
}

const statusStyles: Record<Inquiry["status"], string> = {
  NEW: "bg-blue-100 text-blue-800",
  READ: "bg-gray-100 text-gray-700",
  RESOLVED: "bg-green-100 text-green-800",
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/inquiries?${params}`);
    const data = await res.json();
    setInquiries(data.inquiries ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    load();
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-medium text-text-dark mb-6 sm:mb-8">
        Contact Inquiries
      </h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <input
          className="input-field sm:max-w-xs flex-1 min-w-0"
          placeholder="Search name, email, subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input-field sm:max-w-[160px] w-full sm:w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <button type="submit" className="btn-primary text-xs py-2 px-4 w-full sm:w-auto shrink-0">
          Search
        </button>
      </form>

      <div className="admin-card overflow-x-auto -mx-4 sm:mx-0 rounded-none sm:rounded-lg">
        {inquiries.length === 0 ? (
          <p className="text-text-muted text-sm py-4">No inquiries yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b text-left text-text-muted">
                <th className="pb-3 pr-4">From</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="underline font-medium">
                      {inquiry.name}
                    </Link>
                    <p className="text-xs text-text-muted mt-0.5">{inquiry.email}</p>
                  </td>
                  <td className="py-3 pr-4 max-w-[240px] truncate">{inquiry.subject}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded ${statusStyles[inquiry.status]}`}>
                      {inquiry.status}
                    </span>
                  </td>
                  <td className="py-3">{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
