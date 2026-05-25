"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number; addresses: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-dark mb-8">Users</h1>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-text-muted">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Phone</th>
              <th className="pb-3 pr-4">Orders</th>
              <th className="pb-3 pr-4">Addresses</th>
              <th className="pb-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50">
                <td className="py-3 pr-4">
                  <Link href={`/admin/users/${user.id}`} className="underline">{user.fullName}</Link>
                </td>
                <td className="py-3 pr-4 text-text-muted">{user.email}</td>
                <td className="py-3 pr-4">{user.phone ?? "—"}</td>
                <td className="py-3 pr-4">{user._count.orders}</td>
                <td className="py-3 pr-4">{user._count.addresses}</td>
                <td className="py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
