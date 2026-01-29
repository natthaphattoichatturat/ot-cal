"use client";

import React, { forwardRef } from "react";
import { SSO110Data } from "@/types/documents";
import { formatCurrency } from "@/utils/formatters";

interface SSO110PreviewProps {
  data: SSO110Data;
  page?: "summary" | "detail";
  pageNumber?: number;
  totalPages?: number;
  startIndex?: number; // สำหรับ pagination - เริ่มต้นที่ employee index ไหน
}

// จำนวนพนักงานต่อหน้า
const EMPLOYEES_PER_PAGE = 25;

// แปลงตัวเลขเป็นตัวอักษรไทย
const numberToThaiText = (num: number): string => {
  const units = [
    "",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const tens = [
    "",
    "สิบ",
    "ยี่สิบ",
    "สามสิบ",
    "สี่สิบ",
    "ห้าสิบ",
    "หกสิบ",
    "เจ็ดสิบ",
    "แปดสิบ",
    "เก้าสิบ",
  ];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  if (num === 0) return "ศูนย์";

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  const numToText = (n: number): string => {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 100) {
      const t = Math.floor(n / 10);
      const u = n % 10;
      let text = tens[t];
      if (u === 1) text += "เอ็ด";
      else if (u > 0) text += units[u];
      return text;
    }

    let text = "";
    let remaining = n;
    let pos = 0;

    while (remaining > 0) {
      const digit = remaining % 10;
      if (digit > 0) {
        if (pos === 0) {
          text = units[digit] + text;
        } else if (pos === 1) {
          if (digit === 1) text = "สิบ" + text;
          else if (digit === 2) text = "ยี่สิบ" + text;
          else text = units[digit] + "สิบ" + text;
        } else {
          text = units[digit] + positions[pos] + text;
        }
      }
      remaining = Math.floor(remaining / 10);
      pos++;
    }
    return text;
  };

  let result = numToText(intPart) + "บาท";
  if (decPart > 0) {
    result += numToText(decPart) + "สตางค์";
  } else {
    result += "ถ้วน";
  }

  return `(${result})`;
};

