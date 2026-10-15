import React, { useState, useEffect } from 'react'
import {
  ReceiptText,
  IndianRupee,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck
} from 'lucide-react'
import { db } from '../services/db'
import { Bill } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'

export const BillingPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  const loadBills = () => {
    setBills(db.getBills())
  }

  useEffect(() => {
    loadBills()
  }, [])

  const handleMarkPaid = (bill: Bill, method: Bill['payment_method']) => {
    try {
      db.updateBillPayment(bill.bill_id, method)
      setNotification(`Invoice ${bill.bill_number} marked as Paid via ${method}.`)
      loadBills()
    } catch (e: any) {
      alert(e.message)
    }
  }

  const totalRevenue = bills
    .filter((b) => b.payment_status === 'Paid')
    .reduce((sum, b) => sum + b.total_amount, 0)

  const outstandingRevenue = bills
    .filter((b) => b.payment_status === 'Pending')
    .reduce((sum, b) => sum + b.total_amount, 0)

  const filteredBills = bills.filter((b) => {
    if (statusFilter !== 'all' && b.payment_status !== statusFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        b.bill_number.toLowerCase().includes(q) ||
        b.patient?.full_name.toLowerCase().includes(q) ||
        b.patient?.uhid.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <ReceiptText className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900">Hospital Billing & Revenue</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated invoices with 1:1 appointment relational uniqueness constraint.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>UNIQUE(appointment_id) Enforced</span>
        </div>
      </div>

      {/* REVENUE OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>TOTAL COLLECTED REVENUE</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Cleared outpatient consultation fees
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>OUTSTANDING RECEIVABLES</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {formatCurrency(outstandingRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Pending front-desk settlements
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>INVOICE VOLUME</span>
            <ReceiptText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {bills.length} <span className="text-xs font-normal text-slate-400">Bills</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Zero duplicate billing errors
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center space-x-2">
          {['all', 'Paid', 'Pending'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* BILLS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-sm">Consultation Invoices Ledger</h2>
          <span className="text-[11px] font-bold text-slate-500">{filteredBills.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Patient (UHID)</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Fee Breakdown</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status & Method</th>
                <th className="py-3 px-4 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((b) => {
                const isPaid = b.payment_status === 'Paid'

                return (
                  <tr key={b.bill_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {b.bill_number}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.patient?.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.patient?.uhid}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(b.generated_at)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Fee: {formatCurrency(b.consultation_fee)}
                      {b.additional_charges > 0 && ` + Charges: ${formatCurrency(b.additional_charges)}`}
                      {b.discount > 0 && ` - Disc: ${formatCurrency(b.discount)}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatCurrency(b.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {b.payment_status}
                      </span>
                      {b.payment_method && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          via {b.payment_method}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isPaid && (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleMarkPaid(b, 'UPI')}
                            className="px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer"
                          >
                            Pay UPI
                          </button>
                          <button
                            onClick={() => handleMarkPaid(b, 'Card')}
                            className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer"
                          >
                            Pay Card
                          </button>
                          <button
                            onClick={() => handleMarkPaid(b, 'Cash')}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                          >
                            Cash
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
