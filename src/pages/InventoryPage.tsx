import React, { useState, useEffect } from 'react'
import {
  Pill,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  ArrowDownRight,
  TrendingDown,
  Search,
  Filter,
  ShieldCheck,
  SendHorizontal
} from 'lucide-react'
import { db } from '../services/db'
import { Medicine, MedicineBatch, StockMovement } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'

export const InventoryPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [batches, setBatches] = useState<MedicineBatch[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'batches' | 'catalog' | 'movements'>('batches')
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'urgent_7d' | 'warning_30d' | 'healthy'>('all')

  // Dispense modal state
  const [dispenseBatch, setDispenseBatch] = useState<MedicineBatch | null>(null)
  const [dispenseQty, setDispenseQty] = useState<number>(10)
  const [dispenseReason, setDispenseReason] = useState<string>('OPD General Prescription')
  const [notification, setNotification] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadData = () => {
    setMedicines(db.getMedicines())
    setBatches(db.getBatches({ status: expiryFilter }))
    setMovements(db.getStockMovements())
  }

  useEffect(() => {
    loadData()
  }, [expiryFilter])

  const handleDispense = () => {
    if (!dispenseBatch) return
    setErrorMsg(null)
    try {
      db.dispenseMedicineTransaction(dispenseBatch.batch_id, dispenseQty, dispenseReason)
      setNotification(`Successfully dispensed ${dispenseQty} units of batch ${dispenseBatch.batch_number} (${dispenseBatch.medicine?.name}) under FEFO protocol.`)
      setDispenseBatch(null)
      loadData()
    } catch (e: any) {
      setErrorMsg(e.message || 'Dispense failed due to constraint violation.')
    }
  }

  // Aggregate Expiry Counts
  const allBatches = db.getBatches()
  const expiredCount = allBatches.filter((b) => b.expiry_status === 'expired').length
  const urgent7dCount = allBatches.filter((b) => b.expiry_status === 'urgent_7d').length
  const warning30dCount = allBatches.filter((b) => b.expiry_status === 'warning_30d').length
  const healthyCount = allBatches.filter((b) => b.expiry_status === 'healthy').length

  const filteredBatches = batches.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.batch_number.toLowerCase().includes(q) ||
      b.medicine?.name.toLowerCase().includes(q) ||
      b.medicine?.medicine_code.toLowerCase().includes(q) ||
      b.supplier_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-200 mb-2">
              <Pill className="w-3.5 h-3.5" />
              <span>TERTIARY ACADEMIC NOVELTY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              FEFO Medicine Expiry & Inventory Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1 leading-relaxed">
              First-Expiry-First-Out algorithmic dispensing guidance, multi-tier proactive expiry monitoring, and strict relational non-negative inventory constraints.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 shrink-0 flex items-center space-x-3 text-xs">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Database Invariant</div>
              <div className="text-[10px] text-amber-100 font-mono">
                CHECK (current_stock &gt;= 0)
              </div>
              <div className="text-[10px] text-slate-300">Negative stock prevented at SQL level</div>
            </div>
          </div>
        </div>
      </div>

      {/* EXPIRY RISK ALERT TIERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* EXPIRED */}
        <button
          onClick={() => setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired')}
          className={`p-4 rounded-xl border text-left transition-all ${
            expiryFilter === 'expired'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-600">
            <span>EXPIRED BATCHES</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-rose-700 mt-2">{expiredCount}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Disposal required</div>
        </button>

        {/* EXPIRING <= 7 DAYS */}
        <button
          onClick={() => setExpiryFilter(expiryFilter === 'urgent_7d' ? 'all' : 'urgent_7d')}
          className={`p-4 rounded-xl border text-left transition-all ${
            expiryFilter === 'urgent_7d'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>EXPIRING &le; 7 DAYS</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{urgent7dCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">Priority FEFO dispatch</div>
        </button>

        {/* EXPIRING <= 30 DAYS */}
        <button
          onClick={() => setExpiryFilter(expiryFilter === 'warning_30d' ? 'all' : 'warning_30d')}
          className={`p-4 rounded-xl border text-left transition-all ${
            expiryFilter === 'warning_30d'
              ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-400'
              : 'bg-white border-slate-200 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-yellow-600">
            <span>EXPIRING &le; 30 DAYS</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-yellow-700 mt-2">{warning30dCount}</div>
          <div className="text-[11px] text-yellow-700 mt-0.5">Warning threshold</div>
        </button>

        {/* HEALTHY */}
        <button
          onClick={() => setExpiryFilter(expiryFilter === 'healthy' ? 'all' : 'healthy')}
          className={`p-4 rounded-xl border text-left transition-all ${
            expiryFilter === 'healthy'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>HEALTHY STOCK</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{healthyCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Valid &gt; 30 days</div>
        </button>
      </div>

      {/* NOTIFICATIONS & ERRORS */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CONTROLS & SUB-TABS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'batches'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Batches (FEFO Sorted)
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'catalog'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Drug Formulary Catalog
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'movements'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Stock Movement Ledger
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search batch or drug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: BATCHES TABLE WITH FEFO DISPENSING */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">
              Medicine Batches (Ranked by First-Expiry-First-Out)
            </h2>
            <span className="text-[11px] font-bold text-slate-500">
              Showing {filteredBatches.length} Batches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Medicine & Code</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4 text-right">FEFO Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((batch) => {
                  const isExpired = batch.expiry_status === 'expired'
                  const isUrgent = batch.expiry_status === 'urgent_7d'
                  const isWarning = batch.expiry_status === 'warning_30d'

                  return (
                    <tr
                      key={batch.batch_id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {batch.batch_number}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{batch.medicine?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{batch.medicine?.medicine_code}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(batch.expiry_date)}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={
                            isExpired
                              ? 'text-rose-600'
                              : isUrgent
                              ? 'text-amber-600'
                              : isWarning
                              ? 'text-yellow-600'
                              : 'text-slate-600'
                          }
                        >
                          {batch.days_to_expiry !== undefined ? `${batch.days_to_expiry} days` : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{batch.current_stock}</span>{' '}
                        <span className="text-[10px] text-slate-400">/ {batch.quantity_received}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {formatCurrency(batch.unit_selling_price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800 border-rose-200'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : isWarning
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isExpired ? 'Expired' : isUrgent ? 'Critical <=7d' : isWarning ? 'Warning <=30d' : 'Healthy'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setDispenseBatch(batch)
                            setDispenseQty(Math.min(10, batch.current_stock))
                          }}
                          disabled={batch.current_stock <= 0 || isExpired}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Dispense (FEFO)
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DRUG CATALOG WITH TOTAL AGGREGATED STOCK */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medicines.map((med) => {
            const isLowStock = (med.total_stock || 0) <= med.reorder_level

            return (
              <div
                key={med.medicine_id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {med.medicine_code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      isLowStock
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isLowStock ? 'Low Stock' : 'Stock Healthy'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{med.name}</h3>
                  <div className="text-xs text-slate-500">{med.generic_name} • {med.dosage_form}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400">Total Stock: </span>
                    <strong className="text-slate-900">{med.total_stock} units</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Reorder Level: </span>
                    <strong className="text-slate-700">{med.reorder_level}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 3: STOCK MOVEMENTS IMMUTABLE AUDIT LEDGER */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Stock Movement Ledger (Immutable Transaction Records)</h2>
            <span className="text-[11px] font-bold text-slate-500">{movements.length} Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Batch Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Previous Stock</th>
                  <th className="py-3 px-4">New Stock</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((mov) => (
                  <tr key={mov.movement_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(mov.movement_timestamp).toLocaleTimeString()} {formatDate(mov.movement_timestamp)}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {mov.batch?.batch_number || 'BATCH'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {mov.movement_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{mov.quantity}</td>
                    <td className="py-3 px-4 text-slate-500">{mov.previous_stock}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{mov.new_stock}</td>
                    <td className="py-3 px-4 text-slate-600">{mov.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPENSE MODAL */}
      {dispenseBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-amber-600">
              <SendHorizontal className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900">Confirm FEFO Stock Dispensing</h3>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
              <div><strong>Drug:</strong> {dispenseBatch.medicine?.name}</div>
              <div><strong>Batch:</strong> <span className="font-mono">{dispenseBatch.batch_number}</span></div>
              <div><strong>Expiry Date:</strong> {formatDate(dispenseBatch.expiry_date)}</div>
              <div><strong>Available Stock:</strong> {dispenseBatch.current_stock} units</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Dispense Quantity:
              </label>
              <input
                type="number"
                aria-label="Dispense Quantity"
                value={dispenseQty}
                onChange={(e) => setDispenseQty(Number(e.target.value))}
                min={1}
                max={dispenseBatch.current_stock}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason / Clinical Destination:
              </label>
              <input
                type="text"
                aria-label="Clinical Destination Reason"
                value={dispenseReason}
                onChange={(e) => setDispenseReason(e.target.value)}
                placeholder="e.g. OPD Emergency Dispensing, Ward Order #12"
                className="w-full text-xs p-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDispenseBatch(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDispense}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
              >
                Execute Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
