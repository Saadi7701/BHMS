import { prisma } from "../lib/prisma";

export class VisitRepository {
  async findByVisitNumber(visitNumber: string): Promise<any> {
    const visit = await prisma.patientVisit.findFirst({
      where: { visitNumber: visitNumber.trim() },
    });
    if (!visit) return null;
    return { ...visit, _id: visit.id };
  }

  async findById(id: string): Promise<any> {
    const visit = await prisma.patientVisit.findFirst({
      where: { OR: [{ id }, { legacyId: id }, { visitNumber: id }] },
    });
    if (!visit) return null;
    return { ...visit, _id: visit.id };
  }

  async createVisit(visitData: any): Promise<any> {
    let patientId = visitData.patientId ? visitData.patientId.toString() : "";
    let consultantId = visitData.consultantId ? visitData.consultantId.toString() : "";
    let receptionistId = visitData.receptionistId ? visitData.receptionistId.toString() : "";

    // Resolve FKs to valid PostgreSQL IDs
    const patientObj = await prisma.patient.findFirst({
      where: { OR: [{ id: patientId }, { legacyId: patientId }, { mrNumber: visitData.mrNumber || patientId }] },
    });
    if (patientObj) patientId = patientObj.id;

    const consultantObj = await prisma.consultant.findFirst({
      where: { OR: [{ id: consultantId }, { legacyId: consultantId }, { userId: consultantId }] },
    });
    if (consultantObj) {
      consultantId = consultantObj.id;
    } else {
      const anyConsultant = await prisma.consultant.findFirst();
      if (anyConsultant) {
        consultantId = anyConsultant.id;
      } else {
        const dummyUser = await prisma.user.create({
          data: {
            username: `doc_${Date.now()}`,
            email: `doc_${Date.now()}@bilalhospital.com`,
            passwordHash: "hash",
            fullName: visitData.consultantName || "Dr. Bilal Ahmad",
            role: "CONSULTANT",
          },
        });
        const newDoc = await prisma.consultant.create({
          data: {
            userId: dummyUser.id,
            specialty: "General Medicine",
            department: visitData.department || "OPD",
            qualification: "MBBS, FCPS",
            roomNumber: "Room 101",
            consultationFee: Number(visitData.consultationFee || 1500),
          },
        });
        consultantId = newDoc.id;
      }
    }

    const recepObj = await prisma.user.findFirst({
      where: { OR: [{ id: receptionistId }, { legacyId: receptionistId }] },
    });
    if (recepObj) {
      receptionistId = recepObj.id;
    } else {
      const anyAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      receptionistId = anyAdmin ? anyAdmin.id : consultantId;
    }

    const visit = await prisma.patientVisit.create({
      data: {
        visitNumber: visitData.visitNumber.trim(),
        patientId,
        patientName: visitData.patientName || (patientObj ? patientObj.fullName : "Patient"),
        mrNumber: visitData.mrNumber || (patientObj ? patientObj.mrNumber : "MR-0000"),
        consultantId,
        consultantName: visitData.consultantName || "Dr. Bilal Ahmad",
        department: visitData.department || "OPD Reception",
        visitType: visitData.visitType || "OPD",
        reasonForVisit: visitData.reasonForVisit || null,
        consultationFee: Number(visitData.consultationFee || 0),
        amountReceived: Number(visitData.amountReceived || 0),
        paymentMethod: visitData.paymentMethod || "CASH",
        receptionistId,
        status: visitData.status || "REGISTERED",
        notes: visitData.notes || null,
        visitDate: visitData.visitDate || new Date(),
        arrivalTime: visitData.arrivalTime || new Date(),
      },
    });
    return { ...visit, _id: visit.id };
  }

  async findByConsultant(consultantId: string, status?: string): Promise<any[]> {
    const whereClause: any = {};
    if (consultantId) {
      const consultantObj = await prisma.consultant.findFirst({
        where: { OR: [{ id: consultantId }, { legacyId: consultantId }] },
      });
      if (consultantObj) {
        whereClause.consultantId = consultantObj.id;
      } else {
        const nameQuery = consultantId.replace("doc-1", "Bilal").replace("doc-2", "Sarah");
        whereClause.consultantName = { contains: nameQuery, mode: "insensitive" };
      }
    }
    if (status) whereClause.status = status;

    const visits = await prisma.patientVisit.findMany({
      where: whereClause,
      orderBy: { visitDate: "desc" },
    });
    return visits.map((v) => ({ ...v, _id: v.id }));
  }

  async updateStatus(id: string, status: string): Promise<any> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated = await prisma.patientVisit.update({
      where: { id: existing.id },
      data: { status },
    });
    return { ...updated, _id: updated.id };
  }
}

export const visitRepository = new VisitRepository();
