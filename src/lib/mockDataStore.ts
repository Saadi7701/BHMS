export interface PatientRecord {
  id: string;
  mrNumber: string;
  fullName: string;
  fatherHusbandName: string;
  gender: string;
  age: number;
  phone: string;
  cnic: string;
  bloodGroup: string;
  notes?: string;
  registrationDate: string;
}

export interface ConsultantUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  specialty: string;
  department: string;
  qualification: string;
  roomNumber: string;
  consultationFee: number;
  isActive: boolean;
  lastLoginAt?: string;
}

export interface VisitRecord {
  id: string;
  visitNumber: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  destinationType: "OPD" | "OT" | "GYNECOLOGY" | "LAB" | "ULTRASOUND";
  consultantId: string;
  consultantName: string;
  department: string;
  consultationFee: number;
  amountReceived: number;
  paymentMethod: string;
  status:
    | "REGISTERED"
    | "WAITING"
    | "WITH_CONSULTANT"
    | "CHECKED"
    | "LAB_REQUESTED"
    | "ULTRASOUND_REQUESTED"
    | "PHARMACY"
    | "COMPLETED"
    | "ADMITTED"
    | "IN_OT"
    | "POST_OP"
    | "DISCHARGED";
  reasonForVisit: string;
  visitDate: string;
  arrivalTime: string;
  
  // OT / Gynecology Specific Admission Fields
  admissionId?: string;
  roomBedNumber?: string;
  procedureSurgeonName?: string;
  admissionInTime?: string;
  dischargeOutTime?: string;
}

export interface AdmissionRecord {
  id: string;
  admissionNumber: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  admissionType: "OT" | "GYNECOLOGY";
  department: string;
  doctorName: string;
  procedureOrDiagnosis: string;
  wardRoomBed: string;
  admissionInTime: string;
  dischargeOutTime?: string;
  status: "ADMITTED" | "IN_OT" | "POST_OP" | "RECOVERY" | "DISCHARGED";
  dailyNotes?: string;
  feeAmount: number;
}

export interface ConsultationRecord {
  id: string;
  visitId: string;
  patientId: string;
  consultantId: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  bp: string;
  temperature: number;
  pulse: number;
  weight: number;
  clinicalNotes: string;
  advice: string;
}

export interface PrescriptionItemRecord {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  visitId: string;
  consultantId: string;
  consultantName: string;
  diagnosis: string;
  prescriptionDate: string;
  items: PrescriptionItemRecord[];
  isDispensed: boolean;
}

export interface LabOrderRecord {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  visitId: string;
  consultantId: string;
  consultantName: string;
  testCategory: string;
  tests: string[];
  totalFee: number;
  priority: "NORMAL" | "URGENT";
  status:
    | "ORDERED"
    | "SAMPLE_COLLECTED"
    | "PROCESSING"
    | "REPORT_PREPARED"
    | "SUBMITTED_TO_CONSULTANT"
    | "REVISION_REQUESTED"
    | "ACCEPTED";
  requestDate: string;
  currentVersion: number;
  resultsV1?: string;
  resultsV2?: string;
  revisionReason?: string;
  revisionComment?: string;
  
  // File Upload Fields for Consultant Easy View
  attachedPdfUrl?: string;
  attachedPdfName?: string;
  attachedImageBase64?: string;
}

export interface UltrasoundOrderRecord {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  mrNumber: string;
  visitId: string;
  consultantId: string;
  consultantName: string;
  requestedExam: string;
  clinicalIndication: string;
  totalFee: number;
  status:
    | "ORDERED"
    | "PROCESSING"
    | "REPORT_PREPARED"
    | "SUBMITTED_TO_CONSULTANT"
    | "REVISION_REQUESTED"
    | "ACCEPTED";
  requestDate: string;
  currentVersion: number;
  findingsV1?: string;
  impressionV1?: string;
  findingsV2?: string;
  impressionV2?: string;
  revisionReason?: string;

  // File Upload Fields for Consultant Easy View
  attachedPdfUrl?: string;
  attachedImageUrl?: string;
  attachedFileName?: string;
}

export interface MedicineRecord {
  id: string;
  genericName: string;
  brandName: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  availableQty: number;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string;
}

