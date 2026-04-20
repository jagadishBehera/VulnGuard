import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

import {
  Search,
  Globe,
  Clock,
  Shield,
  ChevronRight,
  Home,
  Download,
  Eye,
} from "lucide-react";

import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function History() {
  // ---------------- STATE ----------------
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // ✅ TANSTACK PAGINATION STATE
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const navigate = useNavigate();

  // ---------------- FETCH DATA ----------------
  useEffect(() => {
    const fetchScans = async () => {
      try {
        setLoading(true);
        const res = await api.get("/scans");
        setScanData(res.data?.scans || []);
      } catch (err) {
        console.error("Failed to fetch scans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, []);

  // ---------------- EXPORT CSV ----------------
  const exportCSV = () => {
    const headers = ["URL", "Risk", "Status", "Duration", "Date"];

    const rows = scanData.map((v) => [
      v.targetUrl,
      v.riskLevel,
      v.status,
      v.durationMs,
      v.createdAt,
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "scan-history.csv";
    link.click();
  };

  const exportPDF = () => {
    alert("Add jsPDF + autoTable here 🚀");
  };

  // ---------------- COLUMNS ----------------
  const columns = useMemo(
    () => [
      {
        header: "Target URL",
        accessorKey: "targetUrl",
        cell: (info) => (
          <div className="flex items-center gap-2 text-indigo-600 font-medium truncate max-w-[280px]">
            <Globe size={14} />
            {info.getValue()}
          </div>
        ),
      },
      {
        header: "Risk",
        accessorKey: "riskLevel",
        cell: (info) => {
          const v = info.getValue();

          const color =
            v === "high"
              ? "bg-red-100 text-red-600"
              : v === "medium"
                ? "bg-yellow-100 text-yellow-600"
                : "bg-green-100 text-green-600";

          return (
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${color}`}>
              {v}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => (
          <span className="capitalize text-gray-700">{info.getValue()}</span>
        ),
      },
      {
        header: "Duration",
        accessorKey: "durationMs",
        cell: (info) => (
          <div className="flex items-center gap-1 text-gray-600">
            <Clock size={14} />
            {(info.getValue() / 1000).toFixed(2)}s
          </div>
        ),
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        cell: (info) => (
          <span className="text-gray-500 text-xs">
            {new Date(info.getValue()).toLocaleString()}
          </span>
        ),
      },
      {
        header: "Action",
        cell: ({ row }) => (
          <button
            onClick={() => navigate(`/admin/scan/${row.original._id}`)}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <Eye size={14} />
            View
          </button>
        ),
      },
    ],
    []
  );

  // ---------------- TABLE ----------------
  const table = useReactTable({
    data: scanData,
    columns,

    state: {
      sorting,
      globalFilter,
      pagination,
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // ---------------- UI ----------------
  return (
    <div className="w-full p-4">

      {/* BREADCRUMB */}
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Home size={16} className="mr-2" />
        Home
        <ChevronRight size={16} className="mx-2" />
        <span className="text-gray-800 font-medium">Scan History</span>
      </div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-md mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">

        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Shield size={18} />
          Scan History
        </h1>

        <div className="flex flex-wrap gap-2 items-center">

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-white text-black px-3 py-2 rounded-lg">
            <Search size={16} />
            <input
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="outline-none text-sm"
            />
          </div>

          {/* CSV */}
          <button
            onClick={exportCSV}
            className="bg-white text-blue-600 px-3 py-2 rounded-lg flex items-center gap-1 font-medium"
          >
            <Download size={14} />
            CSV
          </button>

          {/* PDF */}
          <button
            onClick={exportPDF}
            className="bg-white text-blue-600 px-3 py-2 rounded-lg flex items-center gap-1 font-medium"
          >
            <Download size={14} />
            PDF
          </button>

        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* HEADER */}
            <thead className="bg-blue-50 text-gray-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getIsSorted() === "asc" && " 🔼"}
                      {header.column.getIsSorted() === "desc" && " 🔽"}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* BODY */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                    Loading scan history...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-blue-50 transition">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                    No scans found
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* PAGINATION (TANSTACK CONTROLLED) */}
        <div className="flex items-center justify-between p-3 bg-gray-50 text-sm">

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-white border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <span className="text-gray-600">
            Page{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>

          {/* PAGE SIZE */}
          <select
            className="border px-2 py-1 rounded"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>

        </div>
      </div>
    </div>
  );
}