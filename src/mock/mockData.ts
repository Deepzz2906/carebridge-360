/**
 * CAREBRIDGE 360 - INITIAL UI PREVIEW MOCK DATA
 * Strictly separated for Phase 1 frontend foundation previews.
 * Real PostgreSQL and Supabase operations are orchestrated in src/services/db.ts
 */

export interface MockHospitalKPI {
  label: string
  value: string
  subtext: string
  change: string
  isPositive: boolean
}

export const MOCK_PREVIEW_KPIS: MockHospitalKPI[] = [
  {
    label: 'Bed & Slot Occupancy',
    value: '87.4%',
    subtext: '48 of 55 Active Clinics Filled',
    change: '+4.2%',
    isPositive: true,
  },
  {
    label: 'Smart Slot Recovery Rate',
    value: '88.0%',
    subtext: '14 of 16 Cancelled Slots Saved',
    change: '+46.0% vs FCFS',
    isPositive: true,
  },
  {
    label: 'Average Queue Waiting Time',
    value: '18.5 mins',
    subtext: 'Dynamic Rolling Empirical Average',
    change: '-12.3 mins',
    isPositive: true,
  },
  {
    label: 'FEFO Monitored Batches',
    value: '100 Batches',
    subtext: '15 Batches within 7-Day Window',
    change: 'Zero Spoilage',
    isPositive: true,
  },
]

export const MOCK_DEPARTMENT_WORKLOAD = [
  { department: 'Cardiology', activeDoctors: 2, todayAppointments: 24, avgWaitMins: 22 },
  { department: 'Neurology', activeDoctors: 1, todayAppointments: 18, avgWaitMins: 28 },
  { department: 'Orthopedics', activeDoctors: 1, todayAppointments: 20, avgWaitMins: 16 },
  { department: 'Pediatrics', activeDoctors: 1, todayAppointments: 22, avgWaitMins: 14 },
  { department: 'General Medicine', activeDoctors: 1, todayAppointments: 26, avgWaitMins: 15 },
  { department: 'Oncology', activeDoctors: 1, todayAppointments: 12, avgWaitMins: 32 },
  { department: 'Dermatology', activeDoctors: 1, todayAppointments: 18, avgWaitMins: 12 },
  { department: 'Gastroenterology', activeDoctors: 1, todayAppointments: 16, avgWaitMins: 20 },
]

export const MOCK_DATA_DISCLAIMER = {
  isMock: true,
  notice: 'CareBridge 360 Phase 1 Frontend Preview: All records displayed are generated synthetic clinical data for academic validation in BCSE302L Database Systems.',
}
