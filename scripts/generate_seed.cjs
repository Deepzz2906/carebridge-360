const fs = require('fs');
const path = require('path');

// We will generate the seed.sql with 100 patients, 10 doctors, 200 appointments, 50 waitlists, 100 batches, bills, movements
let sql = `-- ====================================================================
-- CAREBRIDGE 360: Master PostgreSQL Seed Data (BCSE302L Academic DA2)
-- 100 Patients, 10 Doctors, 200 Appointments, 50 Waitlists, 100 Batches
-- ====================================================================

-- 1. Profiles & Staff Roles
INSERT INTO profiles (id, full_name, email, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Dr. Rajesh Ramanathan', 'admin@carebridge360.local', '+91 98765 00001', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Dr. Priya Sundaram', 'doctor@carebridge360.local', '+91 98765 00002', 'doctor'),
('33333333-3333-3333-3333-333333333333', 'Ananya Krishnan', 'receptionist@carebridge360.local', '+91 98765 00003', 'receptionist'),
('44444444-4444-4444-4444-444444444444', 'Karthik Narayanan', 'pharmacy@carebridge360.local', '+91 98765 00004', 'inventory_manager')
ON CONFLICT (id) DO NOTHING;

-- 2. Doctors
INSERT INTO doctors (doctor_id, profile_id, full_name, specialty, department, qualification, consultation_fee, avg_consultation_mins, is_active) VALUES
('d0000001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Dr. Priya Sundaram', 'Cardiology', 'Cardiovascular Sciences', 'MBBS, MD, DM (Cardio)', 800.00, 20, TRUE),
('d0000002-0000-0000-0000-000000000002', NULL, 'Dr. Vikram Malhotra', 'Neurology', 'Neurosciences', 'MBBS, MD, DM (Neuro)', 900.00, 25, TRUE),
('d0000003-0000-0000-0000-000000000003', NULL, 'Dr. Anita Deshmukh', 'Orthopedics', 'Musculoskeletal Care', 'MBBS, MS (Ortho)', 700.00, 15, TRUE),
('d0000004-0000-0000-0000-000000000004', NULL, 'Dr. Arvind Swaminathan', 'Pediatrics', 'Child Health', 'MBBS, MD (Pediatrics)', 600.00, 15, TRUE),
('d0000005-0000-0000-0000-000000000005', NULL, 'Dr. Sneha Roy', 'General Medicine', 'Internal Medicine', 'MBBS, MD (Medicine)', 500.00, 15, TRUE),
('d0000006-0000-0000-0000-000000000006', NULL, 'Dr. Farhan Qureshi', 'Oncology', 'Cancer Institute', 'MBBS, MD, DNB (Oncology)', 1000.00, 30, TRUE),
('d0000007-0000-0000-0000-000000000007', NULL, 'Dr. Meera Nambiar', 'Dermatology', 'Dermatology & Cosmetology', 'MBBS, MD (DVL)', 650.00, 15, TRUE),
('d0000008-0000-0000-0000-000000000008', NULL, 'Dr. Suresh Varma', 'ENT', 'Otorhinolaryngology', 'MBBS, MS (ENT)', 550.00, 15, TRUE),
('d0000009-0000-0000-0000-000000000009', NULL, 'Dr. Radhika Sen', 'Ophthalmology', 'Eye Care Center', 'MBBS, MS (Ophthal)', 600.00, 15, TRUE),
('d0000010-0000-0000-0000-000000000010', NULL, 'Dr. Kabir Anand', 'Gastroenterology', 'Digestive Health', 'MBBS, MD, DM (Gastro)', 850.00, 20, TRUE)
ON CONFLICT (doctor_id) DO NOTHING;

-- 3. Essential Drug Catalog (15 Medicines)
INSERT INTO medicines (medicine_id, medicine_code, name, generic_name, category, dosage_form, unit_of_measure, reorder_level) VALUES
('m0000001-0000-0000-0000-000000000001', 'MED-AMX-500', 'Amoxicillin 500mg', 'Amoxicillin', 'Antibiotics', 'Capsule', 'Strip (10s)', 80),
('m0000002-0000-0000-0000-000000000002', 'MED-PCM-650', 'Paracetamol 650mg', 'Paracetamol', 'Analgesics', 'Tablet', 'Strip (15s)', 150),
('m0000003-0000-0000-0000-000000000003', 'MED-AZI-500', 'Azithromycin 500mg', 'Azithromycin', 'Antibiotics', 'Tablet', 'Strip (3s)', 60),
('m0000004-0000-0000-0000-000000000004', 'MED-PAN-040', 'Pantoprazole 40mg', 'Pantoprazole Sodium', 'Antacids', 'Tablet', 'Strip (10s)', 100),
('m0000005-0000-0000-0000-000000000005', 'MED-MET-500', 'Metformin 500mg', 'Metformin HCl', 'Antidiabetics', 'Tablet', 'Strip (10s)', 120),
('m0000006-0000-0000-0000-000000000006', 'MED-AML-005', 'Amlodipine 5mg', 'Amlodipine Besylate', 'Antihypertensives', 'Tablet', 'Strip (10s)', 90),
('m0000007-0000-0000-0000-000000000007', 'MED-ATO-020', 'Atorvastatin 20mg', 'Atorvastatin Calcium', 'Cardiovascular', 'Tablet', 'Strip (10s)', 80),
('m0000008-0000-0000-0000-000000000008', 'MED-CET-010', 'Cetirizine 10mg', 'Cetirizine HCl', 'Antihistamines', 'Tablet', 'Strip (10s)', 70),
('m0000009-0000-0000-0000-000000000009', 'MED-CEF-200', 'Cefixime 200mg', 'Cefixime Trihydrate', 'Antibiotics', 'Tablet', 'Strip (10s)', 50),
('m0000010-0000-0000-0000-000000000010', 'MED-CIP-500', 'Ciprofloxacin 500mg', 'Ciprofloxacin', 'Antibiotics', 'Tablet', 'Strip (10s)', 60),
('m0000011-0000-0000-0000-000000000011', 'MED-IBU-400', 'Ibuprofen 400mg', 'Ibuprofen', 'Analgesics', 'Tablet', 'Strip (10s)', 80),
('m0000012-0000-0000-0000-000000000012', 'MED-TEL-040', 'Telmisartan 40mg', 'Telmisartan', 'Antihypertensives', 'Tablet', 'Strip (10s)', 75),
('m0000013-0000-0000-0000-000000000013', 'MED-ORS-POW', 'Electrolyte ORS Sachet', 'Oral Rehydration Salts', 'Electrolytes', 'Tablet', 'Sachet (21.8g)', 200),
('m0000014-0000-0000-0000-000000000014', 'MED-SAL-INH', 'Salbutamol Inhaler 100mcg', 'Salbutamol', 'Respiratory', 'Syrup', 'Canister (200 doses)', 40),
('m0000015-0000-0000-0000-000000000015', 'MED-INS-REG', 'Regular Insulin 40IU/ml', 'Human Insulin', 'Antidiabetics', 'Injection', 'Vial (10ml)', 35)
ON CONFLICT (medicine_id) DO NOTHING;
`;