export interface CashTransactionRecord {
  id: string;
  transactionNumber: string;
  transactionType: "INCOME" | "EXPENSE" | "REFUND" | "REVERSAL" | "ADJUSTMENT";
  category: string;
  department: string;
  amount: number;
  paymentMethod: string;
  description: string;
  date: string;
  time: string;
  patientName?: string;
  mrNumber?: string;
  createdBy: string;
}

export interface DailyCashClosingRecord {
  id: string;
  date: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  expectedClosing: number;
  actualCash: number;
  difference: number;
  closedBy: string;
  isClosed: boolean;
}

// Initial Data Seed Store
export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: "pat-1",
    mrNumber: "MR-2026-0001",
    fullName: "Tariq Mehmood",
    fatherHusbandName: "Abdul Rehman",
    gender: "Male",
    age: 48,
    phone: "03001234567",
    cnic: "35202-1234567-1",
    bloodGroup: "B+",
    notes: "Hypertensive, penicillin allergy.",
    registrationDate: "2026-09-01",
  },
  {
    id: "pat-2",
    mrNumber: "MR-2026-0002",
    fullName: "Sobia Imran",
    fatherHusbandName: "Imran Ashraf",
    gender: "Female",
    age: 32,
    phone: "03219876543",
    cnic: "35201-9876543-2",
    bloodGroup: "O+",
    notes: "Antenatal care (24 weeks).",
    registrationDate: "2026-09-02",
  },
  {
    id: "pat-3",
    mrNumber: "MR-2026-0003",
    fullName: "Kamran Akmal",
    fatherHusbandName: "Muhammad Akmal",
    gender: "Male",
    age: 55,
    phone: "03334445566",
    cnic: "35202-4445566-7",
    bloodGroup: "A+",
    notes: "Diabetic Type II.",
    registrationDate: "2026-09-03",
  },
];

export const INITIAL_VISITS: VisitRecord[] = [
  {
    id: "vis-1",
    visitNumber: "VIS-2026-0901",
    patientId: "pat-1",
    patientName: "Tariq Mehmood",
    mrNumber: "MR-2026-0001",
    destinationType: "OPD",
    consultantId: "doc-1",
    consultantName: "Dr. Bilal Ahmad (Cardiology)",
    department: "Cardiology",
    consultationFee: 2000,
    amountReceived: 2000,
    paymentMethod: "CASH",
    status: "WITH_CONSULTANT",
    reasonForVisit: "Chest discomfort and elevated BP",
    visitDate: "2026-09-05",
    arrivalTime: "09:30 AM",
  },
  {
    id: "vis-2",
    visitNumber: "VIS-2026-0902",
    patientId: "pat-2",
    patientName: "Sobia Imran",
    mrNumber: "MR-2026-0002",
    destinationType: "OPD",
    consultantId: "doc-2",
    consultantName: "Dr. Sarah Fatima (Gynecology)",
    department: "Gynecology",
    consultationFee: 2500,
    amountReceived: 2500,
    paymentMethod: "CASH",
    status: "WAITING",
    reasonForVisit: "Routine 2nd trimester ultrasound & advice",
    visitDate: "2026-09-05",
    arrivalTime: "10:15 AM",
  },
];

export const INITIAL_ADMISSIONS: AdmissionRecord[] = [
  {
    id: "adm-1",
    admissionNumber: "ADM-OT-2026-01",
    patientId: "pat-3",
    patientName: "Kamran Akmal",
    mrNumber: "MR-2026-0003",
    admissionType: "OT",
    department: "Surgery / OT",
    doctorName: "Dr. Bilal Ahmad",
    procedureOrDiagnosis: "Laparoscopic Cholecystectomy",
    wardRoomBed: "OT-Room # 02 / Bed B",
    admissionInTime: "2026-09-03 08:00 AM",
    status: "IN_OT",
    dailyNotes: "Pre-op checklist complete. Anesthesia clearance given.",
    feeAmount: 35000,
  },
  {
    id: "adm-2",
    admissionNumber: "ADM-GYN-2026-04",
    patientId: "pat-2",
    patientName: "Sobia Imran",
    mrNumber: "MR-2026-0002",
    admissionType: "GYNECOLOGY",
    department: "Gynecology Ward",
    doctorName: "Dr. Sarah Fatima",
    procedureOrDiagnosis: "Elective Lower Segment C-Section",
    wardRoomBed: "Gyne Ward Room 104 / Bed 01",
    admissionInTime: "2026-09-04 09:30 AM",
    status: "ADMITTED",
    dailyNotes: "Admitted for scheduled C-Section monitoring.",
    feeAmount: 45000,
  },
];

