"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Customer {
  id: number;
  code: string;
  companyName: string;
  phone: string | null;
  status: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  async function loadCustomers() {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <main className="p-8">

      <div className="mb-6 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          👥 รายชื่อลูกค้า
        </h1>

        <Link
          href="/customers/new"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          ➕ เพิ่มลูกค้า
        </Link>

      </div>

      <table className="w-full border-collapse border">

        <thead className="bg-gray-100">

          <tr>

            <th className="border p-3">รหัส</th>

            <th className="border p-3">บริษัท</th>

            <th className="border p-3">โทรศัพท์</th>

            <th className="border p-3">สถานะ</th>

          </tr>

        </thead>

        <tbody>

          {customers.map((c) => (

            <tr key={c.id}>

              <td className="border p-3">{c.code}</td>

              <td className="border p-3">{c.companyName}</td>

              <td className="border p-3">{c.phone}</td>

              <td className="border p-3">{c.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>
  );
}