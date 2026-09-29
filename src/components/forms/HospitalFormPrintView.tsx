import React from "react";

export interface PrintableFormProps {
  formType: "REFERRAL" | "DISCHARGE" | "ADMISSION" | "OPERATION" | "DOCTOR_NOTE";
  data: any;
  onClose?: () => void;
}

export const HospitalFormPrintView: React.FC<PrintableFormProps> = ({
  formType,
  data,
  onClose,
}) => {
  const patient = data?.patient || {};
  const medicines = data?.medicines || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-4 max-w-4xl mx-auto font-sans print:p-0 print:m-0 print:w-full print:max-w-none">
      {/* Action Bar (Hidden when printing) */}
      {onClose && (
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 print:hidden">
          <h2 className="text-lg font-bold text-slate-800">
            Form Print / PDF Preview — {formType.replace("_", " ")}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* --- A4 DOCUMENT CONTAINER --- */}
      <div className="bg-white p-6 border border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 text-slate-900 text-xs leading-snug">
        
        {/* 1. REFERRAL FORM */}
        {formType === "REFERRAL" && (
          <div className="border border-slate-900">
            {/* Header Title */}
            <div className="border-b border-slate-900 p-2 text-center font-bold text-sm bg-slate-100 uppercase tracking-wide">
              REFERRAL FORM (File Record Copy)
            </div>

            {/* Header Table */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">MR Number:</span>
                <span className="font-mono">{patient.mrNumber || data.mrNumber}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Date:</span>
                <span>{data.formDate ? new Date(data.formDate).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">Patient name:</span>
                <span className="font-bold">{patient.fullName || data.patientName}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Date of Admission:</span>
                <span>{data.dateOfAdmission ? new Date(data.dateOfAdmission).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">S/o, D/o, W/o:</span>
                <span>{patient.fatherHusbandName || ""}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Age/Sex:</span>
                <span>{patient.age || ""} Y / {patient.gender || ""}</span>
              </div>
            </div>

            {/* Clinical Blocks */}
            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Presenting Complaint:</span>
              <p className="whitespace-pre-wrap">{data.presentingComplaint}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Provisional Diagnosis:</span>
              <p className="whitespace-pre-wrap">{data.provisionalDiagnosis}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[60px]">
              <span className="font-bold block mb-1">Brief History & Examination:</span>
              <p className="whitespace-pre-wrap">{data.briefHistoryExamination}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Investigations Significant Results:</span>
              <p className="whitespace-pre-wrap">{data.investigationsResults}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[40px]">
              <span className="font-bold block mb-1">Diagnosis:</span>
              <p className="whitespace-pre-wrap">{data.diagnosis}</p>
            </div>

            {/* Procedure & Condition Row */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">PROCEDURE DONE :</span>
                <span className="ml-2">{data.procedureDone}</span>
              </div>
              <div className="p-2">
                <span className="font-bold block mb-1">Condition at the time of Refer:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={data.conditionAtRefer === "Satisfactory"} readOnly /> Satisfactory
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={data.conditionAtRefer === "Fair"} readOnly /> Fair
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={data.conditionAtRefer === "Poor"} readOnly /> Poor
                  </label>
                </div>
              </div>
            </div>

            {/* Referral Notes & Treatment Table */}
            <div className="border-b border-slate-900">
              <div className="p-1.5 font-bold bg-slate-50 border-b border-slate-900">
                Referral Notes
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 font-bold bg-slate-100 text-[11px]">
                    <th className="p-1.5 border-r border-slate-900 w-10 text-center">Treatment Given</th>
                    <th className="p-1.5 border-r border-slate-900 w-10">Sr. No</th>
                    <th className="p-1.5 border-r border-slate-900">Medicine</th>
                    <th className="p-1.5 border-r border-slate-900">Strength / Dose</th>
                    <th className="p-1.5 border-r border-slate-900">Route</th>
                    <th className="p-1.5 border-r border-slate-900">Frequency</th>
                    <th className="p-1.5 border-r border-slate-900">Timing</th>
                    <th className="p-1.5">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(medicines.length > 0 ? medicines : [{}, {}, {}, {}]).map((m: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-300">
                      {idx === 0 && (
                        <td rowSpan={Math.max(4, medicines.length)} className="p-1 border-r border-slate-900 text-[10px] font-bold text-center rotate-[-90deg] whitespace-nowrap">
                          Treatment Given
                        </td>
                      )}
                      <td className="p-1.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.medicine || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.dose || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.route || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.frequency || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.timing || ""}</td>
                      <td className="p-1.5">{m.duration || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Destination & Reason */}
            <div className="border-b border-slate-900 p-2 min-h-[40px]">
              <span className="font-bold block mb-1">Name of Hospital to be Referred:</span>
              <p>{data.referredHospitalName}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Reason of Refer:</span>
              <p className="whitespace-pre-wrap">{data.reasonForReferral}</p>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Doctor Name:</span>
                <p className="mt-1 font-semibold">{data.doctorName}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Sign:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-1"></div>
              </div>
              <div className="p-2">
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="font-bold">Date:</span>
                  <span>{data.signDate ? new Date(data.signDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Time:</span>
                  <span>{data.signTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. DISCHARGE FORM */}
        {formType === "DISCHARGE" && (
          <div className="border border-slate-900">
            {/* Header Title */}
            <div className="border-b border-slate-900 p-2 text-center font-bold text-sm bg-slate-100 uppercase tracking-wide">
              DISCHARGE FORM (File Record Copy)
            </div>

            {/* Header Grid */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">MR Number:</span>
                <span className="font-mono">{patient.mrNumber || data.mrNumber}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Date:</span>
                <span>{data.formDate ? new Date(data.formDate).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">Patient name:</span>
                <span className="font-bold">{patient.fullName || data.patientName}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Date of Admission:</span>
                <span>{data.dateOfAdmission ? new Date(data.dateOfAdmission).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">S/o, D/o, W/o:</span>
                <span>{patient.fatherHusbandName || ""}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Age/Sex:</span>
                <span>{patient.age || ""} Y / {patient.gender || ""}</span>
              </div>
            </div>

            {/* Clinical Details */}
            <div className="border-b border-slate-900 p-2 min-h-[45px]">
              <span className="font-bold block mb-1">Presenting Complaint:</span>
              <p className="whitespace-pre-wrap">{data.presentingComplaint}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Brief History & Examination:</span>
              <p className="whitespace-pre-wrap">{data.briefHistoryExamination}</p>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[50px]">
              <span className="font-bold block mb-1">Diagnostic Investigations Significant Results:</span>
              <p className="whitespace-pre-wrap">{data.diagnosticInvestigations}</p>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold block mb-1">Diagnosis:</span>
                <p>{data.diagnosis}</p>
              </div>
              <div className="p-2">
                <span className="font-bold block mb-1">Procedure done / Outcome:</span>
                <p>{data.procedureDone} {data.outcome ? `(${data.outcome})` : ""}</p>
              </div>
            </div>

            {/* Discharge Notes Section */}
            <div className="border-b border-slate-900">
              <div className="p-1.5 font-bold bg-slate-100 border-b border-slate-900 text-center uppercase">
                DISCHARGE NOTES
              </div>
              <div className="grid grid-cols-3 p-2 text-[11px] border-b border-slate-900">
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 font-bold">
                    <input type="checkbox" checked={!!data.dischargeAdvisedByDoctor} readOnly /> Discharge advised by Doctor
                  </label>
                  <label className="flex items-center gap-1.5 font-bold">
                    <input type="checkbox" checked={!!data.isLAMA} readOnly /> LAMA
                  </label>
                </div>
                <div>
                  <span className="font-bold block">Date of Discharge:</span>
                  <span>{data.dischargeDate ? new Date(data.dischargeDate).toLocaleDateString() : "....... / ....... / ......."}</span>
                </div>
                <div>
                  <span className="font-bold block mb-1">Condition on Discharge:</span>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={data.dischargeCondition === "Satisfactory"} readOnly /> Satisfactory
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={data.dischargeCondition === "Fair"} readOnly /> Fair
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={data.dischargeCondition === "Poor"} readOnly /> Poor
                    </label>
                  </div>
                </div>
              </div>

              {/* Medication Table */}
              <div className="p-1.5 font-bold bg-slate-50 border-b border-slate-900 text-center">
                Medication Given on Discharge
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 font-bold bg-slate-100 text-[11px]">
                    <th className="p-1.5 border-r border-slate-900 w-10">Sr. No.</th>
                    <th className="p-1.5 border-r border-slate-900">Medicine</th>
                    <th className="p-1.5 border-r border-slate-900">Strength / Dose</th>
                    <th className="p-1.5 border-r border-slate-900">Route</th>
                    <th className="p-1.5 border-r border-slate-900">Frequency</th>
                    <th className="p-1.5 border-r border-slate-900">Timing</th>
                    <th className="p-1.5">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(medicines.length > 0 ? medicines : [{}, {}, {}, {}, {}]).map((m: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-300">
                      <td className="p-1.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.medicine || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.dose || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.route || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.frequency || ""}</td>
                      <td className="p-1.5 border-r border-slate-900">{m.timing || ""}</td>
                      <td className="p-1.5">{m.duration || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Urdu Follow-up Instructions */}
            <div className="border-b border-slate-900 p-3 text-right font-semibold space-y-2 bg-slate-50/50">
              <p className="text-sm font-bold">درج ذیل تاریخ کو ہسپتال ہذا کے درج ذیل ڈیپارٹمنٹ میں معائنہ کیلئے تشریف لائیے۔</p>
              <div className="flex justify-between items-center text-xs dir-rtl">
                <div>
                  <span className="font-bold">تاریخ معائنہ : </span>
                  <span>{data.followUpDate ? new Date(data.followUpDate).toLocaleDateString() : "_________________"}</span>
                </div>
                <div>
                  <span className="font-bold">ڈیپارٹمنٹ : </span>
                  <span>{data.followUpDepartment || "_________________"}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold">ہدایات برائے خوراک : </span>
                <span className="font-normal">{data.dietaryInstructions || "____________________________________________________________________"}</span>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Doctor Name:</span>
                <p className="mt-1 font-semibold">{data.doctorName}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Sign:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-1"></div>
              </div>
              <div className="p-2">
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="font-bold">Date:</span>
                  <span>{data.signDate ? new Date(data.signDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Time:</span>
                  <span>{data.signTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ADMISSION FORM */}
        {formType === "ADMISSION" && (
          <div className="border border-slate-900">
            {/* Top PHC Reg */}
            <div className="flex justify-between items-center p-2 border-b border-slate-900 bg-slate-50 font-mono text-xs">
              <span className="font-bold text-sm">BILAL HOSPITAL ADMISSION FORM</span>
              <span>PHC Reg: # R-<u>{data.phcRegNumber || "________"}</u></span>
            </div>

            {/* Patient Data Grid */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Medical Record Number (MR):</span>
                <span className="font-mono font-bold ml-2 text-sm">{patient.mrNumber || data.mrNumber}</span>
              </div>
              <div className="p-2 flex justify-between">
                <div>
                  <span className="font-bold">Date of Admission (DoA):</span>
                  <span className="ml-1">{data.dateOfAdmission ? new Date(data.dateOfAdmission).toLocaleDateString() : ""}</span>
                </div>
                <div>
                  <span className="font-bold">Time (ToA):</span>
                  <span className="ml-1">{data.timeOfAdmission || ""}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Patient Name:</span>
                <span className="font-bold ml-2 text-sm">{patient.fullName || data.patientName}</span>
              </div>
              <div className="p-2">
                <span className="font-bold">Age/Sex:</span>
                <span className="ml-2">{patient.age || ""} Y / {patient.gender || ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Marital Status:</span>
                <span className="ml-2">{data.maritalStatus || "Unspecified"}</span>
              </div>
              <div className="p-2 flex items-center gap-2">
                <span className="font-bold">CNIC:</span>
                <div className="font-mono font-bold tracking-widest border border-slate-800 px-2 py-0.5 bg-slate-50">
                  {patient.cnic || data.cnic || "_____ - _______ - _"}
                </div>
              </div>
            </div>

            <div className="p-2 border-b border-slate-900">
              <span className="font-bold">S/o, D/o, W/o or Spouse Name:</span>
              <span className="ml-2">{patient.fatherHusbandName || ""}</span>
            </div>

            <div className="p-2 border-b border-slate-900">
              <span className="font-bold">Address:</span>
              <span className="ml-2">{patient.address || ""}</span>
            </div>

            <div className="p-2 border-b border-slate-900">
              <span className="font-bold">Contact: Mobile / Landline:</span>
              <span className="ml-2 font-mono">{patient.phone || ""}</span>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900 min-h-[40px]">
                <span className="font-bold block">Provisional Diagnosis:</span>
                <p>{data.provisionalDiagnosis}</p>
              </div>
              <div className="p-2 min-h-[40px]">
                <span className="font-bold block">Final Diagnosis:</span>
                <p>{data.finalDiagnosis}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold block mb-1">Admitted through:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1 font-bold">
                    <input type="checkbox" checked={data.admittedThrough === "OPD"} readOnly /> OPD
                  </label>
                  <label className="flex items-center gap-1 font-bold">
                    <input type="checkbox" checked={data.admittedThrough === "Emergency"} readOnly /> Emergency
                  </label>
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="font-bold">OPD/ER MR No. (if any) :- </span>
                  <span className="font-mono">{data.opdErMrNo || ""}</span>
                </div>
              </div>

              <div className="p-2">
                <span className="font-bold block mb-1">Date of Discharge/Refer (DoD/R):</span>
                <span>{data.dateOfDischargeRefer ? new Date(data.dateOfDischargeRefer).toLocaleDateString() : "_______"}</span>
                <div className="mt-1">
                  <span className="font-bold">Time (ToD/R): </span>
                  <span>{data.timeOfDischargeRefer || "_______"}</span>
                </div>
              </div>
            </div>

            {/* Urdu Consent & Rules Block */}
            <div className="p-4 bg-slate-50/60 text-right space-y-3 font-semibold">
              <div className="border-b border-slate-900 pb-2 text-center">
                <h3 className="text-base font-bold underline">رضامندی فارم منجانب مریضاں ولواحقین مع قواعد و ضوابط ہسپتال</h3>
              </div>

              <p className="leading-relaxed text-[11px] dir-rtl">
                میں امیرامریض /علاج کی غرض سے ہسپتال ہذا میں آیا/آئی/لایا/لائی ہوں۔ اس سلسلے میں معائنے/تشخیص کے لیے درکار کارروائی اور داخلے کی اجازت دیتا/دیتی ہوں اور یہ کہ اس دوران کسی بھی قسم کی پیچیدگی پیش آنے کی صورت میں ہسپتال کا عملہ یا ڈاکٹر ہرگز ذمہ دار نہیں ہوگا۔ مجھے ہسپتال میں داخلے کی ضرورت کے بارے میں باقاعدہ طور پر آگاہ کر دیا گیا ہے۔ میں نے بیماری سے متعلق تمام مطلوبہ معلومات متعلقہ ہسپتال/معالج کو باضابطہ طور پر فراہم کر دی ہیں۔
              </p>
              <p className="leading-relaxed text-[11px] dir-rtl">
                مجھے علاج کے ممکنہ دورانیے اور تخمینے کے بارے میں بتا دیا گیا ہے اور یہ بھی بتا دیا گیا ہے کہ اگر علاج میں کوئی تبدیلی ہوئی تو اخراجات میں بھی تبدیلی ہو سکتی ہے۔ میں اس بات کی باقاعدہ اجازت دیتا/دیتی ہوں کہ میری بیماری سے متعلق معلومات ضرورت کے مطابق متعلقہ مجاز اداروں کو مہیا کی جا سکتی ہیں۔
              </p>
              <p className="leading-relaxed text-[11px] dir-rtl">
                میں ہسپتال کے قوانین کی پابندی کروں گا/گی اور عملے کے ساتھ تعاون کروں گا/گی اور ہسپتال میں قیام کے دوران مندرجہ ذیل قواعد و ضوابط کا پابند رہوں گا/گی۔
              </p>

              <div className="space-y-1 text-[11px] font-bold text-slate-800 dir-rtl">
                <p>٭ میں اپنی قیمتی اشیاء خصوصاً سونا، چاندی، موبائل وغیرہ کی حفاظت خود کروں گا/گی اور مشتبہ افراد سے ہوشیار رہوں گا/گی۔</p>
                <p>٭ میں نہ ہی کسی دوسرے سے کوئی چیز لے کر کھاؤں گا/گی اور نہ ہی ہسپتال کی حدود میں کوئی آتش گیر مادہ، اسلحہ وغیرہ لے کر آؤں گا۔ نیز یہ کہ کوئی غیر قانونی کام نہیں کروں گا/گی۔</p>
              </div>

              {/* Consent Signature Line */}
              <div className="pt-6 border-t border-slate-400 flex justify-between items-center text-xs font-bold dir-rtl">
                <div>
                  <span>نام مریض / قریبی رشتہ دار: </span>
                  <span className="underline">{data.consentName || patient.fullName || "________________________"}</span>
                  {data.consentRelation && <span className="mr-2">({data.consentRelation})</span>}
                </div>
                <div>
                  <span>دستخط: </span>
                  <span>____________________________________</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. OPERATION NOTES */}
        {formType === "OPERATION" && (
          <div className="border border-slate-900">
            {/* Header */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">MR Number:</span>
                <span className="font-mono font-bold">{patient.mrNumber || data.mrNumber}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Date:</span>
                <span>{data.operationDate ? new Date(data.operationDate).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-1.5 border-r border-slate-900 flex justify-between">
                <span className="font-bold">Patient Name:</span>
                <span className="font-bold">{patient.fullName || data.patientName}</span>
              </div>
              <div className="p-1.5 flex justify-between">
                <span className="font-bold">Time:</span>
                <span>{data.operationTime || ""}</span>
              </div>
            </div>

            {/* Title */}
            <div className="border-b border-slate-900 p-2 text-center font-bold text-sm bg-slate-100 uppercase tracking-wider">
              OPERATION NOTES
            </div>

            {/* Surgical Team Matrix */}
            <div className="grid grid-cols-2 border-b border-slate-900">
              <div className="p-2 border-r border-slate-900 border-b">
                <span className="font-bold">Surgeon Name:</span>
                <p className="font-semibold">{data.surgeonName}</p>
              </div>
              <div className="p-2 border-b">
                <span className="font-bold">Assistant / Team Name:</span>
                <p>{data.assistantTeamName}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Anesthetist Name:</span>
                <p>{data.anesthetistName}</p>
              </div>
              <div className="p-2">
                <span className="font-bold">Type of Anesthesia:</span>
                <p>{data.anesthesiaType}</p>
              </div>
            </div>

            {/* Incision */}
            <div className="border-b border-slate-900 p-2 min-h-[40px]">
              <span className="font-bold block mb-1">Incision:</span>
              <p>{data.incision}</p>
            </div>

            {/* Procedure */}
            <div className="border-b border-slate-900 p-2 min-h-[70px]">
              <span className="font-bold block mb-1">Procedure:</span>
              <p className="whitespace-pre-wrap">{data.procedureDetails}</p>
            </div>

            {/* Findings */}
            <div className="border-b border-slate-900 p-2 min-h-[70px]">
              <span className="font-bold block mb-1">Findings:</span>
              <p className="whitespace-pre-wrap">{data.findings}</p>
            </div>

            {/* Intra-operative Parameters Grid */}
            <div className="grid grid-cols-3 border-b border-slate-900 text-[11px]">
              <div className="p-2 border-r border-slate-900 border-b">
                <span className="font-bold block">Drain:</span>
                <p>{data.drain || "-"}</p>
              </div>
              <div className="p-2 border-r border-slate-900 border-b">
                <span className="font-bold block">Specimen <em className="font-normal">(if Removed)</em>:</span>
                <p>{data.specimenRemoved || "-"}</p>
              </div>
              <div className="p-2 border-b">
                <span className="font-bold block">Histopathology:</span>
                <p>{data.histopathology || "-"}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold block">Blood Loss:</span>
                <p>{data.bloodLoss || "-"}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold block">Transfusion (Y/N):</span>
                <p>{data.transfusion || "N"}</p>
              </div>
              <div className="p-2">
                <span className="font-bold block">Any Uneventful Development:</span>
                <p>{data.uneventfulDevelopment || "-"}</p>
              </div>
            </div>

            <div className="border-b border-slate-900 p-2 min-h-[40px]">
              <span className="font-bold">Condition at the end of Surgery: </span>
              <span>{data.conditionAtEnd}</span>
            </div>

            {/* Post-Operative Orders */}
            <div className="border-b border-slate-900">
              <div className="p-1.5 font-bold bg-slate-100 border-b border-slate-900 text-center uppercase">
                POST-OPERATIVE ORDER
              </div>
              <div className="p-3 min-h-[120px]">
                <p className="whitespace-pre-wrap leading-relaxed">{data.postOpOrders}</p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Surgeon Name:</span>
                <p className="mt-1 font-semibold">{data.surgeonName}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Sign:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-1"></div>
              </div>
              <div className="p-2">
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="font-bold">Date:</span>
                  <span>{data.signDate ? new Date(data.signDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Time:</span>
                  <span>{data.signTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. DOCTOR NOTES */}
        {formType === "DOCTOR_NOTE" && (
          <div className="border border-slate-900 min-h-[700px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="p-1.5 border-r border-slate-900 flex justify-between">
                  <span className="font-bold">MR Number:</span>
                  <span className="font-mono font-bold">{patient.mrNumber || data.mrNumber}</span>
                </div>
                <div className="p-1.5 flex justify-between">
                  <span className="font-bold">Date:</span>
                  <span>{data.noteDate ? new Date(data.noteDate).toLocaleDateString() : ""}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-900">
                <div className="p-1.5 border-r border-slate-900 flex justify-between">
                  <span className="font-bold">Patient Name:</span>
                  <span className="font-bold">{patient.fullName || data.patientName}</span>
                </div>
                <div className="p-1.5 flex justify-between">
                  <span className="font-bold">Time:</span>
                  <span>{data.noteTime || ""}</span>
                </div>
              </div>

              {/* Title */}
              <div className="border-b border-slate-900 p-2 text-center font-bold text-sm bg-slate-100 uppercase tracking-wider">
                CONSULTANT/MO/WMO - NOTES
              </div>

              {/* Ruled Notes Area */}
              <div className="p-4 min-h-[450px]">
                <p className="whitespace-pre-wrap leading-loose font-serif text-slate-800 text-sm">
                  {data.notes}
                </p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="grid grid-cols-3 border-t border-slate-900">
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Doctor Name:</span>
                <p className="mt-1 font-semibold">{data.doctorName}</p>
              </div>
              <div className="p-2 border-r border-slate-900">
                <span className="font-bold">Sign:</span>
                <div className="h-10 border-b border-dashed border-slate-400 mt-1"></div>
              </div>
              <div className="p-2">
                <div className="flex justify-between border-b pb-1 mb-1">
                  <span className="font-bold">Date:</span>
                  <span>{data.signDate ? new Date(data.signDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Time:</span>
                  <span>{data.signTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