export const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: "rx-1",
    patientId: "pat-1",
    patientName: "Tariq Mehmood",
    mrNumber: "MR-2026-0001",
    visitId: "vis-1",
    consultantId: "doc-1",
    consultantName: "Dr. Bilal Ahmad",
    diagnosis: "Essential Hypertension Grade II",
    prescriptionDate: "2026-09-05 09:45 AM",
    isDispensed: false,
    items: [
      {
        medicineName: "Tab. Softavas 5mg (Amlodipine)",
        dosage: "5mg",
        frequency: "1-0-0 (Morning)",
        duration: "30 Days",
        route: "Oral",
        instructions: "Take after breakfast",
      },
      {
        medicineName: "Tab. Lipiget 10mg (Atorvastatin)",
        dosage: "10mg",
        frequency: "0-0-1 (Night)",
        duration: "30 Days",
        route: "Oral",
        instructions: "Take before sleep",
      },
    ],
  },
];

export const INITIAL_LAB_ORDERS: LabOrderRecord[] = [
  {
    id: "lab-1",
    orderNumber: "LAB-2026-0881",
    patientId: "pat-1",
    patientName: "Tariq Mehmood",
    mrNumber: "MR-2026-0001",
    visitId: "vis-1",
    consultantId: "doc-1",
    consultantName: "Dr. Bilal Ahmad",
    testCategory: "Haematology & Biochemistry",
    tests: ["Complete Blood Count (CBC)", "Lipid Profile"],
    totalFee: 1800,
    priority: "URGENT",
    status: "SUBMITTED_TO_CONSULTANT",
    requestDate: "2026-09-05 09:50 AM",
    currentVersion: 1,
    resultsV1: JSON.stringify({
      hb: "12.1 g/dL",
      tlc: "7,800 /uL",
      platelets: "140,000 /uL",
      cholesterol: "245 mg/dL",
      triglycerides: "190 mg/dL",
    }),
    attachedPdfName: "LAB_REPORT_TariqMehmood_CBC_LIPID.pdf",
    attachedPdfUrl: "simulated_lab_report_pdf",
  },
];

export const INITIAL_ULTRASOUND_ORDERS: UltrasoundOrderRecord[] = [
  {
    id: "us-1",
    orderNumber: "US-2026-0412",
    patientId: "pat-2",
    patientName: "Sobia Imran",
    mrNumber: "MR-2026-0002",
    visitId: "vis-2",
    consultantId: "doc-2",
    consultantName: "Dr. Sarah Fatima",
    requestedExam: "Obstetric Anomaly Scan (2nd Trimester)",
    clinicalIndication: "24 Weeks Pregnancy Routine Check",
    totalFee: 3000,
    status: "PROCESSING",
    requestDate: "2026-09-05 10:20 AM",
    currentVersion: 1,
    attachedFileName: "ULTRASOUND_SCAN_SobiaImran_24WK.pdf",
    attachedPdfUrl: "simulated_us_report_pdf",
  },
];

export const INITIAL_MEDICINES: MedicineRecord[] = [
  {
    id: "med-1",
    genericName: "Amlodipine Besylate",
    brandName: "Softavas 5mg",
    category: "Antihypertensive",
    purchasePrice: 12.0,
    salePrice: 18.0,
    availableQty: 450,
    reorderLevel: 50,
    batchNumber: "B26-090",
    expiryDate: "2028-06-30",
  },
  {
    id: "med-2",
    genericName: "Atorvastatin Calcium",
    brandName: "Lipiget 10mg",
    category: "Lipid Lowering Agent",
    purchasePrice: 22.0,
    salePrice: 32.0,
    availableQty: 280,
    reorderLevel: 40,
    batchNumber: "L99-102",
    expiryDate: "2027-12-31",
  },
  {
    id: "med-3",
    genericName: "Paracetamol 500mg",
    brandName: "Panadol 500mg",
    category: "Analgesic",
    purchasePrice: 2.5,
    salePrice: 4.0,
    availableQty: 1200,
    reorderLevel: 150,
    batchNumber: "PN-881",
    expiryDate: "2027-09-15",
  },
  {
    id: "med-4",
    genericName: "Cefixime 400mg",
    brandName: "Caracef 400mg",
    category: "Antibiotic",
    purchasePrice: 45.0,
    salePrice: 65.0,
    availableQty: 18,
    reorderLevel: 30,
    batchNumber: "CF-301",
    expiryDate: "2026-10-15",
  },
];