// เดือนภาษาไทย
const THAI_MONTHS = [
  "",
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const SSO110Preview = forwardRef<HTMLDivElement, SSO110PreviewProps>(
  ({ data, page = "summary", pageNumber = 1, totalPages = 1, startIndex = 0 }, ref) => {
    // ⭐ แบ่งพนักงานตาม pagination
    const paginatedEmployees = data.employees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);

    // ⭐ คำนวณยอดรวมสะสมจากเริ่มต้นถึงหน้าปัจจุบัน (1-25, 1-50, 1-75, ...)
    const endIndex = startIndex + paginatedEmployees.length;
    const cumulativeEmployees = data.employees.slice(0, endIndex);
    const cumulativeTotalWages = cumulativeEmployees.reduce((sum, emp) => sum + emp.actualWages, 0);
    const cumulativeTotalContribution = cumulativeEmployees.reduce((sum, emp) => sum + emp.contribution, 0);

    const commonStyles = {
      fontFamily: '"TH Sarabun New", "Sarabun", sans-serif',
      fontSize: "14px",
      lineHeight: "1.2",
      color: "#000",
    };

    // ⭐ CSS สำหรับ export mode - แก้ปัญหา alignment
    const exportModeStyles = `
      .export-mode [style*="border-bottom"][style*="dotted"] {
        position: relative !important;
        padding-top: 2px !important;
        padding-bottom: 4px !important;
        line-height: 1.2 !important;
      }

      .export-mode * {
        font-family: "TH Sarabun New", "Sarabun", sans-serif !important;
        -webkit-font-smoothing: antialiased !important;
        text-rendering: geometricPrecision !important;
      }
    `;

    // แปลงเลขบัญชีเป็น array
    const accountDigits = data.accountNumber.split("");
    const branchDigits = data.branchNumber.split("");

    if (page === "summary") {
      return (
        <div
          ref={ref}
          style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundColor: "#ffffff",
            padding: "15mm 20mm",
            boxSizing: "border-box",
            ...commonStyles,
          }}
        >
          {/* Export mode CSS */}
          <style dangerouslySetInnerHTML={{ __html: exportModeStyles }} />
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div style={{ width: "80px" }}>
              {/* Logo placeholder */}
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "1px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  color: "#666",
                  lineHeight: "1.2",
                }}
              >
                สำนักงาน
                <br />
                ประกันสังคม
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "5px",
                  lineHeight: "1.2",
                }}
              >
                แบบรายการแสดงการส่งเงินสมทบ
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                fontSize: "14px",
                lineHeight: "1.2",
              }}
            >
              สปส. 1-10 (ส่วนที่ 1)
            </div>
          </div>

          {/* Company Info */}
          <div style={{ marginBottom: "15px" }}>
            <div
              style={{
                display: "flex",
                marginBottom: "5px",
                lineHeight: "1.2",
              }}
            >
              <div style={{ width: "120px" }}>ชื่อสถานประกอบการ</div>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px dotted #000",
                  paddingLeft: "5px",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.companyName}
              </div>
              <div style={{ width: "80px", textAlign: "right" }}>
                เลขที่บัญชี
              </div>
              <div style={{ display: "flex", marginLeft: "10px" }}>
                {accountDigits.map((digit, i) => (
                  <div
                    key={i}
                    style={{
                      width: "20px",
                      height: "24px",
                      border: "1px solid #000",
                      textAlign: "center",
                      lineHeight: "24px",
                      marginLeft: i === 2 || i === 7 ? "5px" : "0",
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginBottom: "5px",
                lineHeight: "1.2",
              }}
            >
              <div style={{ width: "120px" }}>ชื่อสาขา (ถ้ามี)</div>
              <div style={{ flex: 1, borderBottom: "1px dotted #000", paddingBottom: "3px" }}></div>
              <div style={{ width: "80px", textAlign: "right" }}>
                ลำดับที่สาขา
              </div>
              <div style={{ display: "flex", marginLeft: "10px" }}>
                {branchDigits.map((digit, i) => (
                  <div
                    key={i}
                    style={{
                      width: "20px",
                      height: "24px",
                      border: "1px solid #000",
                      textAlign: "center",
                      lineHeight: "24px",
                    }}
                  >
                    {digit}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginBottom: "5px",
                lineHeight: "1.2",
              }}
            >
              <div style={{ width: "150px" }}>ที่ตั้งสำนักงานใหญ่/สาขา</div>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px dotted #000",
                  paddingLeft: "5px",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.companyAddress}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginBottom: "5px",
                lineHeight: "1.2",
                alignItems: "center",
              }}
            >
              <div style={{ width: "80px" }}>รหัสไปรษณีย์</div>
              <div
                style={{
                  width: "100px",
                  borderBottom: "1px dotted #000",
                  textAlign: "center",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.postalCode}
              </div>
              <div style={{ width: "60px", marginLeft: "30px" }}>โทรศัพท์</div>
              <div
                style={{
                  width: "150px",
                  borderBottom: "1px dotted #000",
                  textAlign: "center",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.phone}
              </div>
              <div style={{ width: "50px", marginLeft: "30px" }}>โทรสาร</div>
              <div
                style={{
                  width: "150px",
                  borderBottom: "1px dotted #000",
                  textAlign: "center",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.fax}
              </div>
              <div style={{ marginLeft: "30px", whiteSpace: "nowrap" }}>
                อัตราเงินสมทบร้อยละ
              </div>
              <div
                style={{
                  width: "60px",
                  borderBottom: "1px dotted #000",
                  textAlign: "center",
                  marginLeft: "10px",
                  paddingBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {data.ssoRate.toFixed(2)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
                lineHeight: "1.2",
              }}
            >
              <div>การนำส่งเงินสมทบสำหรับค่าจ้างเดือน</div>
              <div
                style={{
                  marginLeft: "10px",
                  borderBottom: "1px dotted #000",
                  padding: "0 20px",
                  paddingBottom: "3px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                {THAI_MONTHS[data.contributionMonth]}
              </div>
              <div style={{ marginLeft: "10px" }}>พ.ศ.</div>
              <div
                style={{
                  marginLeft: "10px",
                  borderBottom: "1px dotted #000",
                  padding: "0 20px",
                  paddingBottom: "3px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                {data.contributionYear}
              </div>
            </div>
          </div>

          {/* Summary Table - แก้ไขแล้ว */}
          <table
            style={{
              width: "60%",
              borderCollapse: "collapse",
              marginBottom: "15px",
            }}
          >
            <thead>
              <tr style={{ height: "28px" }}>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    width: "50px",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{ lineHeight: "28px", margin: 0, padding: "0 4px" }}
                  ></div>
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "left",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{ lineHeight: "28px", margin: 0, padding: "0 8px" }}
                  >
                    รายการ
                  </div>
                </th>
                <th
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{ lineHeight: "28px", margin: 0, padding: "0 4px" }}
                  >
                    จำนวนเงิน
                  </div>
                </th>
              </tr>
              <tr style={{ height: "20px" }}>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "20px", margin: 0 }}></div>
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "20px", margin: 0 }}></div>
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    width: "100px",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "20px", margin: 0 }}>บาท</div>
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    width: "50px",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "20px", margin: 0 }}>สต.</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: "28px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>1.</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingLeft: "8px",
                    }}
                  >
                    เงินค่าจ้างทั้งสิ้น
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingRight: "8px",
                    }}
                  >
                    {formatCurrency(data.summary.totalWages).split(".")[0]}
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>00</div>
                </td>
              </tr>
              <tr style={{ height: "28px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>2.</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingLeft: "8px",
                    }}
                  >
                    เงินสมทบผู้ประกันตน
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingRight: "8px",
                    }}
                  >
                    {
                      formatCurrency(data.summary.employeeContribution).split(
                        ".",
                      )[0]
                    }
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>00</div>
                </td>
              </tr>
              <tr style={{ height: "28px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>3.</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingLeft: "8px",
                    }}
                  >
                    เงินสมทบนายจ้าง
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingRight: "8px",
                    }}
                  >
                    {
                      formatCurrency(data.summary.employerContribution).split(
                        ".",
                      )[0]
                    }
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>00</div>
                </td>
              </tr>
              <tr style={{ height: "28px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>4.</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingLeft: "8px",
                    }}
                  >
                    รวมเงินสมทบที่นำส่งทั้งสิ้น
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingRight: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {
                      formatCurrency(data.summary.totalContribution).split(
                        ".",
                      )[0]
                    }
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>00</div>
                </td>
              </tr>
              <tr style={{ height: "28px" }}>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{ lineHeight: "28px", margin: 0, fontSize: "12px" }}
                  >
                    {numberToThaiText(data.summary.totalContribution)}
                  </div>
                </td>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}></div>
                </td>
              </tr>
              <tr style={{ height: "28px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>5.</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingLeft: "8px",
                    }}
                  >
                    จำนวนผู้ประกันตนที่ส่งเงินสมทบ
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "right",
                    verticalAlign: "middle",
                  }}
                >
                  <div
                    style={{
                      lineHeight: "28px",
                      margin: 0,
                      paddingRight: "8px",
                    }}
                  >
                    {data.summary.employeeCount}
                  </div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "28px", margin: 0 }}>คน</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Declaration */}
          <div
            style={{
              marginBottom: "20px",
              fontSize: "13px",
              lineHeight: "1.3",
            }}
          >
            <p style={{ marginBottom: "10px" }}>
              ข้าพเจ้าขอรับรองว่ารายการที่แจ้งไว้เป็นรายการที่ถูกต้องครบถ้วนและเป็นจริงทุกประการ
              พร้อมนี้ได้แนบ
            </p>
            <div style={{ display: "flex", gap: "30px", marginLeft: "20px" }}>
              <label
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="checkbox"
                  checked
                  readOnly
                  style={{ width: "15px", height: "15px" }}
                />
                รายละเอียดการนำส่งเงินสมทบ
                <span style={{ marginLeft: "10px" }}>
                  จำนวน........{Math.ceil(data.employees.length / EMPLOYEES_PER_PAGE)}........แผ่น
                </span>
              </label>
            </div>
          </div>

          {/* Signature Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
              lineHeight: "1.3",
            }}
          >
            <div
              style={{
                border: "1px solid #000",
                width: "100px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                textAlign: "center",
                lineHeight: "1.3",
              }}
            >
              ประทับตรา
              <br />
              นิติบุคคล
              <br />
              (ถ้ามี)
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ marginBottom: "5px" }}>
                ลงชื่อ.................................................................นายจ้าง/ผู้รับมอบอำนาจ
              </div>
              <div style={{ marginBottom: "5px" }}>
                (..................................................................)
              </div>
              <div style={{ marginBottom: "5px" }}>
                ตำแหน่ง....................................................................
              </div>
              <div>
                ยื่นแบบวันที่.........เดือน.......................พ.ศ..............
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Page 2: Detail - แก้ไขเป็นแยกคอลัมน์บาท/สตางค์สำหรับค่าจ้าง
    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#ffffff",
          padding: "10mm 15mm",
          boxSizing: "border-box",
          ...commonStyles,
        }}
      >
        {/* Export mode CSS */}
        <style dangerouslySetInnerHTML={{ __html: exportModeStyles }} />
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            lineHeight: "1.2",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            รายละเอียดการนำส่งเงินสมทบ
          </div>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div>สปส. 1-10 (ส่วนที่ 2)</div>
            <div>
              แผ่นที่......{pageNumber}......ในจำนวน......{totalPages}......แผ่น
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div
          style={{
            display: "flex",
            marginBottom: "10px",
            fontSize: "13px",
            lineHeight: "1.2",
          }}
        >
          <div>สำหรับค่าจ้างเดือน</div>
          <div
            style={{
              borderBottom: "1px dotted #000",
              width: "100px",
              textAlign: "center",
              margin: "0 10px",
              paddingBottom: "3px",
              lineHeight: "1.2",
            }}
          >
            {THAI_MONTHS[data.contributionMonth]}
          </div>
          <div>พ.ศ.</div>
          <div
            style={{
              borderBottom: "1px dotted #000",
              width: "60px",
              textAlign: "center",
              margin: "0 10px",
              paddingBottom: "3px",
              lineHeight: "1.2",
            }}
          >
            {data.contributionYear}
          </div>
          <div style={{ marginLeft: "20px" }}>เลขที่บัญชี</div>
          <div style={{ display: "flex", marginLeft: "10px" }}>
            {accountDigits.map((digit, i) => (
              <div
                key={i}
                style={{
                  width: "16px",
                  height: "20px",
                  border: "1px solid #000",
                  textAlign: "center",
                  lineHeight: "20px",
                  fontSize: "12px",
                  marginLeft: i === 2 || i === 7 ? "3px" : "0",
                }}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginBottom: "10px",
            fontSize: "13px",
            lineHeight: "1.2",
          }}
        >
          <div>ชื่อสถานประกอบการ</div>
          <div
            style={{
              borderBottom: "1px dotted #000",
              flex: 1,
              marginLeft: "10px",
              paddingLeft: "5px",
              paddingBottom: "3px",
              lineHeight: "1.2",
            }}
          >
            {data.companyName}
          </div>
          <div style={{ marginLeft: "20px" }}>ลำดับที่สาขา</div>
          <div style={{ display: "flex", marginLeft: "10px" }}>
            {branchDigits.map((digit, i) => (
              <div
                key={i}
                style={{
                  width: "16px",
                  height: "20px",
                  border: "1px solid #000",
                  textAlign: "center",
                  lineHeight: "20px",
                  fontSize: "12px",
                }}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Table - แก้ไขให้คอลัมน์ 4 แยกเป็นบาท/สตางค์ */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr style={{ height: "24px" }}>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  width: "30px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "24px", margin: 0 }}>1</div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  width: "130px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "24px", margin: 0 }}>2</div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "24px", margin: 0 }}>3</div>
              </th>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  width: "110px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "24px", margin: 0 }}>4</div>
              </th>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  width: "110px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "24px", margin: 0 }}>5</div>
              </th>
            </tr>
            <tr style={{ height: "40px" }}>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontSize: "10px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "14px", margin: 0, padding: "2px" }}>
                  ลำดับที่
                </div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontSize: "9px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "12px", margin: 0, padding: "2px" }}>
                  เลขประจำตัวประชาชน
                  <br />
                  <span style={{ fontSize: "8px" }}>
                    (สำหรับคนต่างด้าวให้กรอก
                    <br />
                    เลขที่บัตรประกันสังคม)
                  </span>
                </div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontSize: "10px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "14px", margin: 0, padding: "2px" }}>
                  คำนำหน้านาม ชื่อ นามสกุลผู้ประกันตน
                </div>
              </th>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontSize: "10px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "14px", margin: 0, padding: "2px" }}>
                  ค่าจ้างที่จ่ายจริง
                </div>
              </th>
              <th
                colSpan={2}
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontSize: "9px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "12px", margin: 0, padding: "2px" }}>
                  เงินสมทบผู้ประกันตน
                  <br />
                  <span style={{ fontSize: "8px" }}>
                    (ค่าจ้างที่ใช้ในการคำนวณ
                    <br />
                    ไม่ต่ำกว่า 1,650 บาท
                    <br />
                    และไม่เกิน 15,000 บาท)
                  </span>
                </div>
              </th>
            </tr>
            <tr style={{ height: "18px" }}>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}></div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}></div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}></div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  width: "80px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}>บาท</div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  width: "30px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}>สต.</div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  width: "80px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}>บาท</div>
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  fontSize: "8px",
                  textAlign: "center",
                  width: "30px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "18px", margin: 0 }}>สต.</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((emp, index) => {
              const wageParts = formatCurrency(emp.actualWages).split(".");
              return (
                <tr key={index} style={{ height: "22px" }}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "center",
                      fontSize: "10px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ lineHeight: "22px", margin: 0 }}>
                      {emp.sequence}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "center",
                      fontSize: "9px",
                      letterSpacing: "0.5px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ lineHeight: "22px", margin: 0 }}>
                      {emp.idNumber.split("").map((d, i) => {
                        if (i === 1 || i === 5 || i === 10 || i === 12)
                          return <span key={i}>&nbsp;-&nbsp;{d}</span>;
                        return <span key={i}>{d}</span>;
                      })}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      fontSize: "10px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        lineHeight: "22px",
                        margin: 0,
                        paddingLeft: "4px",
                        paddingRight: "4px",
                      }}
                    >
                      {emp.titleName} {emp.firstName} {emp.lastName}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "right",
                      fontSize: "10px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        lineHeight: "22px",
                        margin: 0,
                        paddingRight: "4px",
                      }}
                    >
                      {wageParts[0]}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "center",
                      fontSize: "10px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ lineHeight: "22px", margin: 0 }}>
                      {wageParts[1] || "00"}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "right",
                      fontSize: "10px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div
                      style={{
                        lineHeight: "22px",
                        margin: 0,
                        paddingRight: "4px",
                      }}
                    >
                      {formatCurrency(emp.contribution).split(".")[0]}
                    </div>
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "0",
                      textAlign: "center",
                      fontSize: "10px",
                      verticalAlign: "middle",
                    }}
                  >
                    <div style={{ lineHeight: "22px", margin: 0 }}>00</div>
                  </td>
                </tr>
              );
            })}
            {/* Empty rows - เติมแถวว่างให้ครบ 25 แถว */}
            {Array.from({
              length: Math.max(0, EMPLOYEES_PER_PAGE - paginatedEmployees.length),
            }).map((_, i) => (
              <tr key={`empty-${i}`} style={{ height: "22px" }}>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}></div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}></div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}></div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}></div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    fontSize: "10px",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}>00</div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}></div>
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "0",
                    textAlign: "center",
                    fontSize: "10px",
                    verticalAlign: "middle",
                  }}
                >
                  <div style={{ lineHeight: "22px", margin: 0 }}>00</div>
                </td>
              </tr>
            ))}
            {/* Total row - ⭐ แสดงยอดรวมสะสมจากเริ่มต้นถึงหน้าปัจจุบัน */}
            <tr style={{ height: "26px" }}>
              <td
                colSpan={3}
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{ lineHeight: "26px", margin: 0, paddingRight: "8px" }}
                >
                  รวม
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{ lineHeight: "26px", margin: 0, paddingRight: "4px" }}
                >
                  {formatCurrency(cumulativeTotalWages).split(".")[0]}
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "26px", margin: 0 }}>
                  {formatCurrency(cumulativeTotalWages).split(".")[1] ||
                    "00"}
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "right",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "middle",
                }}
              >
                <div
                  style={{ lineHeight: "26px", margin: 0, paddingRight: "4px" }}
                >
                  {formatCurrency(cumulativeTotalContribution).split(".")[0]}
                </div>
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "0",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "11px",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ lineHeight: "26px", margin: 0 }}>00</div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Signature */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
            lineHeight: "1.3",
          }}
        >
          <div style={{ textAlign: "center", fontSize: "13px" }}>
            <div>
              ลงชื่อ.........................................................นายจ้าง/ผู้รับมอบอำนาจ
            </div>
            <div style={{ marginTop: "15px" }}>
              ยื่นแบบวันที่.........เดือน.......................พ.ศ...............
            </div>
          </div>
        </div>
      </div>
    );
  },
);

SSO110Preview.displayName = "SSO110Preview";

export default SSO110Preview;
