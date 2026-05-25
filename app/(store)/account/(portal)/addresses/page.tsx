"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountPageHeader from "@/components/store/account/AccountPageHeader";
import AccountLoading from "@/components/store/account/AccountLoading";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
  building: string;
  floor?: string;
  apartment?: string;
  isDefault: boolean;
}

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  city: "",
  area: "",
  street: "",
  building: "",
  floor: "",
  apartment: "",
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAddresses() {
    const res = await fetch("/api/user/addresses");
    if (!res.ok) {
      router.push("/account/login");
      return;
    }
    const data = await res.json();
    setAddresses(data.addresses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/user/addresses/${editingId}` : "/api/user/addresses";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        floor: form.floor || undefined,
        apartment: form.apartment || undefined,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadAddresses();
    }
    setSaving(false);
  }

  async function setDefault(id: string) {
    await fetch(`/api/user/addresses/${id}/default`, { method: "PUT" });
    loadAddresses();
  }

  async function deleteAddress(id: string) {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
    loadAddresses();
  }

  function startEdit(addr: Address) {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      city: addr.city,
      area: addr.area,
      street: addr.street,
      building: addr.building,
      floor: addr.floor ?? "",
      apartment: addr.apartment ?? "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  if (loading) return <AccountLoading />;

  return (
    <div>
      <AccountPageHeader
        title="Addresses"
        description="Manage your delivery addresses for faster checkout."
        action={
          !showForm ? (
            <button
              type="button"
              className="btn-primary text-xs py-2 px-5"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm(true);
              }}
            >
              Add Address
            </button>
          ) : undefined
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="account-card p-6 mb-6 space-y-4">
          <h3 className="text-sm tracking-widest uppercase text-text-dark">
            {editingId ? "Edit Address" : "New Address"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ["label", "Label (e.g. Home, Work)"],
                ["fullName", "Full Name"],
                ["phone", "Phone"],
                ["city", "City"],
                ["area", "Area"],
                ["street", "Street"],
                ["building", "Building"],
                ["floor", "Floor (optional)"],
                ["apartment", "Apartment (optional)"],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className={field === "street" ? "sm:col-span-2" : ""}>
                <label className="input-label" htmlFor={field}>
                  {label}
                </label>
                <input
                  id={field}
                  className="input-field"
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  required={!["floor", "apartment"].includes(field)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-xs py-2 px-5 disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
            </button>
            <button type="button" className="btn-outline text-xs py-2 px-5" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="account-card p-12 text-center">
          <p className="text-sm text-text-muted mb-4">Add a delivery address to speed up checkout.</p>
          <button
            type="button"
            className="btn-primary text-xs py-2 px-6"
            onClick={() => setShowForm(true)}
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="account-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-dark">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] tracking-widest uppercase bg-green-charcoal/10 text-green-charcoal px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <div className="text-sm text-text-muted font-normal space-y-1 flex-1">
                <p>{addr.fullName}</p>
                <p>{addr.phone}</p>
                <p>
                  {addr.street}, {addr.building}
                  {addr.floor && `, Floor ${addr.floor}`}
                  {addr.apartment && `, Apt ${addr.apartment}`}
                </p>
                <p>
                  {addr.area}, {addr.city}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-text-dark/10 text-xs">
                {!addr.isDefault && (
                  <button
                    type="button"
                    className="text-text-muted hover:text-text-dark underline"
                    onClick={() => setDefault(addr.id)}
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  className="text-text-muted hover:text-text-dark underline"
                  onClick={() => startEdit(addr)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600/80 hover:text-red-600 underline"
                  onClick={() => deleteAddress(addr.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
