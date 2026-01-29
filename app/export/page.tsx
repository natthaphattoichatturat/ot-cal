"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import PayslipPreview from "@/components/PayslipPreview";
import SSO110Preview from "@/components/SSO110Preview";
import PND1Preview from "@/components/PND1Preview";
import PND1KorPreview from "@/components/PND1KorPreview";
import WithholdingCertPreview from "@/components/WithholdingCertPreview";
import { PayslipData } from "@/types/payslip";
import {
  SSO110Data,
  PND1Data,
  PND1GorData,
  WithholdingCertData,
} from "@/types/documents";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Employee {
  employee_id: string;
  name: string;
  department: string;
}

type DocumentType =
  | "payslip"
  | "sso110"
  | "pnd1"
  | "pnd1kor"
  | "withholding-cert";
type FrequencyType = "period" | "monthly" | "yearly";

interface DocumentTypeInfo {
  id: DocumentType;
  name: string;
  description: string;
  icon: string;
  frequency: FrequencyType;
  needsEmployeeSelection: boolean;
}

export default function ExportPage() {
  const { t } = useLanguage();

  // Selection states
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(
    null,
  );
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<1 | 2>(1);

  // Employee selection
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);

  // Preview & Export states
  const [showPreview, setShowPreview] = useState(false);
  const [payslips, setPayslips] = useState<PayslipData[]>([]);
  const [sso110Data, setSSO110Data] = useState<SSO110Data | null>(null);
  const [pnd1Data, setPND1Data] = useState<PND1Data | null>(null);
  const [pnd1KorData, setPND1KorData] = useState<PND1GorData | null>(null);
  const [withholdingCerts, setWithholdingCerts] = useState<
    WithholdingCertData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");

  // Preview pagination for performance
  const [previewPage, setPreviewPage] = useState(1);
  const PREVIEW_ITEMS_PER_PAGE = 5;

  const payslipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sso110SummaryRef = useRef<HTMLDivElement | null>(null);
  const sso110DetailRefs = useRef<(HTMLDivElement | null)[]>([]); // ⭐ เปลี่ยนเป็น array สำหรับหลายหน้า
  const pnd1Ref = useRef<HTMLDivElement | null>(null);

  // ⭐ คำนวณจำนวนหน้า detail ของ SSO110 (25 คนต่อหน้า)
  const SSO110_EMPLOYEES_PER_PAGE = 25;
  const pnd1KorRef = useRef<HTMLDivElement | null>(null);
  const withholdingCertRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Document types configuration
  const documentTypes: DocumentTypeInfo[] = [
    {
      id: "payslip",
      name: t("export.payslip") || "สลิปเงินเดือน",
      description: t("export.payslipDesc") || "ใบจ่ายเงินเดือนพนักงาน",
      icon: "Ⅰ",
      frequency: "period",
      needsEmployeeSelection: true,
    },
    {
      id: "sso110",
      name: t("export.sso110") || "สปส. 1-10",
      description: t("export.sso110Desc") || "แบบส่งเงินสมทบประกันสังคม",
      icon: "Ⅱ",
      frequency: "monthly",
      needsEmployeeSelection: true,
    },
    {
      id: "pnd1",
      name: t("export.pnd1") || "ภ.ง.ด.1 (รวม)",
      description:
        t("export.pnd1Desc") ||
        "แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายเดือน (รวมพนักงานที่เลือก)",
      icon: "Ⅲ",
      frequency: "monthly",
      needsEmployeeSelection: true,
    },
    {
      id: "pnd1kor",
      name: t("export.pnd1kor") || "ภ.ง.ด.1ก",
      description:
        t("export.pnd1korDesc") || "แบบยื่นภาษีเงินได้หัก ณ ที่จ่าย รายปี",
      icon: "Ⅳ",
      frequency: "yearly",
      needsEmployeeSelection: true,
    },
    {
      id: "withholding-cert",
      name: t("export.withholdingCert") || "50 ทวิ",
      description:
        t("export.withholdingCertDesc") || "หนังสือรับรองการหักภาษี ณ ที่จ่าย",
      icon: "Ⅴ",
      frequency: "yearly",
      needsEmployeeSelection: true,
    },
  ];

  const selectedDocTypeInfo = documentTypes.find(
    (d) => d.id === selectedDocType,
  );

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date();
    setSelectedMonth((now.getMonth() + 1).toString().padStart(2, "0"));
    setSelectedYear(now.getFullYear().toString());
  }, []);

  // Search employees
  useEffect(() => {
    const searchEmployees = async () => {
      if (!searchQuery.trim()) {
        setFilteredEmployees(employees);
        return;
      }

      setSearching(true);
      try {
        const query = searchQuery.trim();
        let searchBy = "name";
        if (/^\d/.test(query) || /^[A-Za-z]/.test(query)) {
          searchBy = "employee_id";
        }

        const res = await fetch(
          `/api/employees?search=${encodeURIComponent(query)}&searchBy=${searchBy}&status=active`,
        );
        const data = await res.json();

        if (data.success) {
          setFilteredEmployees(data.data || []);
        } else {
          setFilteredEmployees([]);
        }
      } catch (error) {
        console.error("Error searching employees:", error);
        setFilteredEmployees([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchEmployees, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, employees]);

  // Fetch all employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/employees?status=active&limit=1000");
        const data = await res.json();
        if (data.success) {
          setEmployees(data.data || []);
          setFilteredEmployees(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Reset states when changing document type
  useEffect(() => {
    setShowPreview(false);
    setSelectedEmployees([]);
    setPayslips([]);
    setSSO110Data(null);
    setPND1Data(null);
    setPND1KorData(null);
    setWithholdingCerts([]);
    setMessage("");
    setPreviewPage(1);
  }, [selectedDocType]);

  const toggleEmployee = (employeeId: string) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const selectAllEmployees = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.employee_id));
    }
  };

  const handleGeneratePreview = async () => {
    if (
      selectedDocTypeInfo?.needsEmployeeSelection &&
      selectedEmployees.length === 0
    ) {
      setMessage(
        t("export.selectAtLeastOne") || "กรุณาเลือกพนักงานอย่างน้อย 1 คน",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const monthStr = `${selectedYear}-${selectedMonth}`;

      switch (selectedDocType) {
        case "payslip": {
          const res = await fetch(
            `/api/export/payslip?employeeIds=${selectedEmployees.join(",")}&month=${monthStr}&period=${selectedPeriod}`,
          );
          const data = await res.json();
          if (data.success) {
            setPayslips(data.data);
            setShowPreview(true);
          } else {
            setMessage(`${t("common.error")}: ${data.error}`);
          }
          break;
        }

        case "sso110": {
          const res = await fetch(
            `/api/export/sso110?month=${monthStr}&employeeIds=${selectedEmployees.join(",")}`,
          );
          const data = await res.json();
          if (data.success) {
            setSSO110Data(data.data);
            setShowPreview(true);
          } else {
            setMessage(`${t("common.error")}: ${data.error}`);
          }
          break;
        }

        case "pnd1": {
          const res = await fetch(
            `/api/export/pnd1?month=${monthStr}&employeeIds=${selectedEmployees.join(",")}`,
          );
          const data = await res.json();
          if (data.success) {
            setPND1Data(data.data);
            setShowPreview(true);
          } else {
            setMessage(`${t("common.error")}: ${data.error}`);
          }
          break;
        }

        case "pnd1kor": {
          const res = await fetch(
            `/api/export/pnd1kor?year=${selectedYear}&employeeIds=${selectedEmployees.join(",")}`,
          );
          const data = await res.json();
          if (data.success) {
            setPND1KorData(data.data);
            setShowPreview(true);
          } else {
            setMessage(`${t("common.error")}: ${data.error}`);
          }
          break;
        }

        case "withholding-cert": {
          const res = await fetch(
            `/api/export/withholding-cert?employeeIds=${selectedEmployees.join(",")}&year=${selectedYear}`,
          );
          const data = await res.json();
          if (data.success) {
            setWithholdingCerts(data.data);
            setShowPreview(true);
          } else {
            setMessage(`${t("common.error")}: ${data.error}`);
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error generating preview:", error);
      setMessage(
        `${t("common.error")}: ${t("export.generateError") || "เกิดข้อผิดพลาดในการสร้างเอกสาร"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // ⭐ วิธีใหม่: ใช้ Browser Print - แม่นยำที่สุด
  // รองรับ mixed orientations (หน้าแรกแนวตั้ง, หน้าที่เหลือแนวนอน)
  const handlePrintPDF = () => {
    setExporting(true);

    try {
      // สร้าง print window ใหม่
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("กรุณาอนุญาต popup เพื่อพิมพ์เอกสาร");
        setExporting(false);
        return;
      }

      // หา element ที่จะพิมพ์
      let contentHTML = "";
      let pageTitle = "Document";
      let hasMixedOrientation = false; // สำหรับ PND1/PND1Kor ที่มีหน้าแรกแนวตั้ง หน้าที่เหลือแนวนอน

      if (selectedDocType === "payslip") {
        pageTitle = "สลิปเงินเดือน";
        payslipRefs.current.forEach((ref) => {
          if (ref) {
            contentHTML += `<div class="print-page landscape">${ref.outerHTML}</div>`;
          }
        });
      } else if (selectedDocType === "sso110") {
        pageTitle = "ประกันสังคม";
        if (sso110SummaryRef.current) {
          contentHTML += `<div class="print-page portrait">${sso110SummaryRef.current.outerHTML}</div>`;
        }
        // ⭐ Loop through all detail pages (25 employees per page)
        sso110DetailRefs.current.forEach((ref) => {
          if (ref) {
            contentHTML += `<div class="print-page portrait">${ref.outerHTML}</div>`;
          }
        });
      } else if (selectedDocType === "pnd1" || selectedDocType === "pnd1kor") {
        pageTitle = selectedDocType === "pnd1" ? "PND1" : "PND1Kor";
        hasMixedOrientation = true;

        // PND1/PND1Kor มีหลายหน้าใน ref เดียว - ต้องแยกแต่ละ .pnd-page
        const ref = selectedDocType === "pnd1" ? pnd1Ref.current : pnd1KorRef.current;
        if (ref) {
          const pages = ref.querySelectorAll(".pnd-page");
          pages.forEach((page, index) => {
            // หน้าแรก (index 0) = แนวตั้ง, หน้าที่เหลือ = แนวนอน
            const orientation = index === 0 ? "portrait" : "landscape";
            contentHTML += `<div class="print-page ${orientation}">${page.outerHTML}</div>`;
          });
        }
      } else if (selectedDocType === "withholding-cert") {
        pageTitle = "50ทวิ";
        withholdingCertRefs.current.forEach((ref) => {
          if (ref) {
            contentHTML += `<div class="print-page portrait">${ref.outerHTML}</div>`;
          }
        });
      }

      // เขียน HTML ลงใน print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${pageTitle}</title>
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            /* Reset & Base */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
            }

            /* ========== PND1 Specific Styles ========== */
            .pnd-page * {
              box-sizing: border-box;
            }

            .pnd-page {
              font-family: "Sarabun", "TH Sarabun New", sans-serif;
              color: #000;
              line-height: 1.3;
              font-size: 14px;
              background: white;
              position: relative;
              -webkit-font-smoothing: antialiased;
              text-rendering: geometricPrecision;
            }

            .page-cover {
              width: 210mm;
              min-height: 297mm;
              padding: 10mm 15mm;
            }

            .page-attachment {
              width: 297mm;
              min-height: 210mm;
              padding: 8mm 10mm;
            }

            table.pnd-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            table.pnd-table th,
            table.pnd-table td {
              border: 1px solid #000;
              padding: 2px 5px;
              vertical-align: middle;
              height: 32px;
            }

            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }

            .flex-between {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
            }

            .flex-row {
              display: flex;
              align-items: center;
            }

            .month-grid-compact {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              column-gap: 2px;
              row-gap: 5px;
              width: 100%;
            }

            .rounded-header-box {
              background-color: #bbb;
              color: black;
              font-weight: bold;
              text-align: center;
              border: 1px solid #000;
              border-radius: 6px;
              padding: 4px;
              font-size: 14px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .column-header-box {
              background-color: #eee;
              border: 1px solid #000;
              border-radius: 6px;
              font-size: 11px;
              text-align: center;
              padding: 2px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            /* Dotted Input Styles */
            .dotted-input {
              display: inline-block;
              position: relative;
              min-height: 22px;
              margin: 0 2px;
              vertical-align: bottom;
            }

            .dotted-input > span:first-child {
              display: block;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              font-size: 14px;
              line-height: 1.2;
              margin-bottom: 4px;
            }

            .dotted-input > span:last-child {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
            }

            /* ⭐ Named Page Rules สำหรับ Mixed Orientations */
            @page portrait-page {
              size: A4 portrait;
              margin: 5mm;
            }

            @page landscape-page {
              size: A4 landscape;
              margin: 5mm;
            }

            /* ⭐ Print Settings */
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }

              /* หน้าแนวตั้ง */
              .print-page.portrait {
                page: portrait-page;
                width: 200mm;
                height: 287mm;
                overflow: hidden;
                page-break-after: always;
                page-break-inside: avoid;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
              }

              /* หน้าแนวนอน */
              .print-page.landscape {
                page: landscape-page;
                width: 287mm;
                height: 200mm;
                overflow: hidden;
                page-break-after: always;
                page-break-inside: avoid;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                margin: 0;
              }

              .print-page:last-child {
                page-break-after: auto;
              }

              .no-print {
                display: none !important;
              }

              /* Content - ไม่ scale เพื่อใช้พื้นที่เต็มที่ */
              .print-page.portrait > div {
                width: 200mm;
                max-width: 200mm;
              }

              .print-page.landscape > div,
              .print-page.landscape .pnd-page {
                width: 287mm;
                max-width: 287mm;
                transform: scale(0.95);
              }

              /* Force background colors in print */
              .pnd-page [style*="background"] {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }

            /* Screen Preview */
            @media screen {
              body {
                background: #555;
                padding: 20px;
              }

              .print-page {
                background: white;
                margin: 0 auto 20px auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                overflow: visible;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 5mm;
              }

              .print-page.portrait {
                width: 210mm;
                min-height: 297mm;
              }

              .print-page.landscape {
                width: 297mm;
                min-height: 210mm;
              }

              .print-page > div {
                /* ไม่ scale เพื่อแสดงขนาดจริง */
              }
            }

            /* Table styles */
            table {
              border-collapse: collapse;
            }

            td, th {
              vertical-align: middle;
            }

            /* ป้องกัน content ล้นหน้า */
            .pnd-page {
              overflow: hidden !important;
              box-sizing: border-box !important;
            }
          </style>
        </head>
        <body>
          ${contentHTML}
          <script>
            // รอให้ fonts และ images โหลดเสร็จ
            window.onload = function() {
              // รอเพิ่มอีกนิดให้ fonts render
              setTimeout(function() {
                window.print();
                // ปิด window หลังพิมพ์เสร็จ (หรือยกเลิก)
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Print error:", error);
      alert("เกิดข้อผิดพลาดในการพิมพ์");
    } finally {
      setExporting(false);
    }
  };

  // ⭐ Export Excel สำหรับประกันสังคม (SSO110)
  const handleExportExcel = () => {
    if (!sso110Data || sso110Data.employees.length === 0) {
      alert("ไม่มีข้อมูลสำหรับ export");
      return;
    }

    // Helper function: แยกคำนำหน้าออกจากชื่อ
    const extractTitleFromName = (
      titleName: string,
      firstName: string
    ): { title: string; name: string } => {
      // ถ้ามี titleName อยู่แล้ว ใช้ค่าเดิม
      if (titleName && titleName.trim()) {
        return { title: titleName.trim(), name: firstName?.trim() || "" };
      }

      // ถ้าไม่มี titleName ให้ลองแยกจาก firstName
      const name = firstName?.trim() || "";
      const titlePrefixes = [
        "นางสาว",
        "นาง",
        "นาย",
        "เด็กชาย",
        "เด็กหญิง",
        "ด.ช.",
        "ด.ญ.",
        "Mr.",
        "Mrs.",
        "Miss",
        "Ms.",
      ];

      for (const prefix of titlePrefixes) {
        if (name.startsWith(prefix)) {
          return {
            title: prefix,
            name: name.substring(prefix.length).trim(),
          };
        }
      }

      // ไม่พบคำนำหน้า
      return { title: "", name: name };
    };

    // สร้าง header
    const headers = [
      "เลขบัตรประชาชน",
      "คำนำหน้า",
      "ชื่อ",
      "นามสกุล",
      "เงินเดือน",
      "เงินสมทบ",
    ];

    // สร้าง rows จากข้อมูลพนักงาน
    const rows = sso110Data.employees.map((emp) => {
      const { title, name } = extractTitleFromName(emp.titleName, emp.firstName);
      return [
        emp.idNumber || "",
        title,
        name,
        emp.lastName || "",
        emp.actualWages ? emp.actualWages.toString() : "",
        emp.contribution ? emp.contribution.toString() : "",
      ];
    });

    // รวม header กับ rows
    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => {
            // Escape double quotes และ wrap ด้วย double quotes ถ้ามี comma หรือ newline
            const escaped = cell.replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");

    // เพิ่ม UTF-8 BOM เพื่อให้ Excel อ่านภาษาไทยได้
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // สร้างชื่อไฟล์
    const monthName = t(`months.${parseInt(selectedMonth)}`);
    const yearThai = parseInt(selectedYear) + 543;
    const filename = `ประกันสังคม_${monthName}_${yearThai}.csv`;

    // Download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // ⭐ วิธีเดิม: ใช้ html2canvas (backup)
  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      // ⭐ 1. รอให้ fonts โหลดเสร็จก่อน
      await document.fonts.ready;
      await Promise.all([
        document.fonts.load("14px Sarabun"),
        document.fonts.load("bold 14px Sarabun"),
        document.fonts.load("12px Sarabun"),
        document.fonts.load("11px Sarabun"),
        document.fonts.load("10px Sarabun"),
      ]);
      // รอให้ fonts render เสร็จสมบูรณ์
      await new Promise((resolve) => setTimeout(resolve, 800));

      // ⭐ 2. Helper function สำหรับ capture element
      const captureElement = async (
        element: HTMLElement | null,
        isLandscape: boolean = false,
      ): Promise<{
        canvas: HTMLCanvasElement;
        pdfWidth: number;
        pdfHeight: number;
      } | null> => {
        if (!element) return null;

        // ใช้ขนาด A4 มาตรฐาน
        const pdfPageWidth = isLandscape ? 297 : 210;
        const pdfPageHeight = isLandscape ? 210 : 297;

        // คำนวณ pixel width สำหรับ landscape page ที่กว้างกว่า (330mm)
        const mmToPx = 3.7795275591;
        const pageWidthPx = isLandscape ? Math.floor(330 * mmToPx) : Math.floor(210 * mmToPx);
        const pageHeightPx = isLandscape ? Math.floor(210 * mmToPx) : Math.floor(297 * mmToPx);

        // ⭐ 5. Capture with html2canvas - ใช้ scale ที่สอดคล้องกับ preview
        const canvas = await html2canvas(element, {
          scale: 2, // ใช้ scale 2 เหมือน preview เพื่อความสอดคล้อง
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: "#ffffff",
          imageTimeout: 0,
          removeContainer: true,
          windowWidth: pageWidthPx,
          windowHeight: pageHeightPx,
          onclone: (clonedDoc, clonedElement) => {
            // ⭐ เพิ่ม export-mode class
            clonedElement.classList.add("export-mode");
            clonedElement.style.display = "block";

            // ⭐ Inject critical CSS fixes directly
            const style = clonedDoc.createElement("style");
            style.textContent = `
              /* Force all fonts to render consistently */
              .export-mode * {
                font-family: "Sarabun", "TH Sarabun New", sans-serif !important;
                -webkit-font-smoothing: antialiased !important;
                text-rendering: geometricPrecision !important;
              }

              /* Fix dotted-input: ใช้ transform แทน margin เพื่อแยกข้อความจากเส้น */
              .export-mode .dotted-input {
                display: inline-block !important;
                position: relative !important;
                vertical-align: bottom !important;
              }

              .export-mode .dotted-input > span:first-child {
                display: block !important;
                position: relative !important;
                transform: translateY(-4px) !important;
                line-height: 1 !important;
                padding-bottom: 0 !important;
                margin-bottom: 0 !important;
              }

              .export-mode .dotted-input > span:last-child {
                position: absolute !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
              }

              /* Fix elements with borderBottom dotted - ใช้ transform แทน padding */
              .export-mode [style*="border-bottom"][style*="dotted"]:not(.dotted-input):not(.dotted-input *) {
                position: relative !important;
              }

              .export-mode table.pnd-table td > div[style*="border-bottom"][style*="dotted"] {
                position: relative !important;
                display: flex !important;
                align-items: flex-start !important;
                padding-top: 2px !important;
              }

              /* Fix flex layouts */
              .export-mode .flex-row {
                display: flex !important;
                align-items: center !important;
              }

              .export-mode .flex-between {
                display: flex !important;
                justify-content: space-between !important;
                align-items: baseline !important;
              }

              /* Fix table cells */
              .export-mode table.pnd-table td,
              .export-mode table.pnd-table th {
                line-height: 1.2 !important;
                vertical-align: middle !important;
              }

              /* Fix checkbox alignment */
              .export-mode [style*="border"][style*="1px solid"] {
                box-sizing: border-box !important;
              }
            `;
            clonedDoc.head.appendChild(style);

            // ⭐ Fix dotted inputs - ใช้ transform approach
            const dottedInputs = clonedElement.querySelectorAll(".dotted-input");
            dottedInputs.forEach((input) => {
              const el = input as HTMLElement;
              const textSpan = el.querySelector("span:first-child") as HTMLElement;
              const borderSpan = el.querySelector("span:last-child") as HTMLElement;

              if (textSpan) {
                textSpan.style.cssText = `
                  display: block !important;
                  position: relative !important;
                  transform: translateY(-4px) !important;
                  line-height: 1 !important;
                  padding-bottom: 0 !important;
                  margin-bottom: 0 !important;
                `;
              }

              if (borderSpan) {
                borderSpan.style.cssText = `
                  position: absolute !important;
                  bottom: 0 !important;
                  left: 0 !important;
                  right: 0 !important;
                `;
              }

              el.style.cssText += `
                display: inline-block !important;
                position: relative !important;
                vertical-align: bottom !important;
              `;
            });

            // ⭐ Fix elements with direct borderBottom dotted
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const style = htmlEl.style;

              // Check if element has dotted border
              if (style.borderBottom?.includes("dotted") ||
                  style.border?.includes("dotted")) {
                // Skip if it's part of dotted-input
                if (htmlEl.closest(".dotted-input")) return;

                // Apply transform-based fix for text positioning
                const computedStyle = window.getComputedStyle(htmlEl);
                const hasText = htmlEl.textContent?.trim();

                if (hasText && computedStyle.display !== "flex") {
                  htmlEl.style.position = "relative";
                  htmlEl.style.paddingTop = "2px";
                  htmlEl.style.paddingBottom = "6px";
                  htmlEl.style.lineHeight = "1.2";
                }
              }
            });

            // Fix flex containers
            const flexElements = clonedElement.querySelectorAll('[style*="flex"]');
            flexElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.display.includes("flex")) {
                htmlEl.style.display = computedStyle.display;
              }
            });
          },
        });

        return { canvas, pdfWidth: pdfPageWidth, pdfHeight: pdfPageHeight };
      };

      // ⭐ 6. Helper function สำหรับเพิ่มรูปใน PDF
      const addImageToPdf = (
        pdf: jsPDF,
        canvas: HTMLCanvasElement,
        isLandscape: boolean = false,
      ) => {
        const pageWidth = isLandscape ? 297 : 210;
        const pageHeight = isLandscape ? 210 : 297;

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const imgRatio = imgWidth / imgHeight;
        const pageRatio = pageWidth / pageHeight;

        let finalWidth: number;
        let finalHeight: number;

        if (imgRatio > pageRatio) {
          finalWidth = pageWidth;
          finalHeight = pageWidth / imgRatio;
        } else {
          finalHeight = pageHeight;
          finalWidth = pageHeight * imgRatio;
        }

        const offsetX = (pageWidth - finalWidth) / 2;
        const offsetY = 0; // เริ่มจากบนสุด

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(
          imgData,
          "JPEG",
          offsetX,
          offsetY,
          finalWidth,
          finalHeight,
        );
      };

      // ⭐ 7. Export ตามประเภทเอกสาร
      switch (selectedDocType) {
        case "payslip": {
          const landscapePdf = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
          });

          for (let i = 0; i < payslips.length; i++) {
            const element = payslipRefs.current[i];
            if (!element) continue;

            const result = await captureElement(element, true);
            if (!result) continue;

            if (i > 0) landscapePdf.addPage();

            addImageToPdf(landscapePdf, result.canvas, true);
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`);
          const yearThai = parseInt(selectedYear) + 543;
          landscapePdf.save(
            `payslips_${monthName}_${yearThai}_period${selectedPeriod}.pdf`,
          );
          setExporting(false);
          return;
        }

        case "sso110": {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const summaryResult = await captureElement(sso110SummaryRef.current);
          if (summaryResult) {
            addImageToPdf(pdf, summaryResult.canvas, false);
          }

          // ⭐ Loop through all detail pages (25 employees per page)
          for (let i = 0; i < sso110DetailRefs.current.length; i++) {
            const detailResult = await captureElement(sso110DetailRefs.current[i]);
            if (detailResult) {
              pdf.addPage();
              addImageToPdf(pdf, detailResult.canvas, false);
            }
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`);
          const yearThai = parseInt(selectedYear) + 543;
          pdf.save(`sso110_${monthName}_${yearThai}.pdf`);
          break;
        }

        case "pnd1": {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const pndContainer = pnd1Ref.current;
          if (pndContainer) {
            const pages = pndContainer.querySelectorAll(".pnd-page");

            for (let i = 0; i < pages.length; i++) {
              const page = pages[i] as HTMLElement;
              const isLandscape = page.classList.contains("page-attachment");

              if (i > 0) {
                pdf.addPage("a4", isLandscape ? "landscape" : "portrait");
              }

              const result = await captureElement(page, isLandscape);
              if (result) {
                addImageToPdf(pdf, result.canvas, isLandscape);
              }
            }
          }

          const monthName = t(`months.${parseInt(selectedMonth)}`);
          const yearThai = parseInt(selectedYear) + 543;
          pdf.save(`pnd1_${monthName}_${yearThai}.pdf`);
          break;
        }

        case "pnd1kor": {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          const pndKorContainer = pnd1KorRef.current;
          if (pndKorContainer) {
            const pages = pndKorContainer.querySelectorAll(".pnd-page");

            for (let i = 0; i < pages.length; i++) {
              const page = pages[i] as HTMLElement;
              const isLandscape = page.classList.contains("page-attachment");

              if (i > 0) {
                pdf.addPage("a4", isLandscape ? "landscape" : "portrait");
              }

              const result = await captureElement(page, isLandscape);
              if (result) {
                addImageToPdf(pdf, result.canvas, isLandscape);
              }
            }
          }

          const yearThai = parseInt(selectedYear) + 543;
          pdf.save(`pnd1kor_${yearThai}.pdf`);
          break;
        }

        case "withholding-cert": {
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          });

          for (let i = 0; i < withholdingCerts.length; i++) {
            const element = withholdingCertRefs.current[i];
            if (!element) continue;

            const result = await captureElement(element);
            if (!result) continue;

            if (i > 0) pdf.addPage();

            addImageToPdf(pdf, result.canvas, false);
          }

          const yearThai = parseInt(selectedYear) + 543;
          pdf.save(`50ทวิ_${yearThai}.pdf`);
          break;
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage(
        `${t("common.error")}: ${t("export.pdfError") || "เกิดข้อผิดพลาดในการสร้าง PDF"}`,
      );
    } finally {
      setExporting(false);
    }
  };

  const renderPeriodSelector = () => {
    if (!selectedDocTypeInfo) return null;

    const showMonth =
      selectedDocTypeInfo.frequency === "period" ||
      selectedDocTypeInfo.frequency === "monthly";
    const showPeriod = selectedDocTypeInfo.frequency === "period";

    return (
      <div className="card" style={{ marginBottom: "24px", padding: "24px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "var(--text-primary)",
          }}
        >
          {t("export.step2") || "ขั้นตอนที่ 2: เลือกงวดการจ่าย"}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
          }}
        >
          {/* Month */}
          {showMonth && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                {t("common.month") || "เดือน"}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, "0");
                  return (
                    <option key={month} value={month}>
                      {t(`months.${i + 1}`)}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Year */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)",
              }}
            >
              {t("common.year") || "ปี"}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year + 543}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Period */}
          {showPeriod && (
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                }}
              >
                {t("common.period") || "งวด"}
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(Number(e.target.value) as 1 | 2)
                }
              >
                <option value={1}>
                  {t("export.period1") || "งวดที่ 1 (26 - 10)"}
                </option>
                <option value={2}>
                  {t("export.period2") || "งวดที่ 2 (11 - 25)"}
                </option>
              </select>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmployeeSelector = () => {
    if (!selectedDocTypeInfo?.needsEmployeeSelection) return null;

    return (
      <div className="card" style={{ marginBottom: "24px", padding: "24px" }}>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "700",
            marginBottom: "16px",
            color: "var(--text-primary)",
          }}
        >
          {t("export.step3") || "ขั้นตอนที่ 3: เลือกพนักงาน"}
        </h2>

        {/* Search Box */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                t("export.searchPlaceholder") ||
                "ค้นหาพนักงาน (รหัสหรือชื่อ)..."
              }
              style={{ flex: 1, padding: "10px 14px", fontSize: "14px" }}
            />
            <button
              onClick={selectAllEmployees}
              className="btn btn-secondary"
              style={{ whiteSpace: "nowrap" }}
            >
              {selectedEmployees.length === filteredEmployees.length
                ? t("common.cancel")
                : t("export.selectAll") || "เลือกทั้งหมด"}
            </button>
          </div>
          {(searchQuery || searching) && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              {searching
                ? t("export.searching") || "กำลังค้นหา..."
                : `${t("export.found") || "พบ"} ${filteredEmployees.length} ${t("common.people") || "คน"}`}
            </div>
          )}
        </div>

        {/* Employee List */}
        <div
          style={{
            maxHeight: "300px",
            overflow: "auto",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            padding: "12px",
          }}
        >
          {filteredEmployees.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              {t("export.noEmployees") || "ไม่พบพนักงาน"}
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <label
                key={emp.employee_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  marginBottom: "4px",
                  background: selectedEmployees.includes(emp.employee_id)
                    ? "var(--primary-light)"
                    : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.employee_id)}
                  onChange={() => toggleEmployee(emp.employee_id)}
                  style={{ marginRight: "12px", width: "18px", height: "18px" }}
                />
                <span style={{ fontSize: "14px" }}>
                  <strong>{emp.employee_id}</strong> - {emp.name}
                  <span
                    style={{ color: "var(--text-muted)", marginLeft: "8px" }}
                  >
                    ({emp.department || "-"})
                  </span>
                </span>
              </label>
            ))
          )}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "12px",
          }}
        >
          {t("export.selected") || "เลือกแล้ว"}: {selectedEmployees.length}{" "}
          {t("common.people") || "คน"}
        </div>
      </div>
    );
  };

  // Memoized paginated data for performance
  const paginatedPayslips = useMemo(() => {
    const start = (previewPage - 1) * PREVIEW_ITEMS_PER_PAGE;
    return payslips.slice(start, start + PREVIEW_ITEMS_PER_PAGE);
  }, [payslips, previewPage]);

  const paginatedWithholdingCerts = useMemo(() => {
    const start = (previewPage - 1) * PREVIEW_ITEMS_PER_PAGE;
    return withholdingCerts.slice(start, start + PREVIEW_ITEMS_PER_PAGE);
  }, [withholdingCerts, previewPage]);

  // Calculate total pages for paginated documents
  const getTotalPreviewPages = useCallback(() => {
    switch (selectedDocType) {
      case "payslip":
        return Math.ceil(payslips.length / PREVIEW_ITEMS_PER_PAGE);
      case "withholding-cert":
        return Math.ceil(withholdingCerts.length / PREVIEW_ITEMS_PER_PAGE);
      default:
        return 1;
    }
  }, [selectedDocType, payslips.length, withholdingCerts.length]);

  const renderPreview = () => {
    switch (selectedDocType) {
      case "payslip":
        return payslips.map((payslip, index) => {
          return (
            <div
              key={index}
              style={{
                marginBottom: index < payslips.length - 1 ? "24px" : 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <PayslipPreview
                  ref={(el) => {
                    payslipRefs.current[index] = el;
                  }}
                  data={payslip}
                />
              </div>
            </div>
          );
        });

      case "sso110": {
        if (!sso110Data) return null;

        // ⭐ คำนวณจำนวนหน้า detail (25 คนต่อหน้า)
        const totalDetailPages = Math.ceil(sso110Data.employees.length / SSO110_EMPLOYEES_PER_PAGE);

        return (
          <>
            <div
              style={{
                marginBottom: "24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <SSO110Preview
                  ref={sso110SummaryRef}
                  data={sso110Data}
                  page="summary"
                />
              </div>
            </div>
            {/* ⭐ Render multiple detail pages (25 employees per page) */}
            {Array.from({ length: totalDetailPages }).map((_, pageIndex) => (
              <div
                key={`sso110-detail-${pageIndex}`}
                style={{
                  marginBottom: pageIndex < totalDetailPages - 1 ? "24px" : 0,
                  display: "flex",
                  justifyContent: "center"
                }}
              >
                <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                  <SSO110Preview
                    ref={(el) => {
                      sso110DetailRefs.current[pageIndex] = el;
                    }}
                    data={sso110Data}
                    page="detail"
                    pageNumber={pageIndex + 1}
                    totalPages={totalDetailPages}
                    startIndex={pageIndex * SSO110_EMPLOYEES_PER_PAGE}
                  />
                </div>
              </div>
            ))}
          </>
        );
      }

      case "pnd1":
        return (
          pnd1Data && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <PND1Preview ref={pnd1Ref} data={pnd1Data} />
              </div>
            </div>
          )
        );

      case "pnd1kor":
        return (
          pnd1KorData && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <PND1KorPreview ref={pnd1KorRef} data={pnd1KorData} />
              </div>
            </div>
          )
        );

      case "withholding-cert":
        return withholdingCerts.map((cert, index) => {
          return (
            <div
              key={index}
              style={{
                marginBottom:
                  index < withholdingCerts.length - 1 ? "24px" : 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                <WithholdingCertPreview
                  ref={(el) => {
                    withholdingCertRefs.current[index] = el;
                  }}
                  data={cert}
                />
              </div>
            </div>
          );
        });

      default:
        return null;
    }
  };

  // Render preview pagination controls
  const renderPreviewPagination = () => {
    // ไม่แสดง pagination สำหรับ สลิปเงินเดือน และ 50ทวิ
    if (selectedDocType === "payslip" || selectedDocType === "withholding-cert") return null;

    const totalPages = getTotalPreviewPages();
    if (totalPages <= 1) return null;

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px",
          padding: "12px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "8px",
        }}
      >
        <button
          onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
          disabled={previewPage === 1}
          className="btn btn-secondary"
          style={{ padding: "8px 16px", opacity: previewPage === 1 ? 0.5 : 1 }}
        >
          ← {t("common.prev") || "ก่อนหน้า"}
        </button>
        <span style={{ color: "#fff", fontSize: "14px" }}>
          {t("common.page") || "หน้า"} {previewPage} / {totalPages}
        </span>
        <button
          onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
          disabled={previewPage === totalPages}
          className="btn btn-secondary"
          style={{
            padding: "8px 16px",
            opacity: previewPage === totalPages ? 0.5 : 1,
          }}
        >
          {t("common.next") || "ถัดไป"} →
        </button>
      </div>
    );
  };

  const getPreviewCount = () => {
    switch (selectedDocType) {
      case "payslip":
        return payslips.length;
      case "sso110":
        return sso110Data ? 1 : 0;
      case "pnd1":
        return pnd1Data ? 1 : 0;
      case "pnd1kor":
        return pnd1KorData ? 1 : 0;
      case "withholding-cert":
        return withholdingCerts.length;
      default:
        return 0;
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 className="page-title">
              {t("export.title") || "ส่งออกเอกสาร"}
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              {t("export.subtitle") || "สร้างและดาวน์โหลดเอกสาร PDF"}
            </p>
          </div>
          <a href="/" className="btn btn-secondary">
            ← {t("common.back") || "กลับ"}
          </a>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Step 1: Select Document Type */}
          <div
            className="card"
            style={{ marginBottom: "24px", padding: "24px" }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                marginBottom: "16px",
                color: "var(--text-primary)",
              }}
            >
              {t("export.step1") || "ขั้นตอนที่ 1: เลือกประเภทเอกสาร"}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              {documentTypes.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocType(doc.id)}
                  style={{
                    padding: "16px",
                    border:
                      selectedDocType === doc.id
                        ? "2px solid var(--primary)"
                        : "1px solid var(--border-light)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background:
                      selectedDocType === doc.id
                        ? "var(--primary-light)"
                        : "var(--surface-bg)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>
                    {doc.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    {doc.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginBottom: "8px",
                    }}
                  >
                    {doc.description}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      padding: "3px 8px",
                      background: "var(--bg-muted)",
                      borderRadius: "4px",
                      display: "inline-block",
                    }}
                  >
                    {doc.frequency === "period" &&
                      (t("export.everyPeriod") || "ทุกงวด")}
                    {doc.frequency === "monthly" &&
                      (t("export.monthly") || "รายเดือน")}
                    {doc.frequency === "yearly" &&
                      (t("export.yearly") || "รายปี")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Period */}
          {selectedDocType && renderPeriodSelector()}

          {/* Step 3: Select Employees (if needed) */}
          {selectedDocType && renderEmployeeSelector()}

          {/* Message */}
          {message && (
            <div
              className="card"
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "#fff3cd",
              }}
            >
              <p style={{ margin: 0, color: "#856404", fontSize: "14px" }}>
                {message}
              </p>
            </div>
          )}

          {/* Generate Button */}
          {selectedDocType && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={handleGeneratePreview}
                disabled={
                  loading ||
                  (selectedDocTypeInfo?.needsEmployeeSelection &&
                    selectedEmployees.length === 0)
                }
                className="btn btn-primary"
                style={{ padding: "14px 48px", fontSize: "16px" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                      }}
                    ></span>
                    {t("export.generating") || "กำลังสร้างเอกสาร..."}
                  </>
                ) : (
                  <>{t("export.preview") || "ดูตัวอย่างเอกสาร"}</>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Preview Mode */}
          <div
            className="card"
            style={{ marginBottom: "24px", padding: "16px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>
                  {t("export.previewTitle") || "ตัวอย่างเอกสาร"} -{" "}
                  {selectedDocTypeInfo?.name} ({getPreviewCount()}{" "}
                  {selectedDocType === "sso110" ||
                  selectedDocType === "pnd1" ||
                  selectedDocType === "pnd1kor"
                    ? "ชุด"
                    : t("common.people") || "คน"}
                  )
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {selectedDocTypeInfo?.frequency === "yearly"
                    ? `${t("common.year") || "ปี"} ${parseInt(selectedYear) + 543}`
                    : `${t(`months.${parseInt(selectedMonth)}`)} ${parseInt(selectedYear) + 543}${selectedDocTypeInfo?.frequency === "period" ? ` - ${t("common.period") || "งวด"} ${selectedPeriod}` : ""}`}
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn btn-secondary"
                >
                  ← {t("export.backToSelect") || "กลับไปเลือก"}
                </button>
                <button
                  onClick={handlePrintPDF}
                  disabled={exporting}
                  className="btn btn-primary"
                >
                  {exporting ? (
                    <>
                      <span
                        className="spinner"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "8px",
                        }}
                      ></span>
                      {t("export.exporting") || "กำลังเตรียมพิมพ์..."}
                    </>
                  ) : (
                    <>🖨️ ปริ้น PDF</>
                  )}
                </button>
                {/* ปุ่ม Export Excel เฉพาะประกันสังคม */}
                {selectedDocType === "sso110" && sso110Data && (
                  <button
                    onClick={handleExportExcel}
                    className="btn btn-secondary"
                    style={{ backgroundColor: "#217346", color: "#fff", borderColor: "#217346" }}
                  >
                    📊 Export Excel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Document Previews */}
          <div
            style={{
              background: "#555",
              padding: "24px",
              borderRadius: "8px",
              overflow: "auto",
            }}
          >
            {renderPreviewPagination()}
            {renderPreview()}
            {renderPreviewPagination()}
          </div>
        </>
      )}
    </div>
  );
}
