"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountPageHeader from "@/components/store/account/AccountPageHeader";
import AccountLoading from "@/components/store/account/AccountLoading";

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
  });
  const [memberSince, setMemberSince] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) {
          router.push("/account/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.profile) {
          setForm({
            fullName: data.profile.fullName ?? "",
            email: data.profile.email ?? "",
            phone: data.profile.phone ?? "",
            gender: data.profile.gender ?? "",
            dateOfBirth: data.profile.dateOfBirth
              ? new Date(data.profile.dateOfBirth).toISOString().slice(0, 10)
              : "",
          });
        }
        setLoading(false);
      });

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.createdAt) {
          setMemberSince(
            new Intl.DateTimeFormat("en-EG", { month: "long", year: "numeric" }).format(
              new Date(data.user.createdAt)
            )
          );
        }
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        phone: form.phone,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
      }),
    });
    if (res.ok) setMessage("Profile updated successfully");
    else setMessage("Failed to update profile");
    setSaving(false);
  }

  if (loading) return <AccountLoading />;

  return (
    <div>
      <AccountPageHeader
        title="Profile"
        description="Manage your personal information and preferences."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="account-card p-6 lg:col-span-1">
          <div className="w-16 h-16 rounded-full bg-green-charcoal/10 flex items-center justify-center mx-auto mb-4">
            <span className="page-title text-2xl text-green-charcoal">
              {form.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <p className="text-center text-sm font-medium text-text-dark">{form.fullName}</p>
          <p className="text-center text-xs text-text-muted mt-1">{form.email}</p>
          {memberSince && (
            <p className="text-center text-xs text-text-muted mt-4 pt-4 border-t border-text-dark/10">
              Member since {memberSince}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="account-card p-6 lg:col-span-2 space-y-5">
          <div>
            <label className="input-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input-field opacity-60 cursor-not-allowed" value={form.email} disabled />
            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="input-label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+20 ..."
              />
            </div>
            <div>
              <label className="input-label" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className="input-field"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className="input-field"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>

          {message && (
            <p
              className={`text-sm ${message.includes("success") ? "text-green-charcoal" : "text-red-600"}`}
            >
              {message}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
