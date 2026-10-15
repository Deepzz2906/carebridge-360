import React, { useState, useEffect } from 'react'
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  FileCode2,
  Lock,
  ArrowRight
} from 'lucide-react'
import { db } from '../services/db'
import { AuditLog } from '../types'
import { formatDate } from '../lib/utils'

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    setLogs(db.getAuditLogs())
  }, [])

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      l.action_type.toLowerCase().includes(q) ||
      l.table_name.toLowerCase().includes(q) ||
      l.record_id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">System Security & Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable PostgreSQL audit ledger capturing state transitions, cancellations, recoveries, and FEFO dispatches.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>Strictly Append-Only (Admin Restricted)</span>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full sm:w-80">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by Action, Table, or Record ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        />
      </div>

      {/* AUDIT LOGS TABLE & JSON VIEWER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm">Audit Event History</h2>
            <span className="text-[11px] font-bold text-slate-500">{filteredLogs.length} Events Logged</span>
          </div>

          <div className="overflow-x-auto max-h-[580px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold sticky top-0">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Table</th>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((l) => {
                  const isSelected = selectedLog?.log_id === l.log_id
                  return (
                    <tr
                      key={l.log_id}
                      onClick={() => setSelectedLog(l)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(l.created_at).toLocaleTimeString()} {formatDate(l.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {l.action_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">{l.table_name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate max-w-[120px]">
                        {l.record_id}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ArrowRight className="w-4 h-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* JSON EVENT PAYLOAD INSPECTOR */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
            <FileCode2 className="w-4 h-4 text-purple-600" />
            <span>Audit Payload Inspector (JSONB)</span>
          </div>

          {selectedLog ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div><strong>Log ID:</strong> <span className="font-mono">{selectedLog.log_id}</span></div>
                <div><strong>Action:</strong> <span className="font-bold text-purple-700">{selectedLog.action_type}</span></div>
                <div><strong>Target Entity:</strong> {selectedLog.table_name} (ID: <span className="font-mono">{selectedLog.record_id}</span>)</div>
                <div><strong>User Principal:</strong> {selectedLog.user_id || 'System Daemon'}</div>
                <div><strong>IP Address:</strong> {selectedLog.ip_address}</div>
              </div>

              {selectedLog.old_values && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Prior State (old_values):</div>
                  <pre className="font-mono text-[11px] bg-slate-900 text-amber-300 p-3 rounded-xl overflow-x-auto">
                    <code>{JSON.stringify(selectedLog.old_values, null, 2)}</code>
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">New Mutated State (new_values):</div>
                  <pre className="font-mono text-[11px] bg-slate-900 text-emerald-300 p-3 rounded-xl overflow-x-auto">
                    <code>{JSON.stringify(selectedLog.new_values, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 text-xs">
              Select an audit event from the table on the left to inspect its JSON state mutation payload.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
