import { prisma } from "../lib/prisma";

export class PrescriptionRepository {
  async createPrescription(prescriptionData: any): Promise<any> {
    let patientId = prescriptionData.patientId ? prescriptionData.patientId.toString() : "";
    let visitId = prescriptionData.visitId ? prescriptionData.visitId.toString() : "";
    let consultantId = prescriptionData.consultantId ? prescriptionData.consultantId.toString() : "";

    const patientObj = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { legacyId: patientId }, { mrNumber: prescriptionData.mrNumber || patientId }] },
    });
    if (patientObj) patientId = patientObj.id;

    const visitObj = await prisma.patientVisit.findFirst({
      where: { OR: [{ id: visitId }, { legacyId: visitId }, { visitNumber: visitId }] },
    });
    if (visitObj) visitId = visitObj.id;

    const consultantObj = await prisma.consultant.findFirst({
      where: { OR: [{ id: consultantId }, { legacyId: consultantId }] },
    });
    if (consultantObj) {
      consultantId = consultantObj.id;
    } else {
      const anyConsultant = await prisma.consultant.findFirst();
      if (anyConsultant) consultantId = anyConsultant.id;
    }

    const rx = await prisma.prescription.create({
      data: {
        patientId,
        patientName: prescriptionData.patientName || (patientObj ? patientObj.fullName : "Patient"),
        mrNumber: prescriptionData.mrNumber || (patientObj ? patientObj.mrNumber : "MR-0000"),
        visitId,
        consultantId,
        consultantName: prescriptionData.consultantName || "Dr. Bilal Ahmad",
        diagnosis: prescriptionData.diagnosis || "General Consultation",
        notes: prescriptionData.notes || prescriptionData.instructions || null,
        isDispensed: Boolean(prescriptionData.isDispensed),
        prescriptionDate: prescriptionData.prescriptionDate || new Date(),
        items: {
          create: (prescriptionData.items || []).map((item: any) => ({
            medicineName: item.medicineName || item.name || "Medicine",
            dosage: item.dosage || "1-0-1",
            frequency: item.frequency || "BID",
            duration: item.duration || "5 days",
            instructions: item.instructions || null,
          })),
        },
      },
      include: { items: true },
    });

    return { ...rx, _id: rx.id };
  }

  async findByPatient(patientId: string): Promise<any[]> {
    const patientObj = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { legacyId: patientId }, { mrNumber: patientId }] },
    });

    const whereClause: any = patientObj
      ? { patientId: patientObj.id }
      : { OR: [{ mrNumber: patientId }, { legacyId: patientId }] };

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return prescriptions.map((p) => ({ ...p, _id: p.id }));
  }

  async findByVisit(visitId: string): Promise<any> {
    const rx = await prisma.prescription.findFirst({
      where: { OR: [{ visitId }, { legacyId: visitId }] },
      include: { items: true },
    });
    if (!rx) return null;
    return { ...rx, _id: rx.id };
  }

  async markDispensed(id: string): Promise<any> {
    const rxObj = await prisma.prescription.findFirst({
      where: { OR: [{ id }, { legacyId: id }] },
    });
    if (!rxObj) return null;

    const updated = await prisma.prescription.update({
      where: { id: rxObj.id },
      data: { isDispensed: true },
      include: { items: true },
    });
    return { ...updated, _id: updated.id };
  }
}

export const prescriptionRepository = new PrescriptionRepository();