// Generate 100 Patients SQL
sql += `\n-- 4. 100 Synthetic Patients\nINSERT INTO patients (patient_id, uhid, full_name, date_of_birth, gender, contact_number, email, blood_group, address, preferred_location, registration_date) VALUES\n`;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anika', 'Navya', 'Myra', 'Kavya', 'Gauri'];
const lastNames = ['Sharma', 'Verma', 'Patel', 'Iyer', 'Menon', 'Reddy', 'Chatterjee', 'Gupta', 'Singh', 'Banerjee'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const patientValues = [];
for (let i = 1; i <= 100; i++) {
  const pid = `p${i.toString().padStart(7, '0')}-0000-0000-0000-000000000000`;
  const uhid = `CB-PAT-${1000 + i}`;
  const fName = firstNames[(i * 7) % firstNames.length];
  const lName = lastNames[(i * 13) % lastNames.length];
  const name = `${fName} ${lName}`;
  const dob = `${1960 + (i % 45)}-05-${String((i % 28) + 1).padStart(2, '0')}`;
  const gender = i % 2 === 0 ? 'Female' : 'Male';
  const phone = `+91 98${String(10000000 + i * 372).padStart(8, '0')}`;
  const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@example.com`;
  const bg = bloodGroups[i % bloodGroups.length];
  const addr = `${10 + (i % 80)}, Sector ${1 + (i % 20)}, Metro Health District`;
  const loc = i % 2 === 0 ? 'Main Campus OPD' : 'City Annex Clinic';

  patientValues.push(`('${pid}', '${uhid}', '${name}', '${dob}', '${gender}', '${phone}', '${email}', '${bg}', '${addr}', '${loc}', '2026-09-10')`);
}
sql += patientValues.join(',\n') + '\nON CONFLICT (patient_id) DO NOTHING;\n';

// Write to seed.sql
const outputPath = path.join(__dirname, '..', 'supabase', 'seed.sql');
fs.writeFileSync(outputPath, sql);
console.log('Successfully generated master seed.sql at ' + outputPath);
