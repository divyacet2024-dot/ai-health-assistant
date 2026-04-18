import { Medicine, LabReport, StudyNote, StudentQuery, Patient, Appointment } from './types';

export const MEDICINES: Medicine[] = [
  { id: 'm1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Analgesic / Antipyretic', usage: 'Used for relief of mild to moderate pain and fever. Commonly prescribed for headaches, body aches, toothaches, and cold/flu symptoms.', dosage: '1-2 tablets every 4-6 hours. Max 4g/day.', sideEffects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'], warnings: ['Avoid alcohol', 'Do not exceed recommended dose', 'Consult doctor if pregnant'], price: '₹15-30' },
  { id: 'm2', name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotic', usage: 'Treats bacterial infections including ear infections, pneumonia, skin infections, urinary tract infections, and throat infections.', dosage: '250-500mg every 8 hours for 7-10 days.', sideEffects: ['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting'], warnings: ['Complete full course', 'Inform doctor of penicillin allergy', 'Take with food'], price: '₹50-120' },
  { id: 'm3', name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', usage: 'Reduces stomach acid. Used for GERD, ulcers, and acid reflux. Helps heal acid damage to the stomach and esophagus.', dosage: '20mg once daily before breakfast for 4-8 weeks.', sideEffects: ['Headache', 'Nausea', 'Diarrhea', 'Stomach pain'], warnings: ['Do not crush capsules', 'Long-term use may affect B12 absorption', 'Take 30 min before meals'], price: '₹40-80' },
  { id: 'm4', name: 'Metformin 500mg', genericName: 'Metformin Hydrochloride', category: 'Antidiabetic', usage: 'First-line medication for type 2 diabetes. Lowers blood sugar by improving insulin sensitivity and reducing glucose production.', dosage: '500mg twice daily with meals. May increase to 2000mg/day.', sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste', 'Vitamin B12 deficiency'], warnings: ['Monitor kidney function', 'Avoid alcohol', 'Stop before contrast dye procedures'], price: '₹20-60' },
  { id: 'm5', name: 'Amlodipine 5mg', genericName: 'Amlodipine Besylate', category: 'Calcium Channel Blocker', usage: 'Treats high blood pressure and coronary artery disease. Relaxes blood vessels to improve blood flow.', dosage: '5-10mg once daily. May take 1-2 weeks for full effect.', sideEffects: ['Swelling in ankles', 'Dizziness', 'Flushing', 'Fatigue'], warnings: ['Do not stop suddenly', 'Monitor blood pressure regularly', 'Avoid grapefruit juice'], price: '₹30-70' },
  { id: 'm6', name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Macrolide Antibiotic', usage: 'Treats respiratory infections, skin infections, ear infections, and sexually transmitted infections.', dosage: '500mg on day 1, then 250mg daily for days 2-5.', sideEffects: ['Diarrhea', 'Nausea', 'Abdominal pain', 'Headache'], warnings: ['Take on empty stomach', 'Report irregular heartbeat', 'Complete full course'], price: '₹70-150' },
  { id: 'm7', name: 'Cetirizine 10mg', genericName: 'Cetirizine Hydrochloride', category: 'Antihistamine', usage: 'Relieves allergy symptoms including runny nose, sneezing, itchy eyes, and hives. Non-drowsy antihistamine.', dosage: '10mg once daily. Can be taken with or without food.', sideEffects: ['Drowsiness', 'Dry mouth', 'Headache', 'Fatigue'], warnings: ['May cause drowsiness', 'Avoid alcohol', 'Use caution while driving'], price: '₹10-25' },
  { id: 'm8', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole Sodium', category: 'Proton Pump Inhibitor', usage: 'Treats erosive esophagitis, GERD, and conditions with excess stomach acid like Zollinger-Ellison syndrome.', dosage: '40mg once daily for 4-8 weeks. Take before breakfast.', sideEffects: ['Headache', 'Diarrhea', 'Nausea', 'Joint pain'], warnings: ['Swallow whole, do not crush', 'Long-term use needs monitoring', 'May interact with blood thinners'], price: '₹50-100' },
  { id: 'm9', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'NSAID', usage: 'Anti-inflammatory painkiller used for headaches, dental pain, menstrual cramps, muscle aches, and arthritis.', dosage: '200-400mg every 4-6 hours. Max 1200mg/day (OTC).', sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness', 'Kidney problems'], warnings: ['Take with food', 'Avoid if heart condition', 'Not for children under 12'], price: '₹15-40' },
  { id: 'm10', name: 'Vitamin D3 60000 IU', genericName: 'Cholecalciferol', category: 'Vitamin Supplement', usage: 'Treats vitamin D deficiency. Essential for bone health, calcium absorption, and immune function.', dosage: '60000 IU once weekly for 8 weeks (deficiency), then monthly maintenance.', sideEffects: ['Nausea', 'Constipation', 'Weakness (overdose)'], warnings: ['Monitor serum calcium', 'Take with fatty food for absorption', 'Do not exceed prescribed dose'], price: '₹30-80' },
];

export const LAB_REPORTS: LabReport[] = [
  {
    id: 'lr1', patientName: 'Rahul Sharma', testName: 'Complete Blood Count (CBC)', date: '2026-04-05', status: 'completed',
    results: [
      { parameter: 'Hemoglobin', value: '14.2 g/dL', normalRange: '13.5-17.5', status: 'normal' },
      { parameter: 'WBC Count', value: '11,500 /µL', normalRange: '4,500-11,000', status: 'high' },
      { parameter: 'Platelet Count', value: '250,000 /µL', normalRange: '150,000-400,000', status: 'normal' },
      { parameter: 'RBC Count', value: '5.1 M/µL', normalRange: '4.5-5.5', status: 'normal' },
    ],
  },
  {
    id: 'lr2', patientName: 'Rahul Sharma', testName: 'Lipid Profile', date: '2026-04-03', status: 'completed',
    results: [
      { parameter: 'Total Cholesterol', value: '220 mg/dL', normalRange: '<200', status: 'high' },
      { parameter: 'HDL', value: '55 mg/dL', normalRange: '>40', status: 'normal' },
      { parameter: 'LDL', value: '140 mg/dL', normalRange: '<100', status: 'high' },
      { parameter: 'Triglycerides', value: '150 mg/dL', normalRange: '<150', status: 'normal' },
    ],
  },
  {
    id: 'lr3', patientName: 'Rahul Sharma', testName: 'Blood Sugar (Fasting)', date: '2026-04-07', status: 'pending',
    results: [],
  },
  {
    id: 'lr4', patientName: 'Rahul Sharma', testName: 'Thyroid Function Test', date: '2026-04-06', status: 'processing',
    results: [],
  },
];

export const STUDY_NOTES: StudyNote[] = [
  { id: 'sn1', subject: 'Anatomy', title: 'Upper Limb — Complete Notes', year: '1st Year', type: 'notes', description: 'Comprehensive notes covering brachial plexus, muscles of upper limb, blood supply, and clinical correlations.' },
  { id: 'sn2', subject: 'Anatomy', title: 'Head & Neck — Previous Year Paper 2025', year: '1st Year', type: 'paper', description: 'University exam paper with marking scheme. Covers cranial nerves, pharynx, larynx, and orbit.' },
  { id: 'sn3', subject: 'Physiology', title: 'Cardiovascular System — Video Lectures', year: '1st Year', type: 'video', url: 'https://www.youtube.com/results?search_query=cardiovascular+physiology+lecture', description: 'Curated playlist covering cardiac cycle, ECG interpretation, blood pressure regulation.' },
  { id: 'sn4', subject: 'Physiology', title: 'Renal Physiology Notes', year: '1st Year', type: 'notes', description: 'Glomerular filtration, tubular reabsorption, acid-base balance, and diuretics.' },
  { id: 'sn5', subject: 'Biochemistry', title: 'Metabolism — Complete Notes', year: '1st Year', type: 'notes', description: 'Carbohydrate, lipid, and protein metabolism. Includes clinical correlations and enzyme disorders.' },
  { id: 'sn6', subject: 'Pharmacology', title: 'Autonomic Nervous System Drugs', year: '2nd Year', type: 'notes', description: 'Cholinergic and adrenergic drugs, mechanisms, clinical uses, and adverse effects.' },
  { id: 'sn7', subject: 'Pharmacology', title: 'Antibiotics Classification — Video', year: '2nd Year', type: 'video', url: 'https://www.youtube.com/results?search_query=antibiotics+classification+pharmacology', description: 'Visual guide to antibiotic classes, spectrum of activity, and resistance mechanisms.' },
  { id: 'sn8', subject: 'Pathology', title: 'Inflammation & Healing — Previous Year 2025', year: '2nd Year', type: 'paper', description: 'Previous year paper covering acute and chronic inflammation, wound healing, granulomatous inflammation.' },
  { id: 'sn9', subject: 'Microbiology', title: 'Bacteriology — Complete Notes', year: '2nd Year', type: 'notes', description: 'Gram positive and negative bacteria, culture methods, staining techniques, and clinical infections.' },
  { id: 'sn10', subject: 'Medicine', title: 'Diabetes Mellitus — Video Lecture', year: '3rd Year', type: 'video', url: 'https://www.youtube.com/results?search_query=diabetes+mellitus+medicine+lecture', description: 'Comprehensive lecture on types, diagnosis, management, and complications of diabetes.' },
  { id: 'sn11', subject: 'Surgery', title: 'Acute Abdomen — Notes', year: '3rd Year', type: 'notes', description: 'Differential diagnosis, investigation, and surgical approach to acute abdominal conditions.' },
  { id: 'sn12', subject: 'Forensic Medicine', title: 'Medico-Legal Aspects — Previous Year 2024', year: '3rd Year', type: 'paper', description: 'Previous year university paper on injury types, postmortem changes, and legal procedures.' },
];

export const STUDENT_QUERIES: StudentQuery[] = [
  { id: 'sq1', studentName: 'Priya Patel', subject: 'Anatomy', question: 'Can you explain the difference between upper and lower motor neuron lesions with clinical examples?', date: '2026-04-08', status: 'pending' },
  { id: 'sq2', studentName: 'Arun Kumar', subject: 'Physiology', question: 'How does the Frank-Starling mechanism work in heart failure patients?', date: '2026-04-07', status: 'answered', answer: 'In heart failure, the Frank-Starling curve is shifted downward. While increased preload still increases contractility, the overall cardiac output remains reduced compared to normal hearts.' },
  { id: 'sq3', studentName: 'Sneha Reddy', subject: 'Pharmacology', question: 'Why is metformin preferred as first-line for Type 2 DM over sulfonylureas?', date: '2026-04-08', status: 'pending' },
  { id: 'sq4', studentName: 'Vikram Singh', subject: 'Pathology', question: 'What is the pathogenesis of atherosclerosis? Can you explain the response-to-injury hypothesis?', date: '2026-04-06', status: 'answered', answer: 'The response-to-injury hypothesis suggests that atherosclerosis begins with endothelial injury. This leads to lipid accumulation, monocyte adhesion, foam cell formation, smooth muscle migration, and eventually plaque formation.' },
];

export const PATIENTS: Patient[] = [
  { id: 'p1', name: 'Rahul Sharma', age: 45, gender: 'Male', condition: 'Type 2 Diabetes, Hypertension', lastVisit: '2026-04-05', nextAppointment: '2026-04-12', status: 'active' },
  { id: 'p2', name: 'Priya Devi', age: 32, gender: 'Female', condition: 'Thyroid Disorder', lastVisit: '2026-04-03', nextAppointment: '2026-04-17', status: 'follow-up' },
  { id: 'p3', name: 'Mohammed Ali', age: 58, gender: 'Male', condition: 'COPD, Asthma', lastVisit: '2026-04-01', nextAppointment: '', status: 'discharged' },
  { id: 'p4', name: 'Lakshmi Rao', age: 67, gender: 'Female', condition: 'Osteoarthritis', lastVisit: '2026-04-06', nextAppointment: '2026-04-13', status: 'active' },
  { id: 'p5', name: 'Arjun Patel', age: 28, gender: 'Male', condition: 'Acute Gastritis', lastVisit: '2026-04-07', nextAppointment: '2026-04-14', status: 'follow-up' },
  { id: 'p6', name: 'Sunita Kumari', age: 40, gender: 'Female', condition: 'Iron Deficiency Anemia', lastVisit: '2026-04-04', nextAppointment: '2026-04-11', status: 'active' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientName: 'Rahul Sharma', doctorName: 'Dr. Anil Mehta', department: 'General Medicine', date: '2026-04-12', time: '10:00 AM', tokenNumber: 12, status: 'scheduled' },
  { id: 'a2', patientName: 'Priya Devi', doctorName: 'Dr. Sunita Verma', department: 'Endocrinology', date: '2026-04-17', time: '11:30 AM', tokenNumber: 8, status: 'scheduled' },
  { id: 'a3', patientName: 'Lakshmi Rao', doctorName: 'Dr. Rajesh Kumar', department: 'Orthopedics', date: '2026-04-13', time: '2:00 PM', tokenNumber: 5, status: 'scheduled' },
  { id: 'a4', patientName: 'Arjun Patel', doctorName: 'Dr. Anil Mehta', department: 'General Medicine', date: '2026-04-14', time: '9:30 AM', tokenNumber: 3, status: 'scheduled' },
];

export const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Orthopedics', 'Dermatology',
  'Endocrinology', 'Neurology', 'Pediatrics', 'Gynecology',
  'ENT', 'Ophthalmology', 'Psychiatry', 'Surgery',
];

export const DOCTORS = [
  { name: 'Dr. Anil Mehta', department: 'General Medicine', available: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM'] },
  { name: 'Dr. Sunita Verma', department: 'Endocrinology', available: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '3:00 PM', '3:30 PM'] },
  { name: 'Dr. Rajesh Kumar', department: 'Orthopedics', available: ['9:00 AM', '9:30 AM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM'] },
  { name: 'Dr. Meena Iyer', department: 'Cardiology', available: ['10:00 AM', '11:00 AM', '11:30 AM', '2:00 PM', '3:00 PM'] },
  { name: 'Dr. Vikram Shah', department: 'Neurology', available: ['9:30 AM', '10:00 AM', '10:30 AM', '2:30 PM', '3:30 PM'] },
  { name: 'Dr. Pooja Nair', department: 'Dermatology', available: ['10:00 AM', '10:30 AM', '11:00 AM', '3:00 PM', '3:30 PM', '4:00 PM'] },
  { name: 'Dr. Kiran Joshi', department: 'Pediatrics', available: ['9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '2:00 PM'] },
  { name: 'Dr. Ananya Gupta', department: 'Gynecology', available: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '3:00 PM'] },
];