export const INITIAL_CASH_TRANSACTIONS: CashTransactionRecord[] = [
  {
    id: "txn-1",
    transactionNumber: "TXN-2026-0001",
    transactionType: "INCOME",
    category: "Consultation Fee",
    department: "Cardiology",
    amount: 2000,
    paymentMethod: "CASH",
    description: "Consultation Fee - Tariq Mehmood (MR-2026-0001)",
    date: "2026-09-05",
    time: "09:30 AM",
    patientName: "Tariq Mehmood",
    mrNumber: "MR-2026-0001",
    createdBy: "Ayesha Khan (Reception)",
  },
  {
    id: "txn-2",
    transactionNumber: "TXN-2026-0002",
    transactionType: "INCOME",
    category: "Laboratory Test",
    department: "Laboratory",
    amount: 1800,
    paymentMethod: "CASH",
    description: "Lab test fee (CBC & Lipid Profile) - Tariq Mehmood",
    date: "2026-09-05",
    time: "09:50 AM",
    patientName: "Tariq Mehmood",
    mrNumber: "MR-2026-0001",
    createdBy: "Ayesha Khan (Reception)",
  },
  {
    id: "txn-3",
    transactionNumber: "TXN-2026-0003",
    transactionType: "INCOME",
    category: "Consultation Fee",
    department: "Gynecology",
    amount: 2500,
    paymentMethod: "CASH",
    description: "Consultation Fee - Sobia Imran (MR-2026-0002)",
    date: "2026-09-05",
    time: "10:15 AM",
    patientName: "Sobia Imran",
    mrNumber: "MR-2026-0002",
    createdBy: "Ayesha Khan (Reception)",
  },
  {
    id: "txn-4",
    transactionNumber: "TXN-2026-0004",
    transactionType: "INCOME",
    category: "Ultrasound",
    department: "Ultrasound",
    amount: 3000,
    paymentMethod: "CASH",
    description: "Obstetric Anomaly Scan Fee - Sobia Imran",
    date: "2026-09-05",
    time: "10:20 AM",
    patientName: "Sobia Imran",
    mrNumber: "MR-2026-0002",
    createdBy: "Ayesha Khan (Reception)",
  },
  {
    id: "txn-5",
    transactionNumber: "TXN-2026-0005",
    transactionType: "EXPENSE",
    category: "Hospital Supplies",
    department: "Administration",
    amount: 3500,
    paymentMethod: "CASH",
    description: "Purchased ECG roll paper & sterile gloves for OPD",
    date: "2026-09-05",
    time: "11:00 AM",
    createdBy: "System Administrator",
  },
];

export const INITIAL_CONSULTANTS: ConsultantUser[] = [
  {
    id: "doc-1",
    username: "drbilal",
    password: "password123",
    fullName: "Dr. Bilal Ahmad",
    specialty: "Cardiology & Internal Medicine",
    department: "Cardiology",
    qualification: "MBBS, FCPS (Cardiology)",
    roomNumber: "OPD-102",
    consultationFee: 2000,
    isActive: true,
    lastLoginAt: "2026-09-12 09:30 AM",
  },
  {
    id: "doc-2",
    username: "drsarah",
    password: "password123",
    fullName: "Dr. Sarah Fatima",
    specialty: "Gynecology & Obstetrics",
    department: "Gynecology",
    qualification: "MBBS, MCPS, FCPS (Gyne/Obs)",
    roomNumber: "OPD-204",
    consultationFee: 2500,
    isActive: false,
    lastLoginAt: "2026-09-11 04:15 PM",
  },
];
