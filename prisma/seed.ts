import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Bilal Hospital Management System Database...');

  // 1. Create Core Users & Staff
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bilalhospital.com',
      passwordHash: 'argon2_hashed_admin_pass',
      fullName: 'System Administrator',
      role: 'ADMIN',
    },
  });

  const recepUser = await prisma.user.upsert({
    where: { username: 'receptionist1' },
    update: {},
    create: {
      username: 'receptionist1',
      email: 'reception@bilalhospital.com',
      passwordHash: 'argon2_hashed_recep_pass',
      fullName: 'Ayesha Khan (Head Receptionist)',
      role: 'RECEPTIONIST',
    },
  });

  const doc1User = await prisma.user.upsert({
    where: { username: 'dr_bilal' },
    update: {},
    create: {
      username: 'dr_bilal',
      email: 'dr.bilal@bilalhospital.com',
      passwordHash: 'argon2_hashed_doc_pass',
      fullName: 'Dr. Bilal Ahmad',
      role: 'CONSULTANT',
    },
  });

  const doc2User = await prisma.user.upsert({
    where: { username: 'dr_sarah' },
    update: {},
    create: {
      username: 'dr_sarah',
      email: 'dr.sarah@bilalhospital.com',
      passwordHash: 'argon2_hashed_doc_pass',
      fullName: 'Dr. Sarah Fatima',
      role: 'CONSULTANT',
    },
  });

  const labUser = await prisma.user.upsert({
    where: { username: 'lab_tech1' },
    update: {},
    create: {
      username: 'lab_tech1',
      email: 'lab@bilalhospital.com',
      passwordHash: 'argon2_hashed_lab_pass',
      fullName: 'Muhammad Usman (Lab Incharge)',
      role: 'LAB_STAFF',
    },
  });

  const pharmUser = await prisma.user.upsert({
    where: { username: 'pharmacist1' },
    update: {},
    create: {
      username: 'pharmacist1',
      email: 'pharmacy@bilalhospital.com',
      passwordHash: 'argon2_hashed_pharm_pass',
      fullName: 'Zainab Bibi (Chief Pharmacist)',
      role: 'PHARMACY_STAFF',
    },
  });

  const usUser = await prisma.user.upsert({
    where: { username: 'ultrasound_tech1' },
    update: {},
    create: {
      username: 'ultrasound_tech1',
      email: 'ultrasound@bilalhospital.com',
      passwordHash: 'argon2_hashed_us_pass',
      fullName: 'Dr. Kamran Raza (Sonologist)',
      role: 'ULTRASOUND_STAFF',
    },
  });

  // Consultant Profiles
  const doc1Profile = await prisma.consultant.upsert({
    where: { userId: doc1User.id },
    update: {},
    create: {
      userId: doc1User.id,
      specialty: 'Cardiology & Internal Medicine',
      department: 'Cardiology',
      qualification: 'MBBS, FCPS (Cardiology)',
      roomNumber: 'OPD-102',
      consultationFee: 2000.0,
    },
  });

  const doc2Profile = await prisma.consultant.upsert({
    where: { userId: doc2User.id },
    update: {},
    create: {
      userId: doc2User.id,
      specialty: 'Gynecology & Obstetrics',
      department: 'Gynecology',
      qualification: 'MBBS, MCPS, FCPS (Gyne)',
      roomNumber: 'OPD-204',
      consultationFee: 2500.0,
    },
  });

  // 2. Create Sample Patients
  const patient1 = await prisma.patient.upsert({
    where: { mrNumber: 'MR-2026-0001' },
    update: {},
    create: {
      mrNumber: 'MR-2026-0001',
      fullName: 'Tariq Mehmood',
      fatherHusbandName: 'Abdul Rehman',
      gender: 'Male',
      age: 48,
      phone: '03001234567',
      cnic: '35202-1234567-1',
      bloodGroup: 'B+',
      createdBy: recepUser.id,
      notes: 'Hypertensive patient, allergic to penicillin.',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { mrNumber: 'MR-2026-0002' },
    update: {},
    create: {
      mrNumber: 'MR-2026-0002',
      fullName: 'Sobia Imran',
      fatherHusbandName: 'Imran Ashraf',
      gender: 'Female',
      age: 32,
      phone: '03219876543',
      cnic: '35201-9876543-2',
      bloodGroup: 'O+',
      createdBy: recepUser.id,
      notes: 'Antenatal care (24 weeks pregnant).',
    },
  });

  // 3. Create Sample Visits / Encounters
  const visit1 = await prisma.patientVisit.upsert({
    where: { visitNumber: 'VIS-2026-0901' },
    update: {},
    create: {
      visitNumber: 'VIS-2026-0901',
      patientId: patient1.id,
      consultantId: doc1Profile.id,
      department: 'Cardiology',
      consultationFee: 2000.0,
      amountReceived: 2000.0,
      paymentMethod: 'CASH',
      receptionistId: recepUser.id,
      status: 'COMPLETED',
      reasonForVisit: 'Chest discomfort and dizziness',
    },
  });

  const visit2 = await prisma.patientVisit.upsert({
    where: { visitNumber: 'VIS-2026-0902' },
    update: {},
    create: {
      visitNumber: 'VIS-2026-0902',
      patientId: patient2.id,
      consultantId: doc2Profile.id,
      department: 'Gynecology',
      consultationFee: 2500.0,
      amountReceived: 2500.0,
      paymentMethod: 'CASH',
      receptionistId: recepUser.id,
      status: 'WITH_CONSULTANT',
      reasonForVisit: 'Routine 2nd trimester ultrasound & checkup',
    },
  });

  // 4. Create Consultation & Prescription
  const consultation1 = await prisma.consultation.create({
    data: {
      visitId: visit1.id,
      patientId: patient1.id,
      consultantId: doc1Profile.id,
      chiefComplaint: 'Mild retrosternal chest discomfort, elevated BP',
      symptoms: 'Headache, fatigue, palpitations for 3 days',
      diagnosis: 'Essential Hypertension Grade II',
      bpSystolic: 155,
      bpDiastolic: 95,
      temperature: 98.6,
      pulse: 84,
      weight: 78.5,
      clinicalNotes: 'ECG shows sinus rhythm without acute ischemic changes. Advised lipid profile & CBC.',
      advice: 'Low salt diet, regular morning walk, avoid stressful triggers.',
    },
  });

  await prisma.prescription.create({
    data: {
      patientId: patient1.id,
      visitId: visit1.id,
      consultantId: doc1Profile.id,
      consultationId: consultation1.id,
      diagnosis: 'Essential Hypertension',
      notes: 'Take medicines regularly after meals.',
      items: {
        create: [
          {
            medicineName: 'Tab. Softavas 5mg (Amlodipine)',
            dosage: '5mg',
            frequency: '1-0-0 (Morning)',
            duration: '30 Days',
            route: 'Oral',
            instructions: 'Take after breakfast',
          },
          {
            medicineName: 'Tab. Lipiget 10mg (Atorvastatin)',
            dosage: '10mg',
            frequency: '0-0-1 (Night)',
            duration: '30 Days',
            route: 'Oral',
            instructions: 'Take before sleep',
          },
        ],
      },
    },
  });

  // 5. Create Lab Order & Versioned Reports
  const labOrder1 = await prisma.labOrder.create({
    data: {
      orderNumber: 'LAB-2026-0881',
      patientId: patient1.id,
      visitId: visit1.id,
      consultantId: doc1Profile.id,
      testCategory: 'Haematology & Biochemistry',
      clinicalNotes: 'Check for anemia & lipid elevation',
      priority: 'URGENT',
      status: 'ACCEPTED',
      totalFee: 1800.0,
      items: {
        create: [
          { testName: 'Complete Blood Count (CBC)', testCode: 'CBC-01', unitPrice: 600.0 },
          { testName: 'Lipid Profile', testCode: 'LIPID-02', unitPrice: 1200.0 },
        ],
      },
    },
  });

  const labReport1 = await prisma.labReport.create({
    data: {
      labOrderId: labOrder1.id,
      currentVersion: 2,
      isAccepted: true,
      acceptedAt: new Date(),
      acceptedBy: doc1User.fullName,
      versions: {
        create: [
          {
            versionNumber: 1,
            structuredResult: JSON.stringify({
              hb: '12.1 g/dL',
              tlc: '7,800 /uL',
              platelets: '140,000 /uL',
              cholesterol: '245 mg/dL',
              triglycerides: '190 mg/dL',
            }),
            summary: 'Mild hypercholesterolemia. Platelets low border.',
            performedBy: labUser.fullName,
          },
          {
            versionNumber: 2,
            structuredResult: JSON.stringify({
              hb: '12.4 g/dL',
              tlc: '7,800 /uL',
              platelets: '210,000 /uL (Re-verified manually)',
              cholesterol: '245 mg/dL',
              triglycerides: '190 mg/dL',
            }),
            summary: 'Platelet count repeated manually under microscope: Normal 210k.',
            performedBy: labUser.fullName,
          },
        ],
      },
    },
  });

  await prisma.labRevisionRequest.create({
    data: {
      labOrderId: labOrder1.id,
      labReportId: labReport1.id,
      consultantId: doc1Profile.id,
      versionTarget: 1,
      reason: 'Platelet count discrepancy',
      comment: 'Please repeat platelet count manually under microscope to rule out clumping.',
      status: 'RESOLVED',
      resolvedAt: new Date(),
    },
  });

  // 6. Create Pharmacy Inventory
  await prisma.medicine.create({
    data: {
      genericName: 'Amlodipine Besylate',
      brandName: 'Softavas 5mg',
      category: 'Antihypertensive',
      manufacturer: 'Getz Pharma',
      purchasePrice: 12.0,
      salePrice: 18.0,
      availableQuantity: 450,
      reorderLevel: 50,
      batches: {
        create: [
          {
            batchNumber: 'B26-090',
            expiryDate: new Date('2028-06-30'),
            quantity: 500,
            costPrice: 12.0,
            supplier: 'Getz Distributors',
          },
        ],
      },
    },
  });

  // 7. Create Financial Cash Ledger Entries
  await prisma.cashTransaction.createMany({
    data: [
      {
        transactionNumber: 'TXN-2026-0001',
        transactionType: 'INCOME',
        category: 'Consultation Fee',
        department: 'Cardiology',
        amount: 2000.0,
        paymentMethod: 'CASH',
        description: 'Consultation Fee - Tariq Mehmood (MR-2026-0001)',
        patientId: patient1.id,
        visitId: visit1.id,
        createdById: recepUser.id,
      },
      {
        transactionNumber: 'TXN-2026-0002',
        transactionType: 'INCOME',
        category: 'Laboratory Test',
        department: 'Laboratory',
        amount: 1800.0,
        paymentMethod: 'CASH',
        description: 'Lab test fee (CBC & Lipid Profile) - MR-2026-0001',
        patientId: patient1.id,
        visitId: visit1.id,
        createdById: recepUser.id,
      },
      {
        transactionNumber: 'TXN-2026-0003',
        transactionType: 'INCOME',
        category: 'Consultation Fee',
        department: 'Gynecology',
        amount: 2500.0,
        paymentMethod: 'CASH',
        description: 'Consultation Fee - Sobia Imran (MR-2026-0002)',
        patientId: patient2.id,
        visitId: visit2.id,
        createdById: recepUser.id,
      },
      {
        transactionNumber: 'TXN-2026-0004',
        transactionType: 'EXPENSE',
        category: 'Hospital Supplies',
        department: 'Administration',
        amount: 3500.0,
        paymentMethod: 'CASH',
        description: 'Purchased emergency ECG paper rolls & sterile gloves',
        createdById: adminUser.id,
      },
    ],
  });

  console.log('Database successfully seeded with realistic sample data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
