"use client";

import React, { forwardRef } from "react";
import { PND1GorData } from "@/types/documents";
import { formatCurrency } from "@/utils/formatters";

interface PND1KorPreviewProps {
  data: PND1GorData;
}

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

const PND1KorPreview = forwardRef<HTMLDivElement, PND1KorPreviewProps>(
  ({ data }, ref) => {
    // --- Data Preparation ---
    const companyTaxDigits = data.companyTaxId.replace(/\D/g, "");
    const companyTaxDigitsArray = companyTaxDigits.split("");
    while (companyTaxDigitsArray.length < 13) companyTaxDigitsArray.push("");

    const branchDigits = (data.companyBranch || "").replace(/\D/g, "").split("");
    while (branchDigits.length < 5) branchDigits.push("");

    // Calculate Totals
    const totalEmployeeCount = data.employees.length;
    const totalIncome = data.employees.reduce(
      (sum, emp) => sum + (Number(emp.totalIncome) || 0),
      0,
    );
    const totalTax = data.employees.reduce(
      (sum, emp) => sum + (Number(emp.totalTax) || 0),
      0,
    );

    // Format Money
    const splitMoney = (amount: number) => {
      const str = amount.toFixed(2);
      const [baht, satang] = str.split(".");
      const bahtFormatted = Number(baht).toLocaleString("en-US");
      return { baht: bahtFormatted, satang };
    };

    const incomeParts = splitMoney(totalIncome);
    const taxParts = splitMoney(totalTax);

    // Pagination
    const employeesPerPage = 7;
    const totalPages = Math.ceil(
      (data.employees.length || 1) / employeesPerPage,
    );
    const employeePages: (typeof data.employees)[] = [];

    if (data.employees.length === 0) {
      employeePages.push([]);
    } else {
      for (let i = 0; i < totalPages; i++) {
        employeePages.push(
          data.employees.slice(
            i * employeesPerPage,
            (i + 1) * employeesPerPage,
          ),
        );
      }
    }

    const currentYear = new Date().getFullYear() + 543;

    // --- Helper Components ---
    const TaxIdBoxGroup = ({ digits }: { digits: string[] }) => {
      const groups = [
        [digits[0]],
        [digits[1], digits[2], digits[3], digits[4]],
        [digits[5], digits[6], digits[7], digits[8], digits[9]],
        [digits[10], digits[11]],
        [digits[12]],
      ];
      return (
        <div
          style={{
            display: "inline-flex",
            gap: "5px",
            alignItems: "center",
          }}
        >
          {groups.map((group, groupIdx) => (
            <div
              key={groupIdx}
              style={{ display: "flex", border: "1px solid #000" }}
            >
              {group.map((digit, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "16px",
                    height: "20px",
                    borderRight:
                      idx === group.length - 1 ? "none" : "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    };

    const BranchIdBox = ({ digit }: { digit: string }) => (
      <div
        style={{
          width: "20px",
          height: "24px",
          border: "1px solid #000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
        }}
      >
        {digit}
      </div>
    );

    const Checkbox = ({
      label,
      checked = false,
      size = 16,
    }: {
      label?: string;
      checked?: boolean;
      size?: number;
    }) => (
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            border: "1px solid #000",
            backgroundColor: "white",
            flexShrink: 0,
            marginTop: "2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {checked ? "✓" : ""}
        </div>
        {label && (
          <span style={{ fontSize: "14px", lineHeight: "1.4" }}>{label}</span>
        )}
      </div>
    );

    const AttachmentCheckbox = ({ label }: { label: string }) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "6px",
          width: "48%",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            border: "1px solid #000",
            backgroundColor: "white",
            flexShrink: 0,
            marginTop: "3px",
          }}
        />
        <span style={{ fontSize: "11px", lineHeight: "1.3" }}>{label}</span>
      </div>
    );

    return (
      <div ref={ref} className="preview-root">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .pnd-page * { box-sizing: border-box; }
            .pnd-page {
              font-family: "Sarabun", "TH Sarabun New", sans-serif;
              color: #000;
              line-height: 1.2;
              font-size: 13px;
              background: white;
              margin: 0 auto 20px auto;
              position: relative;
            }
            .page-cover { width: 210mm; min-height: 297mm; padding: 10mm 15mm; display: flex; flexDirection: column; }
            .page-attachment { width: 297mm; min-height: 210mm; padding: 10mm 15mm; }
            .export-mode .pnd-page { margin: 0 !important; box-shadow: none !important; }
            
            .page-frame {
                border: 2px solid #000;
                padding: 0;
                flex: 1; 
                display: flex;
                flex-direction: column;
            }

            table.pnd-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; }
            table.pnd-table th, table.pnd-table td { border: 1px solid #000; padding: 4px; vertical-align: middle; }
            
            .grey-bar { background-color: #d9d9d9; border: 1px solid #000; text-align: center; padding: 4px; font-weight: bold; margin: 10px 0; font-size: 14px; }
          `,
          }}
        />

        {/* ================= PAGE 1: COVER ================= */}
        <div className="pnd-page page-cover">
          {/* Main Content Frame */}
          <div className="page-frame">
            {/* 1. HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
                marginBottom: "0",
                border: "1px solid #000",
                backgroundColor: "#e6e6e6",
                height: "80px",
              }}
            >
              <div
                style={{
                  width: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  borderRight: "none",
                }}
              >
                <img
                  src="/images/rrd.jpg"
                  alt="ตรากรมสรรพากร"
                  style={{
                    width: "55px",
                    height: "55px",
                    objectFit: "contain",
                    filter: "grayscale(100%) contrast(1.2)",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                  แบบยื่นรายการภาษีเงินได้หัก ณ ที่จ่าย
                </div>
                <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                  ตามมาตรา 58 (2)
                </div>
                <div style={{ fontSize: "11px", marginTop: "4px" }}>
                  สำหรับแสดงรายการเกี่ยวกับเงินได้พึงประเมินตามมาตรา 40 (1) (2)
                  แห่งประมวลรัษฎากร
                </div>
              </div>
              <div
                style={{
                  width: "140px",
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #000",
                    borderRadius: "12px",
                    width: "100%",
                    height: "90%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "bold",
                      lineHeight: "1",
                    }}
                  >
                    ภ.ง.ด.1ก
                  </div>
                </div>
              </div>
            </div>

            {/* 2. INFO SECTION */}
            <div style={{ display: "flex", height: "230px" }}>
              <div
                style={{ flex: 1.4, display: "flex", flexDirection: "column" }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #000",
                    borderTop: "none",
                    borderBottom: "none",
                    borderRight: "1px solid #000",
                    position: "relative",
                  }}
                >
                  <div style={{ marginBottom: "5px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                      เลขประจำตัวผู้เสียภาษีอากร (13หลัก)
                    </span>
                    <span
                      style={{
                        fontSize: "20px",
                        marginLeft: "15px",
                        letterSpacing: "1px",
                        fontWeight: "500",
                      }}
                    >
                      {companyTaxDigits}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      paddingLeft: "40px",
                      marginBottom: "12px",
                    }}
                  >
                    (ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)
                  </div>
                  <div
                    style={{
                      marginBottom: "5px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                        ชื่อผู้มีหน้าที่หักภาษี ณ ที่จ่าย{" "}
                        <span style={{ fontWeight: "normal" }}>(หน่วยงาน)</span>
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        marginRight: "10px",
                      }}
                    >
                      <span style={{ fontSize: "14px", marginRight: "5px" }}>
                        สาขาที่
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                        {data.companyBranch || "00000"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      marginTop: "0px",
                      paddingLeft: "5px",
                      marginBottom: "10px",
                    }}
                  >
                    {data.companyName}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ที่ตั้งสำนักงาน :
                    </span>
                    <span
                      style={{
                        marginLeft: "10px",
                        borderBottom: "1px dotted #999",
                        flex: 1,
                        fontSize: "14px",
                        lineHeight: "1.5",
                        paddingBottom: "3px",
                      }}
                    >
                      {data.companyAddress}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      right: "10px",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        width: "45%",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>รหัสไปรษณีย์</span>
                      <span
                        style={{
                          borderBottom: "1px dotted #999",
                          flex: 1,
                          textAlign: "center",
                          margin: "0 5px",
                          paddingBottom: "3px",
                        }}
                      >
                        {data.postalCode || ""}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        width: "55%",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>โทรศัพท์</span>
                      <span
                        style={{
                          borderBottom: "1px dotted #999",
                          flex: 1,
                          textAlign: "center",
                          margin: "0 5px",
                          paddingBottom: "3px",
                        }}
                      >
                        {data.phone || ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: "50px",
                    backgroundColor: "#bfbfbf",
                    border: "1px solid #000",
                    borderTop: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "black",
                    fontStyle: "italic",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                >
                  โปรดยื่นแบบ ภ.ง.ด.1ก ภายในเดือนกุมภาพันธ์
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  border: "1px solid #000",
                  borderTop: "none",
                  borderLeft: "none",
                }}
              >
                <div
                  style={{
                    height: "60px",
                    padding: "10px",
                    borderBottom: "1px solid #000",
                  }}
                >
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "flex-end",
                      marginTop: "10px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>
                      รายการภาษีเงินได้หัก ณ ที่จ่าย ประจำปีภาษี
                    </span>
                    <span
                      style={{
                        borderBottom: "1px dotted #999",
                        width: "50px",
                        textAlign: "center",
                        marginLeft: "5px",
                        fontSize: "14px",
                        paddingBottom: "3px",
                      }}
                    >
                      {currentYear}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    height: "50px",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    borderBottom: "1px solid #000",
                  }}
                >
                  <Checkbox label="(1) ยื่นปกติ" checked={true} />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox label="(2) ยื่นเพิ่มเติมครั้งที่" />
                    <span
                      style={{
                        borderBottom: "1px dotted #999",
                        width: "40px",
                        marginLeft: "5px",
                      }}
                    ></span>
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    backgroundColor: "#f2f2f2",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    สำหรับบันทึกข้อมูลจากระบบ TCL
                  </span>
                </div>
              </div>
            </div>

            {/* 4. ATTACHMENT DECLARATION */}
            <div style={{ padding: "10px 5px 5px 5px", marginBottom: "0px" }}>
              <div
                style={{
                  marginBottom: "5px",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                ขอยื่นรายการแสดงการจ่ายเงินได้พึงประเมินตาม มาตรา 40 (1) (2)
                ในปีที่ล่วงมาแล้ว
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "40%",
                    fontSize: "12px",
                    color: "#000",
                    lineHeight: "1.4",
                  }}
                >
                  มีรายละเอียดการหักเป็นรายผู้มีเงินได้ ปรากฎตาม
                  <br />
                  (ให้แสดงรายละเอียดในใบแนบ ภ.ง.ด.1ก หรือในสื่อ
                  <br />
                  บันทึกในระบบคอมพิวเตอร์อย่างใดอย่างหนึ่งเท่านั้น)
                </div>
                <div style={{ width: "58%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Checkbox checked={true} size={14} />
                      <span style={{ fontSize: "13px" }}>
                        ใบแนบ ภ.ง.ด.1ก &nbsp;&nbsp;ที่แนบมาพร้อมนี้ :
                      </span>
                    </div>
                    <div style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
                      จำนวน{" "}
                      <span
                        style={{
                          borderBottom: "1px dotted #000",
                          width: "60px",
                          display: "inline-block",
                          textAlign: "center",
                        }}
                      >
                        {totalPages}
                      </span>{" "}
                      แผ่น
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <Checkbox size={14} />
                      <span style={{ fontSize: "13px" }}>
                        สื่อบันทึกในระบบคอมพิวเตอร์ &nbsp;&nbsp;ที่แนบมาพร้อมนี้
                        :
                      </span>
                    </div>
                    <div style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
                      จำนวน{" "}
                      <span
                        style={{
                          borderBottom: "1px dotted #000",
                          width: "60px",
                          display: "inline-block",
                          textAlign: "center",
                        }}
                      ></span>{" "}
                      แผ่น
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      marginLeft: "25px",
                      marginTop: "2px",
                    }}
                  >
                    (ตามหนังสือแสดงความประสงค์ฯ
                    ทะเบียนรับเลขที่..........................................)
                  </div>
                </div>
              </div>
            </div>

            {/* 5. SUMMARY TABLE (Adjusted height to fill space) */}
            <div
              style={{
                padding: "0 5px",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  marginBottom: "4px",
                  height: "35px",
                }}
              >
                <div
                  style={{
                    width: "45%",
                    backgroundColor: "#999",
                    color: "black",
                    fontWeight: "bold",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px 0 0 4px",
                    border: "1px solid #999",
                  }}
                >
                  สรุปรายการภาษีที่นำส่ง
                </div>
                <div style={{ flex: 1, display: "flex", paddingLeft: "5px" }}>
                  <div
                    style={{
                      width: "20%",
                      border: "1px solid #000",
                      borderRadius: "6px",
                      backgroundColor: "#e6e6e6",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    จำนวนราย
                  </div>
                  <div
                    style={{
                      width: "40%",
                      border: "1px solid #000",
                      borderRadius: "6px",
                      backgroundColor: "#e6e6e6",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "4px",
                    }}
                  >
                    เงินได้ทั้งสิ้น
                  </div>
                  <div
                    style={{
                      width: "40%",
                      border: "1px solid #000",
                      borderRadius: "6px",
                      backgroundColor: "#e6e6e6",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: "4px",
                    }}
                  >
                    ภาษีที่นำส่งทั้งสิ้น
                  </div>
                </div>
              </div>

              {/* Table Body (Flex grow to fill available space) */}
              <div style={{ display: "flex", flex: 1 }}>
                {/* Labels Column */}
                <div
                  style={{
                    width: "45%",
                    fontSize: "12px",
                    lineHeight: "1.8",
                    paddingTop: "5px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    1. เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีทั่วไป
                  </div>
                  <div
                    style={{
                      height: "55px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      marginTop: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <div>
                      2. เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีได้รับ
                    </div>
                    <div style={{ paddingLeft: "15px" }}>
                      อนุมัติจากกรมสรรพากรให้หักอัตรา ร้อยละ 3
                    </div>
                    <div style={{ paddingLeft: "15px" }}>
                      (ตามหนังสือที่...............................ลงวันที่...............................)
                    </div>
                  </div>
                  <div
                    style={{
                      height: "55px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      marginTop: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <div>
                      3. เงินได้ตามมาตรา 40 (1) (2) กรณีนายจ้างจ่ายให้ครั้งเดียว
                    </div>
                    <div style={{ paddingLeft: "15px" }}>
                      เพราะเหตุออกจากงาน
                    </div>
                  </div>
                  <div
                    style={{
                      height: "55px",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    4. เงินได้ตามมาตรา 40 (2)
                    กรณีผู้รับเงินได้เป็นผู้อยู่ในประเทศไทย
                  </div>
                  <div
                    style={{
                      height: "55px",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    5. เงินได้ตามมาตรา 40 (2)
                    กรณีผู้รับเงินได้มิได้เป็นผู้อยู่ในประเทศไทย
                  </div>
                  <div
                    style={{
                      height: "35px",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "bold",
                      marginTop: "4px",
                    }}
                  >
                    6. รวม
                  </div>
                </div>

                {/* Input Grid (Right Side) */}
                <div
                  style={{
                    flex: 1,
                    paddingLeft: "5px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Row 1 */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "35px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "right",
                        paddingRight: "5px",
                        backgroundColor: "#e6e6e6",
                        fontSize: "13px",
                      }}
                    >
                      {totalEmployeeCount}
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "right",
                          paddingRight: "5px",
                        }}
                      >
                        {incomeParts.baht}
                      </div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                        }}
                      >
                        {incomeParts.satang}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "right",
                          paddingRight: "5px",
                        }}
                      >
                        {taxParts.baht}
                      </div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                        }}
                      >
                        {taxParts.satang}
                      </div>
                    </div>
                  </div>

                  {/* Row 2 (Fixed height same as other rows) */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "55px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        backgroundColor: "#e6e6e6",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Row 3 (Medium) */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "55px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        backgroundColor: "#e6e6e6",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "55px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        backgroundColor: "#e6e6e6",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "55px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        backgroundColor: "#e6e6e6",
                      }}
                    ></div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                        }}
                      ></div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Row 6 (Total) */}
                  <div
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      height: "35px",
                    }}
                  >
                    <div
                      style={{
                        width: "20%",
                        border: "1px solid #000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "right",
                        paddingRight: "5px",
                        backgroundColor: "#999",
                        fontSize: "13px",
                      }}
                    >
                      {totalEmployeeCount}
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "right",
                          paddingRight: "5px",
                          backgroundColor: "#999",
                        }}
                      >
                        {incomeParts.baht}
                      </div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          backgroundColor: "#999",
                        }}
                      >
                        {incomeParts.satang}
                      </div>
                    </div>
                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        marginLeft: "4px",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: "1px solid #000",
                          borderRight: "1px dotted #000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "right",
                          paddingRight: "5px",
                          backgroundColor: "#999",
                        }}
                      >
                        {taxParts.baht}
                      </div>
                      <div
                        style={{
                          width: "25px",
                          border: "1px solid #000",
                          borderLeft: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          backgroundColor: "#999",
                        }}
                      >
                        {taxParts.satang}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. SEPARATOR LINE */}
            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "#000",
                margin: "5px 0",
              }}
            ></div>

            {/* 7. SIGNATURE (Fixed Height at Bottom) - TEXT CENTERED MORE RIGHT */}
            <div
              style={{
                textAlign: "center",
                height: "260px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingBottom: "5px",
              }}
            >
              <div
                style={{
                  marginBottom: "10px",
                  fontSize: "13px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                ข้าพเจ้าขอรับรองว่า รายการที่แจ้งไว้ข้างต้นนี้
                เป็นรายการที่ถูกต้องและครบถ้วนทุกประการ
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  paddingLeft: "120px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>ลงชื่อ</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "200px",
                        height: "15px",
                      }}
                    ></span>
                    <span style={{ fontSize: "12px" }}>ผู้จ่ายเงิน</span>
                  </div>
                  <div style={{ fontSize: "12px" }}>
                    ({" "}
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        minWidth: "200px",
                        display: "inline-block",
                        textAlign: "center",
                      }}
                    >
                      {data.companyName}
                    </span>{" "}
                    )
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>ตำแหน่ง</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "200px",
                        height: "15px",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      กรรมการผู้จัดการ
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>ยื่นวันที่</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "40px",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      {new Date().getDate()}
                    </span>
                    <span style={{ fontSize: "12px" }}>เดือน</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "80px",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      {THAI_MONTHS[new Date().getMonth() + 1]}
                    </span>
                    <span style={{ fontSize: "12px" }}>พ.ศ.</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "50px",
                        textAlign: "center",
                        fontSize: "12px",
                      }}
                    >
                      {currentYear}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    border: "1px solid #000",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    textAlign: "center",
                    marginLeft: "40px",
                  }}
                >
                  ประทับตรา
                  <br />
                  นิติบุคคล
                  <br />
                  (ถ้ามี)
                </div>
              </div>
            </div>
          </div>
          {/* End of Page Frame */}

          {/* 8. FOOTER TEXT (Positioned absolutely at bottom-right outside) */}
          <div
            style={{
              position: "absolute",
              bottom: "5mm",
              right: "15mm",
              fontSize: "10px",
              color: "#666",
            }}
          >
            (ก่อนกรอกรายการ ดูคำชี้แจงด้านหลัง)
          </div>
        </div>

        {/* ================= PAGE 2+: ATTACHMENTS ================= */}
        {employeePages.map((pageData, pageIdx) => (
          <div key={pageIdx} className="pnd-page page-attachment">
            {/* Header Section */}
            <div style={{ marginBottom: "10px" }}>
              {/* Row 1: Title only */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  ใบแนบ ภ.ง.ด.1ก
                </div>
              </div>

              {/* Row 2: Tax ID line */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "12px" }}>
                  เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) (ของผู้มีหน้าที่หักภาษี ณ
                  ที่จ่าย)
                </span>
                <div
                  style={{
                    border: "2px solid #000",
                    padding: "4px 10px",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {companyTaxDigits}
                </div>
              </div>

              {/* Row 3: Income Type Selection, Tax ID (right), Branch and Page Number (right column) */}
              <div
                style={{ display: "flex", alignItems: "stretch", gap: "10px" }}
              >
                {/* Income Type Box */}
                <div
                  style={{
                    flex: 1,
                    border: "1px solid #000",
                    padding: "8px 12px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontStyle: "italic",
                      marginBottom: "8px",
                    }}
                  >
                    (ให้แยกกรอกรายการในใบแนบนี้ตามเงินได้แต่ละประเภท
                    โดยใส่เครื่องหมาย " / " ลงใน " □ " หน้าข้อความแล้วแต่กรณี
                    เพียงข้อเดียว)
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        fontSize: "12px",
                      }}
                    >
                      ประเภทเงินได้
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: "15px" }}>
                      {/* Left column */}
                      <div style={{ flex: 1, fontSize: "11px" }}>
                        <div
                          style={{
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "5px",
                          }}
                        >
                          <Checkbox checked={true} size={12} />
                          <span>
                            (1) เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ
                            กรณีทั่วไป
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "5px",
                          }}
                        >
                          <Checkbox size={12} />
                          <span>
                            (2) เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ
                            กรณีได้รับอนุมัติจากกรมสรรพากรให้หักอัตรา ร้อยละ 3
                          </span>
                        </div>
                      </div>
                      {/* Right column */}
                      <div style={{ flex: 1, fontSize: "11px" }}>
                        <div
                          style={{
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "5px",
                          }}
                        >
                          <Checkbox size={12} />
                          <span>
                            (3) เงินได้ตามมาตรา 40 (1) (2)
                            กรณีนายจ้างจ่ายให้ครั้งเดียวเพราะเหตุออกจากงาน
                          </span>
                        </div>
                        <div
                          style={{
                            marginBottom: "8px",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "5px",
                          }}
                        >
                          <Checkbox size={12} />
                          <span>
                            (4) เงินได้ตามมาตรา 40 (2)
                            กรณีผู้รับเงินได้เป็นผู้อยู่ในประเทศไทย
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "5px",
                          }}
                        >
                          <Checkbox size={12} />
                          <span>
                            (5) เงินได้ตามมาตรา 40 (2)
                            กรณีผู้รับเงินได้มิได้เป็นผู้อยู่ในประเทศไทย
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column: Branch and Page number aligned with income type box */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minWidth: "150px",
                  }}
                >
                  {/* Branch - aligned with top of income type box */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ fontWeight: "bold" }}>สาขาที่</span>
                    <div
                      style={{
                        border: "1px solid #000",
                        padding: "4px 15px",
                        fontWeight: "bold",
                      }}
                    >
                      {data.companyBranch || "00000"}
                    </div>
                  </div>

                  {/* Page number - aligned with bottom of income type box */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>แผ่นที่</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        minWidth: "30px",
                        textAlign: "center",
                        margin: "0 5px",
                      }}
                    >
                      {pageIdx + 1}
                    </span>
                    <span>ในจำนวน</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        minWidth: "30px",
                        textAlign: "center",
                        margin: "0 5px",
                      }}
                    >
                      {totalPages}
                    </span>
                    <span>แผ่น</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <table className="pnd-table" style={{ fontSize: "11px" }}>
              <thead>
                <tr style={{ backgroundColor: "#ddd" }}>
                  <th
                    rowSpan={1}
                    style={{
                      width: "4%",
                      verticalAlign: "middle",
                      fontSize: "12px",
                    }}
                  >
                    ลำดับที่
                  </th>
                  <th
                    rowSpan={1}
                    style={{
                      width: "22%",
                      verticalAlign: "middle",
                      fontSize: "11px",
                    }}
                  >
                    เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) (ของผู้มีเงินได้)
                  </th>
                  <th rowSpan={1} style={{ width: "38%", fontSize: "11px" }}>
                    ข้อมูลผู้มีเงินได้ (ให้ระบุให้ชัดเจนว่าเป็น นาย นาง นางสาว
                    หรือยศ)
                    <br />
                    <span style={{ fontSize: "10px" }}>
                      ที่อยุของผู้มีเงินได้ (ให้ระบุเลขที่ ตรอก/ซอย ถนน
                      ตำบล/แขวง อำเภอ/เขต จังหวัด)
                    </span>
                  </th>
                  <th colSpan={2} style={{ width: "16%", fontSize: "11px" }}>
                    จำนวนเงินที่จ่ายในครั้งนี้
                  </th>
                  <th colSpan={2} style={{ width: "14%", fontSize: "11px" }}>
                    จำนวนเงินภาษีที่หักและนำส่งในครั้งนี้
                  </th>
                  <th
                    rowSpan={1}
                    style={{
                      width: "6%",
                      verticalAlign: "middle",
                      fontSize: "11px",
                    }}
                  >
                    เงื่อนไข*
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((emp, idx) => {
                  // แยกเงินเป็นบาทและสตางค์
                  const amountBaht = Math.floor(Number(emp.totalIncome) || 0);
                  const amountSatang = Math.round(
                    ((Number(emp.totalIncome) || 0) - amountBaht) * 100,
                  );
                  const taxBaht = Math.floor(Number(emp.totalTax) || 0);
                  const taxSatang = Math.round(
                    ((Number(emp.totalTax) || 0) - taxBaht) * 100,
                  );

                  return (
                    <tr key={idx} style={{ height: "65px" }}>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          fontSize: "12px",
                        }}
                      >
                        {pageIdx * employeesPerPage + idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            border: "2px solid #000",
                            display: "inline-block",
                            padding: "3px 10px",
                            letterSpacing: "1px",
                            fontSize: "12px",
                            width: "180px",
                            height: "24px",
                            backgroundColor: "white",
                            lineHeight: "18px",
                          }}
                        >
                          {emp.idNumber || ""}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          verticalAlign: "top",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            marginBottom: "6px",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{ whiteSpace: "nowrap", marginRight: "5px" }}
                          >
                            ชื่อ
                          </span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              flex: "1",
                              minWidth: "0",
                              marginRight: "15px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              paddingBottom: "3px",
                            }}
                          >
                            {emp.titleName} {emp.firstName}
                          </span>
                          <span
                            style={{ whiteSpace: "nowrap", marginRight: "5px" }}
                          >
                            ชื่อสกุล
                          </span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              flex: "1",
                              minWidth: "0",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              paddingBottom: "3px",
                            }}
                          >
                            {emp.lastName}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            position: "absolute",
                            bottom: "8px",
                            left: "10px",
                            right: "10px",
                          }}
                        >
                          <span style={{ whiteSpace: "nowrap" }}>ที่อยู่</span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              display: "inline-block",
                              width: "calc(100% - 25px)",
                              marginLeft: "5px",
                              paddingBottom: "3px",
                            }}
                          >
                            {emp.address || ""}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          verticalAlign: "top",
                          paddingRight: "8px",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                            textAlign: "right",
                            paddingRight: "0",
                            paddingBottom: "3px",
                          }}
                        >
                          {amountBaht > 0 ? amountBaht.toLocaleString() : ""}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "top",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                            textAlign: "center",
                            paddingBottom: "3px",
                          }}
                        >
                          {amountBaht > 0
                            ? String(amountSatang).padStart(2, "0")
                            : ""}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          verticalAlign: "top",
                          paddingRight: "8px",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                            textAlign: "right",
                            paddingRight: "0",
                            paddingBottom: "3px",
                          }}
                        >
                          {taxBaht > 0 ? taxBaht.toLocaleString() : ""}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "top",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                            textAlign: "center",
                            paddingBottom: "3px",
                          }}
                        >
                          {taxBaht > 0
                            ? String(taxSatang).padStart(2, "0")
                            : ""}
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "top",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                            textAlign: "center",
                          }}
                        >
                          {1}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageData.length < employeesPerPage &&
                  Array.from({
                    length: employeesPerPage - pageData.length,
                  }).map((_, idx) => (
                    <tr key={`empty-${idx}`} style={{ height: "65px" }}>
                      <td
                        style={{
                          textAlign: "center",
                          fontSize: "12px",
                          verticalAlign: "middle",
                        }}
                      >
                        {pageIdx * employeesPerPage + pageData.length + idx + 1}
                      </td>
                      <td
                        style={{
                          padding: "8px",
                          verticalAlign: "middle",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            border: "2px solid #000",
                            display: "inline-block",
                            padding: "3px 10px",
                            width: "180px",
                            height: "24px",
                            backgroundColor: "white",
                          }}
                        ></div>
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          verticalAlign: "top",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            marginBottom: "6px",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "nowrap",
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{ whiteSpace: "nowrap", marginRight: "5px" }}
                          >
                            ชื่อ
                          </span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              flex: "1",
                              minWidth: "0",
                              marginRight: "15px",
                            }}
                          ></span>
                          <span
                            style={{ whiteSpace: "nowrap", marginRight: "5px" }}
                          >
                            ชื่อสกุล
                          </span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              flex: "1",
                              minWidth: "0",
                            }}
                          ></span>
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            position: "absolute",
                            bottom: "8px",
                            left: "10px",
                            right: "10px",
                          }}
                        >
                          <span style={{ whiteSpace: "nowrap" }}>ที่อยู่</span>
                          <span
                            style={{
                              borderBottom: "1px dotted #999",
                              display: "inline-block",
                              width: "calc(100% - 25px)",
                              marginLeft: "5px",
                            }}
                          ></span>
                        </div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                          }}
                        ></div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                          }}
                        ></div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                          }}
                        ></div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                          }}
                        ></div>
                      </td>
                      <td style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            right: "8px",
                            borderBottom: "1px dotted #999",
                          }}
                        ></div>
                      </td>
                    </tr>
                  ))}
                {/* Summary row */}
                <tr
                  style={{
                    fontWeight: "normal",
                    height: "40px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "right",
                      paddingRight: "10px",
                      fontSize: "11px",
                    }}
                  >
                    รวมยอดเงินได้และภาษีที่นำส่ง (นำไปรวมกับ{" "}
                    <span style={{ fontWeight: "bold" }}>
                      ใบแนบ ภ.ง.ด.1ก แผ่นอื่น (ถ้ามี)
                    </span>
                    )
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingRight: "8px",
                      verticalAlign: "bottom",
                      fontSize: "12px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #999",
                        paddingBottom: "4px",
                        textAlign: "right",
                        paddingRight: "8px",
                      }}
                    >
                      {(() => {
                        const totalAmount = pageData.reduce(
                          (sum, emp) => sum + (Number(emp.totalIncome) || 0),
                          0,
                        );
                        return Math.floor(totalAmount).toLocaleString();
                      })()}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "bottom",
                      fontSize: "12px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #999",
                        paddingBottom: "4px",
                        textAlign: "center",
                      }}
                    >
                      {(() => {
                        const totalAmount = pageData.reduce(
                          (sum, emp) => sum + (Number(emp.totalIncome) || 0),
                          0,
                        );
                        const satang = Math.round(
                          (totalAmount - Math.floor(totalAmount)) * 100,
                        );
                        return String(satang).padStart(2, "0");
                      })()}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingRight: "8px",
                      verticalAlign: "bottom",
                      fontSize: "12px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #999",
                        paddingBottom: "4px",
                        textAlign: "right",
                        paddingRight: "8px",
                      }}
                    >
                      {(() => {
                        const totalTax = pageData.reduce(
                          (sum, emp) => sum + (Number(emp.totalTax) || 0),
                          0,
                        );
                        return Math.floor(totalTax).toLocaleString();
                      })()}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      verticalAlign: "bottom",
                      fontSize: "12px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #999",
                        paddingBottom: "4px",
                        textAlign: "center",
                      }}
                    >
                      {(() => {
                        const totalTax = pageData.reduce(
                          (sum, emp) => sum + (Number(emp.totalTax) || 0),
                          0,
                        );
                        const satang = Math.round(
                          (totalTax - Math.floor(totalTax)) * 100,
                        );
                        return String(satang).padStart(2, "0");
                      })()}
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* Footer Section */}
            <div
              style={{
                border: "1px solid #000",
                marginTop: "10px",
                display: "flex",
                minHeight: "100px",
                backgroundColor: "#f5f5f5",
              }}
            >
              <div
                style={{
                  width: "60%",
                  padding: "10px",
                  borderRight: "1px solid #000",
                  fontSize: "11px",
                }}
              >
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: "10px",
                    marginBottom: "5px",
                  }}
                >
                  (ให้กรอกลำดับที่ต่อเนื่องกันไปทุกแผ่น)
                </div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                  หมายเหตุ * เงื่อนไขการหักภาษี ให้กรอกดังนี้
                </div>
                <div style={{ marginLeft: "20px", fontSize: "11px" }}>
                  <div>
                    ■ หัก ณ ที่จ่าย{" "}
                    <span style={{ marginLeft: "60px" }}>กรอก 1</span>
                  </div>
                  <div>
                    ■ ออกให้ตลอดไป{" "}
                    <span style={{ marginLeft: "50px" }}>กรอก 2</span>
                  </div>
                  <div>
                    ■ ออกให้ครั้งเดียว{" "}
                    <span style={{ marginLeft: "50px" }}>กรอก 3</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "40%",
                  padding: "10px 10px 10px 50px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    border: "1px solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "9px",
                    textAlign: "center",
                    backgroundColor: "white",
                    flexShrink: 0,
                  }}
                >
                  ประทับตรา
                  <br />
                  นิติบุคคล
                  <br />
                  (ถ้ามี)
                </div>
                <div style={{ flex: 1, fontSize: "11px" }}>
                  <div
                    style={{
                      marginBottom: "5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>ลงชื่อ</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        flex: 1,
                        marginLeft: "5px",
                        marginRight: "5px",
                      }}
                    ></span>
                    <span style={{ whiteSpace: "nowrap" }}>ผู้จ่ายเงิน</span>
                  </div>
                  <div style={{ marginBottom: "5px", textAlign: "center" }}>
                    ({" "}
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        display: "inline-block",
                        width: "160px",
                      }}
                    ></span>{" "}
                    )
                  </div>
                  <div
                    style={{
                      marginBottom: "5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>ตำแหน่ง</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        flex: 1,
                        marginLeft: "5px",
                      }}
                    ></span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span style={{ whiteSpace: "nowrap" }}>ยื่นวันที่</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "25px",
                        textAlign: "center",
                        paddingBottom: "3px",
                      }}
                    >
                      {new Date().getDate()}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>เดือน</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "60px",
                        textAlign: "center",
                        paddingBottom: "3px",
                      }}
                    >
                      {THAI_MONTHS[new Date().getMonth() + 1]}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>พ.ศ.</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        width: "40px",
                        textAlign: "center",
                        paddingBottom: "3px",
                      }}
                    >
                      {currentYear}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  },
);

PND1KorPreview.displayName = "PND1KorPreview";

export default PND1KorPreview;
