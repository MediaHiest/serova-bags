"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

export default function AdminInquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/admin/inquiries/${id}`);
    const data = await res.json();
    setInquiry(data.inquiry ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function updateStatus(status: Inquiry["status"]) {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function deleteInquiry() {
    if (!confirm("Delete this inquiry?")) return;
    await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    router.push("/admin/inquiries");
  }

  if (loading) return <p className="text-text-muted">Loading...</p>;
  if (!inquiry) return <p className="text-text-muted">Inquiry not found</p>;

  return (
    <div>
      <Link
        href="/admin/inquiries"
        className="text-sm text-text-muted hover:text-text-dark mb-4 inline-block"
      >
        ← Back to Inquiries
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-text-dark">{inquiry.subject}</h1>
          <p className="text-sm text-text-muted mt-1">
            {new Date(inquiry.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`self-start text-xs px-2.5 py-1 rounded ${
            inquiry.status === "NEW"
              ? "bg-blue-100 text-blue-800"
              : inquiry.status === "RESOLVED"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          {inquiry.status}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="admin-card space-y-4">
          <h2 className="text-sm tracking-widest uppercase text-text-dark">Customer</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{inquiry.name}</p>
            <p>
              <a href={`mailto:${inquiry.email}`} className="text-text-muted underline">
                {inquiry.email}
              </a>
            </p>
            {inquiry.phone && (
              <p>
                <a href={`tel:${inquiry.phone}`} className="text-text-muted underline">
                  {inquiry.phone}
                </a>
              </p>
            )}
          </div>

          <h2 className="text-sm tracking-widest uppercase text-text-dark pt-2">Message</h2>
          <p className="text-sm text-text-dark leading-relaxed whitespace-pre-line">
            {inquiry.message}
          </p>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="text-sm tracking-widest uppercase text-text-dark">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {(["NEW", "READ", "RESOLVED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => updateStatus(s)}
                className={`text-xs px-3 py-1.5 rounded border ${
                  inquiry.status === s
                    ? "bg-text-dark text-white border-text-dark"
                    : "border-text-dark/20 text-text-dark hover:border-text-dark"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-text-dark/10">
            <a href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject)}`} className="btn-primary inline-block text-xs py-2 px-4">
              Reply via Email
            </a>
          </div>

          <button
            type="button"
            onClick={deleteInquiry}
            className="text-xs text-red-600 underline pt-2"
          >
            Delete inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
