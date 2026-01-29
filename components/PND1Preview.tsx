"use client";

import React, { forwardRef } from "react";
import { PND1Data } from "@/types/documents";
import { formatCurrency } from "@/utils/formatters";

interface PND1PreviewProps {
  data: PND1Data;
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

const PND1Preview = forwardRef<HTMLDivElement, PND1PreviewProps>(
  ({ data }, ref) => {
    const companyTaxDigits = data.companyTaxId.replace(/\D/g, "").split("");
    while (companyTaxDigits.length < 13) companyTaxDigits.push("");

    const employeesPerPage = 8;
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

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = THAI_MONTHS[today.getMonth() + 1];
    const currentYear = today.getFullYear() + 543;

    const DottedLineInput = ({
      text,
      width = "100%",
      align = "left",
      noBorder = false,
    }: {
      text?: any;
      width?: string;
      align?: "left" | "center" | "right";
      noBorder?: boolean;
    }) => (
      <span
        className="dotted-input"
        style={{
          display: "inline-block",
          width,
          position: "relative",
          minHeight: "22px",
          margin: "0 2px",
          verticalAlign: "bottom",
        }}
      >
        <span
          style={{
            display: "block",
            width: "100%",
            textAlign: align,
            whiteSpace: "nowrap",
            overflow: "hidden",
            fontSize: "14px",
            lineHeight: "1.2",
            marginBottom: "4px",
          }}
        >
          {text}
        </span>
        {!noBorder && (
          <span
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              right: "0",
              borderBottom: "1px dotted #000",
            }}
          />
        )}
      </span>
    );

    const Checkbox = ({
      checked,
      label,
      fontSize = "12px",
    }: {
      checked: boolean;
      label?: string;
      fontSize?: string;
    }) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginRight: "5px",
          lineHeight: "1",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            border: "1px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: label ? "5px" : "0",
            fontSize: "12px",
            flexShrink: 0,
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
          }}
        >
          {checked && "✓"}
        </div>
        {label && (
          <span style={{ whiteSpace: "nowrap", fontSize: fontSize }}>
            {label}
          </span>
        )}
      </div>
    );

    const NumberBox = ({
      value,
      showZero = false,
      isGrey = false,
    }: {
      value?: number;
      showZero?: boolean;
      isGrey?: boolean;
    }) => {
      const valStr = value !== undefined ? formatCurrency(value) : "";
      const parts = valStr.split(".");
      const baht = parts[0] || "";
      const satang = parts[1] || "00";
      const hasValue = value !== undefined && (value > 0 || showZero);

      return (
        <div
          style={{ display: "flex", width: "100%", height: "24px", gap: "3px" }}
        >
          <div
            style={{
              flex: 1,
              border: "1px solid #000",
              backgroundColor: isGrey ? "#999" : "white",
              textAlign: "right",
              paddingRight: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              fontSize: "13px",
              lineHeight: "1.2",
            }}
          >
            {hasValue ? baht : ""}
          </div>
          <div
            style={{
              width: "25px",
              border: "1px solid #000",
              backgroundColor: isGrey ? "#999" : "white",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              lineHeight: "1.2",
            }}
          >
            {hasValue ? satang : ""}
          </div>
        </div>
      );
    };

    const CountBox = ({
      value,
      isGrey = false,
    }: {
      value?: number;
      isGrey?: boolean;
    }) => (
      <div
        style={{
          width: "100%",
          height: "24px",
          border: "1px solid #000",
          backgroundColor: isGrey ? "#999" : "white",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          lineHeight: "1.2",
        }}
      >
        {value && value > 0 ? value : ""}
      </div>
    );

    return (
      <div ref={ref} className="preview-root">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .pnd-page * {
              box-sizing: border-box;
            }

            .pnd-page {
                font-family: "Sarabun", "TH Sarabun New", sans-serif;
                color: #000;
                line-height: 1.3;
                font-size: 14px;
                background: white;
                margin: 0 auto 30px auto;
                position: relative;
                -webkit-font-smoothing: antialiased;
                text-rendering: geometricPrecision;
            }

            /* Export Mode Styles */
            .export-mode .pnd-page {
              margin: 0 !important;
              box-shadow: none !important;
              page-break-after: always;
            }

            .export-mode .pnd-page * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Fix dotted line inputs for export */
            .export-mode .dotted-input {
              display: inline-block !important;
              vertical-align: bottom !important;
            }

            .export-mode .dotted-input > span:first-child {
              display: block !important;
              margin-bottom: 5px !important;
            }

            .export-mode .dotted-input > span:last-child {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
            }

            .export-mode [style*="border-bottom"][style*="dotted"] {
              padding-bottom: 5px !important;
            }

            .export-mode .flex-row {
              display: flex !important;
              align-items: flex-end !important;
            }

            .export-mode .flex-row > * {
              vertical-align: bottom !important;
            }

            .export-mode .flex-between {
              display: flex !important;
              justify-content: space-between !important;
              align-items: baseline !important;
            }

            .export-mode table.pnd-table td,
            .export-mode table.pnd-table th {
              line-height: 1.2 !important;
              vertical-align: middle !important;
            }

            .export-mode table.pnd-table td > div {
              line-height: 1.2 !important;
            }

            .export-mode div[style*="display: flex"] {
              display: flex !important;
              align-items: center !important;
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
        `,
          }}
        />

        <div className="pnd-page page-cover">
          <div style={{ border: "2px solid #000", padding: "0" }}>
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "stretch",
                marginBottom: "0",
                height: "80px",
                borderBottom: "1px solid #000",
              }}
            >
              <div
                style={{
                  flex: 1,
                  backgroundColor: "#aaa",
                  borderRadius: "8px",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  marginRight: "8px",
                  margin: "5px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "white",
                    border: "1px solid #666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "10px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/images/rrd.jpg"
                    alt="ตรากรมสรรพากร"
                    style={{
                      width: "50px",
                      height: "50px",
                      filter: "grayscale(100%) contrast(1.2)",
                    }}
                  />
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    color: "black",
                    paddingTop: "5px",
                  }}
                >
                  <div
                    className="font-bold"
                    style={{ fontSize: "16px", lineHeight: "1.2" }}
                  >
                    แบบยื่นรายการภาษีเงินได้หัก ณ ที่จ่าย
                  </div>
                  <div
                    className="font-bold"
                    style={{ fontSize: "14px", lineHeight: "1.2" }}
                  >
                    ตามมาตรา 59 แห่งประมวลรัษฎากร
                  </div>
                  <div style={{ fontSize: "10px", marginTop: "4px" }}>
                    สำหรับการหักภาษี ณ ที่จ่ายตามมาตรา 50 (1)
                    กรณีการจ่ายเงินได้พึงประเมินตามมาตรา 40 (1) (2)
                    แห่งประมวลรัษฎากร
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "130px",
                  backgroundColor: "white",
                  border: "2px solid #000",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  margin: "5px",
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>
                  ภ.ง.ด.1
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div style={{ display: "flex", height: "300px" }}>
              <div
                style={{
                  width: "58%",
                  borderRight: "1px solid #000",
                  position: "relative",
                  backgroundColor: "#e0e0e0",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: "10px", flex: 1 }}>
                  <div
                    className="flex-row"
                    style={{ marginBottom: "15px", alignItems: "baseline" }}
                  >
                    <div className="font-bold" style={{ width: "180px" }}>
                      เลขประจำตัวผู้เสียภาษีอากร (13หลัก)
                    </div>
                    <div
                      style={{
                        letterSpacing: "2px",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      {data.companyTaxId}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      marginTop: "-12px",
                      marginBottom: "15px",
                      marginLeft: "20px",
                    }}
                  >
                    (ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "5px",
                    }}
                  >
                    <div className="font-bold">
                      ชื่อผู้มีหน้าที่หักภาษี ณ ที่จ่าย{" "}
                      <span style={{ fontWeight: "normal" }}>(หน่วยงาน)</span>
                    </div>
                    <div
                      style={{
                        marginLeft: "10px",
                        textAlign: "right",
                        minWidth: "100px",
                      }}
                    >
                      สาขาที่ <span style={{ marginLeft: "5px" }}>00000</span>
                    </div>
                  </div>
                  <div
                    style={{
                      borderBottom: "1px dotted #000",
                      marginBottom: "15px",
                      paddingBottom: "2px",
                      fontWeight: "bold",
                      height: "24px",
                    }}
                  >
                    {data.companyName}
                  </div>

                  <div
                    style={{
                      marginBottom: "25px",
                      display: "flex",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      className="font-bold"
                      style={{ whiteSpace: "nowrap", marginRight: "10px" }}
                    >
                      ที่ตั้งสำนักงาน :{" "}
                    </span>
                    <div style={{ flex: 1 }}>{data.companyAddress}</div>
                  </div>

                  <div className="flex-row" style={{ marginBottom: "10px" }}>
                    <span className="font-bold">รหัสไปรษณีย์</span>
                    <DottedLineInput
                      text={data.postalCode}
                      width="100px"
                      align="center"
                    />
                    <span
                      className="font-bold"
                      style={{ marginLeft: "auto", marginRight: "10px" }}
                    >
                      โทรศัพท์
                    </span>
                    <DottedLineInput
                      text={data.phone}
                      width="120px"
                      align="right"
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #000",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingLeft: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "30px",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      checked={data.submissionType === "normal"}
                      label="(1) ยื่นปกติ"
                    />
                    <div className="flex-row" style={{ alignItems: "center" }}>
                      <Checkbox
                        checked={data.submissionType === "additional"}
                        label="(2) ยื่นเพิ่มเติมครั้งที่"
                      />
                      <div
                        style={{
                          width: "50px",
                          borderBottom: "1px dotted #000",
                          textAlign: "center",
                          marginLeft: "5px",
                          height: "16px",
                          lineHeight: "16px",
                        }}
                      >
                        {data.submissionType === "additional" ? "1" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: "42%",
                  backgroundColor: "#e8e8e8",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ padding: "10px 5px", height: "180px" }}>
                  <div className="font-bold" style={{ marginBottom: "10px" }}>
                    เดือนที่จ่ายเงินได้พึงประเมิน
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <span style={{ marginRight: "5px", lineHeight: "1.5" }}>
                      ให้ทำเครื่องหมาย "✓" ลงใน "□" หน้าชื่อเดือน พ.ศ.
                    </span>
                    <DottedLineInput
                      text={data.taxYear}
                      width="60px"
                      align="center"
                    />
                  </div>

                  <div
                    className="month-grid-compact"
                    style={{ marginBottom: "10px" }}
                  >
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 1}
                      label="(1) มกราคม"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 4}
                      label="(4) เมษายน"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 7}
                      label="(7) กรกฎาคม"
                    />

                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 10}
                      label="(10) ตุลาคม"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 2}
                      label="(2) กุมภาพันธ์"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 5}
                      label="(5) พฤษภาคม"
                    />

                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 8}
                      label="(8) สิงหาคม"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 11}
                      label="(11) พฤศจิกายน"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 3}
                      label="(3) มีนาคม"
                    />

                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 6}
                      label="(6) มิถุนายน"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 9}
                      label="(9) กันยายน"
                    />
                    <Checkbox
                      fontSize="11px"
                      checked={data.taxMonth === 12}
                      label="(12) ธันวาคม"
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #000",
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    padding: "10px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    สำหรับบันทึกข้อมูลจากระบบ TCL
                  </div>
                </div>
              </div>
            </div>

            {/* ส่วนสรุปรายการ */}
            <div
              style={{
                borderTop: "1px solid #000",
                padding: "8px 10px 4px 10px",
                backgroundColor: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: "5px",
                }}
              >
                <div style={{ flex: 1, paddingRight: "10px" }}>
                  <div style={{ fontSize: "12px", marginBottom: "5px" }}>
                    <span>
                      มีรายละเอียดการหักเป็นรายผู้มีเงินได้ปรากฏตาม{" "}
                      <span style={{ fontWeight: "bold" }}>ใบแนบ ภ.ง.ด.1</span>{" "}
                      จำนวน{" "}
                      <DottedLineInput
                        text={totalPages}
                        width="40px"
                        align="center"
                      />{" "}
                      แผ่น
                    </span>
                  </div>
                  <div className="flex-row" style={{ alignItems: "baseline" }}>
                    <Checkbox checked={false} />
                    <span style={{ marginRight: "auto" }}>
                      สื่อบันทึกในระบบคอมพิวเตอร์ &nbsp;&nbsp; ที่แนบมาพร้อมนี้
                      :
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
                      จำนวน <DottedLineInput width="40px" align="center" /> แผ่น
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      paddingLeft: "20px",
                      marginTop: "2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    (ตามหนังสือแสดงความประสงค์ฯ ทะเบียนรับเลขที่{" "}
                    <DottedLineInput width="80px" />)
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  paddingBottom: "5px",
                }}
              >
                <div style={{ width: "52%", paddingRight: "10px" }}>
                  <div className="rounded-header-box">
                    สรุปรายการภาษีที่นำส่ง
                  </div>
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div className="column-header-box" style={{ width: "20%" }}>
                    จำนวนราย
                  </div>
                  <div className="column-header-box" style={{ width: "40%" }}>
                    เงินได้ทั้งสิ้น
                  </div>
                  <div className="column-header-box" style={{ width: "40%" }}>
                    ภาษีที่นำส่งทั้งสิ้น
                  </div>
                </div>
              </div>
            </div>

            {/* ตารางสรุป */}
            <div style={{ padding: "0 10px", paddingBottom: "10px" }}>
              {/* Row 1 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  1. เงินได้ตาม มาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีทั่วไป
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}>
                    <CountBox value={data.summary.employeeCount} />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox value={data.summary.totalIncome} />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox value={data.summary.totalTax} />
                  </div>
                </div>
              </div>

              {/* Row 2 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    2. เงินได้ตาม มาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีได้รับ
                  </div>
                  <div>อนุมัติจากกรมสรรพากรให้หักอัตรา ร้อยละ 3</div>
                  <div style={{ fontSize: "11px", marginTop: "2px" }}>
                    (ตามหนังสือที่ <DottedLineInput width="80px" /> ลงวันที่{" "}
                    <DottedLineInput width="80px" />)
                  </div>
                </div>
                <div
                  style={{
                    width: "48%",
                    display: "flex",
                    gap: "5px",
                    marginTop: "15px",
                  }}
                >
                  <div style={{ width: "20%" }}>
                    <CountBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  <div>
                    3. เงินได้ตาม มาตรา 40 (1) (2) กรณีนายจ้างจ่ายให้ครั้งเดียว
                  </div>
                  <div>เพราะเหตุออกจากงาน</div>
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}>
                    <CountBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  4. เงินได้ตาม มาตรา 40 (2)
                  กรณีผู้รับเงินได้เป็นผู้อยู่ในประเทศไทย
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}>
                    <CountBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                </div>
              </div>

              {/* Row 5 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  5. เงินได้ตาม มาตรา 40 (2)
                  กรณีผู้รับเงินได้มิได้เป็นผู้อยู่ในประเทศไทย
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}>
                    <CountBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                </div>
              </div>

              {/* Row 6 (Total) */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  6. รวม
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}>
                    <CountBox
                      value={data.summary.employeeCount}
                      isGrey={true}
                    />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox value={data.summary.totalIncome} isGrey={true} />
                  </div>
                  <div style={{ width: "40%" }}>
                    <NumberBox value={data.summary.totalTax} isGrey={true} />
                  </div>
                </div>
              </div>

              {/* Row 7 */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontSize: "13px",
                  }}
                >
                  7. เงินเพิ่ม (ถ้ามี)
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}></div>
                  <div style={{ width: "40%" }}></div>
                  <div style={{ width: "40%" }}>
                    <NumberBox />
                  </div>
                </div>
              </div>

              {/* Row 8 (Grand Total) */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "52%",
                    paddingRight: "10px",
                    fontWeight: "bold",
                    fontSize: "13px",
                  }}
                >
                  8. รวมยอดภาษีที่นำส่งทั้งสิ้น และเงินเพิ่ม (6. + 7.)
                </div>
                <div style={{ width: "48%", display: "flex", gap: "5px" }}>
                  <div style={{ width: "20%" }}></div>
                  <div style={{ width: "40%" }}></div>
                  <div style={{ width: "40%" }}>
                    <NumberBox value={data.summary.totalTax} isGrey={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div
              style={{
                borderTop: "1px solid #000",
                padding: "15px",
                backgroundColor: "#d0d0d0",
                display: "flex",
                flexDirection: "column",
                minHeight: "140px",
                position: "relative",
              }}
            >
              <div
                className="text-center font-bold"
                style={{ marginBottom: "20px" }}
              >
                ข้าพเจ้าขอรับรองว่า รายการที่แจ้งไว้ข้างต้นนี้
                เป็นรายการที่ถูกต้องและครบถ้วนทุกประการ
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div style={{ width: "60%", textAlign: "center" }}>
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>ลงชื่อ</span>
                    <DottedLineInput width="250px" />
                    <span style={{ marginLeft: "10px" }}>ผู้จ่ายเงิน</span>
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    ( <DottedLineInput width="250px" /> )
                  </div>
                  <div
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>ตำแหน่ง</span>
                    <DottedLineInput width="250px" />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                    }}
                  >
                    <span>ยื่นวันที่</span>
                    <DottedLineInput
                      text={currentDay}
                      width="40px"
                      align="center"
                    />
                    <span>เดือน</span>
                    <DottedLineInput
                      text={currentMonth}
                      width="100px"
                      align="center"
                    />
                    <span>พ.ศ.</span>
                    <DottedLineInput
                      text={currentYear}
                      width="60px"
                      align="center"
                    />
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: "20px",
                    bottom: "10px",
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
                      fontSize: "10px",
                      textAlign: "center",
                      backgroundColor: "white",
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
          </div>
          <div
            style={{ textAlign: "right", marginTop: "5px", fontSize: "12px" }}
          >
            (ก่อนกรอกรายการ ดูคำชี้แจงด้านหลัง)
          </div>
        </div>

        {/* Attachment Pages */}
        {employeePages.map((pageData, idx) => (
          <div key={idx} className="pnd-page page-attachment">
            <div style={{ marginBottom: "8px" }}>
              <div style={{ marginBottom: "5px" }}>
                <div className="font-bold" style={{ fontSize: "18px" }}>
                  ใบแนบ ภ.ง.ด.1
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "5px",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                  เลขประจำตัวผู้เสียภาษีอากร (ของผู้มีหน้าที่หักภาษี ณ ที่จ่าย)
                </span>
                <div
                  style={{
                    border: "1px solid #000",
                    padding: "2px 8px",
                    letterSpacing: "2px",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  {data.companyTaxId}
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "flex-end", gap: "10px" }}
              >
                <div
                  style={{
                    flex: 1,
                    border: "1px solid #000",
                    padding: "4px 8px",
                    backgroundColor: "#f5f5f5",
                    minHeight: "70px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "8px",
                        marginTop: "15px",
                        minWidth: "80px",
                      }}
                    >
                      ประเภทเงินได้
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "8px", marginBottom: "4px" }}>
                        (ให้ทำเครื่องหมาย "✓" ลงใน "□" ช่อง 1 ช่องใดช่องหนึ่ง)
                      </div>
                      <div style={{ display: "flex", gap: "15px" }}>
                        {/* Left Column */}
                        <div style={{ flex: 1, fontSize: "8px" }}>
                          <div style={{ marginBottom: "3px" }}>
                            <Checkbox
                              checked={true}
                              label="(1) เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ กรณีทั่วไป"
                              fontSize="8px"
                            />
                          </div>
                          <div style={{ marginBottom: "3px" }}>
                            <Checkbox
                              checked={false}
                              label="(2) เงินได้ตามมาตรา 40 (1) เงินเดือน ค่าจ้าง ฯลฯ ฯลฯ"
                              fontSize="8px"
                            />
                          </div>
                          <div
                            style={{
                              fontSize: "7px",
                              marginLeft: "18px",
                              marginBottom: "3px",
                            }}
                          >
                            กรณีได้รับอนุมัติจากกรมสรรพากรให้หักอัตราร้อยละ 3
                          </div>
                        </div>
                        {/* Right Column */}
                        <div style={{ flex: 1, fontSize: "8px" }}>
                          <div style={{ marginBottom: "3px" }}>
                            <Checkbox
                              checked={false}
                              label="(3) เงินได้ตามมาตรา 40 (1) (2) กรณีนายจ้างจ่ายให้ครั้งเดียวเพราะเหตุออกจากงาน"
                              fontSize="8px"
                            />
                          </div>
                          <div style={{ marginBottom: "3px" }}>
                            <Checkbox
                              checked={false}
                              label="(4) เงินได้ตามมาตรา 40 (2) กรณีผู้รับเงินได้เป็นผู้อยู่ในประเทศไทย"
                              fontSize="8px"
                            />
                          </div>
                          <div style={{ marginBottom: "3px" }}>
                            <Checkbox
                              checked={false}
                              label="(5) เงินได้ตามมาตรา 40 (2) กรณีผู้รับเงินได้มิได้เป็นผู้อยู่ในประเทศไทย"
                              fontSize="8px"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    minWidth: "120px",
                    height: "70px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "5px",
                    }}
                  >
                    <span>สาขาที่</span>
                    <div
                      style={{
                        border: "1px solid #000",
                        padding: "2px 10px",
                        fontWeight: "bold",
                      }}
                    >
                      00000
                    </div>
                  </div>
                  <div style={{ textAlign: "right", paddingBottom: "5px" }}>
                    แผ่นที่{" "}
                    <DottedLineInput
                      text={idx + 1}
                      width="25px"
                      align="center"
                    />{" "}
                    ในจำนวน{" "}
                    <DottedLineInput
                      text={totalPages}
                      width="25px"
                      align="center"
                    />{" "}
                    แผ่น
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <table className="pnd-table" style={{ fontSize: "11px" }}>
              <thead>
                <tr style={{ backgroundColor: "#ddd" }}>
                  <th
                    rowSpan={2}
                    style={{ width: "4%", fontSize: "10px" }}
                    className="text-center"
                  >
                    ลำดับที่
                  </th>
                  <th
                    style={{ width: "28%", fontSize: "10px" }}
                    className="text-center"
                  >
                    เลขประจำตัวผู้เสียภาษีอากร (13 หลัก) (ของผู้มีเงินได้)
                  </th>
                  <th
                    colSpan={3}
                    className="text-center"
                    style={{ fontSize: "10px" }}
                  >
                    รายละเอียดเกี่ยวกับการจ่ายเงิน
                  </th>
                  <th
                    colSpan={2}
                    rowSpan={2}
                    style={{ fontSize: "10px" }}
                    className="text-center"
                  >
                    จำนวนเงินภาษีที่หักและนำส่งในครั้งนี้
                  </th>
                  <th
                    rowSpan={2}
                    style={{ width: "4%", fontSize: "10px" }}
                    className="text-center"
                  >
                    เงื่อนไข*
                  </th>
                </tr>
                <tr style={{ backgroundColor: "#ddd" }}>
                  <th style={{ fontSize: "9px" }} className="text-center">
                    ชื่อผู้มีเงินได้ (ให้ระบุให้ชัดเจนว่าเป็น นาย นาง นางสาว
                    หรือยศ)
                  </th>
                  <th
                    style={{ width: "10%", fontSize: "10px" }}
                    className="text-center"
                  >
                    วัน เดือน ปี ที่จ่าย
                  </th>
                  <th
                    colSpan={2}
                    style={{ fontSize: "10px" }}
                    className="text-center"
                  >
                    จำนวนเงินที่จ่ายในครั้งนี้
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((emp) => {
                  const incomeInt = Math.floor(emp.incomeAmount);
                  const incomeDecimal = Math.round(
                    (emp.incomeAmount - incomeInt) * 100,
                  );
                  const taxInt = Math.floor(emp.taxAmount);
                  const taxDecimal = Math.round((emp.taxAmount - taxInt) * 100);

                  return (
                    <tr key={emp.sequence} style={{ height: "50px" }}>
                      <td className="text-center" style={{ fontSize: "11px" }}>
                        {emp.sequence}
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <div style={{ marginBottom: "4px" }}>
                          <div
                            style={{
                              border: "1px solid #000",
                              padding: "2px 6px",
                              display: "inline-block",
                              fontSize: "11px",
                              letterSpacing: "1px",
                              minWidth: "150px",
                              height: "16px",
                            }}
                          >
                            {emp.idNumber}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            borderBottom: "1px dotted #000",
                            paddingBottom: "2px",
                            height: "14px",
                          }}
                        >
                          ชื่อ {emp.titleName} {emp.firstName}{" "}
                          &nbsp;&nbsp;&nbsp; ชื่อสกุล {emp.lastName}
                        </div>
                      </td>
                      <td style={{ padding: "4px", textAlign: "center" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "10px",
                            paddingBottom: "2px",
                          }}
                        >
                          {emp.paymentDate}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "4px",
                          width: "9%",
                          textAlign: "right",
                        }}
                      >
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "11px",
                            paddingBottom: "2px",
                            paddingRight: "3px",
                          }}
                        >
                          {incomeInt.toLocaleString()}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "4px",
                          width: "4%",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "11px",
                            paddingBottom: "2px",
                          }}
                        >
                          {String(incomeDecimal).padStart(2, "0")}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "4px",
                          width: "9%",
                          textAlign: "right",
                        }}
                      >
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "11px",
                            paddingBottom: "2px",
                            paddingRight: "3px",
                          }}
                        >
                          {taxInt.toLocaleString()}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "4px",
                          width: "4%",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "11px",
                            paddingBottom: "2px",
                          }}
                        >
                          {String(taxDecimal).padStart(2, "0")}
                        </div>
                      </td>
                      <td style={{ padding: "4px", textAlign: "center" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            fontSize: "11px",
                            paddingBottom: "2px",
                          }}
                        >
                          1
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {Array.from({ length: employeesPerPage - pageData.length }).map(
                  (_, i) => (
                    <tr key={`empty-${i}`} style={{ height: "50px" }}>
                      <td className="text-center" style={{ fontSize: "11px" }}>
                        {pageData.length + i + 1 + idx * employeesPerPage}
                      </td>
                      <td style={{ padding: "4px 6px" }}>
                        <div style={{ marginBottom: "4px" }}>
                          <div
                            style={{
                              border: "1px solid #000",
                              padding: "2px 6px",
                              display: "inline-block",
                              minWidth: "150px",
                              height: "16px",
                            }}
                          ></div>
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        >
                          ชื่อ &nbsp;&nbsp;&nbsp; ชื่อสกุล
                        </div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                      <td style={{ padding: "4px" }}>
                        <div style={{ height: "20px" }}></div>
                        <div
                          style={{
                            borderBottom: "1px dotted #000",
                            height: "14px",
                          }}
                        ></div>
                      </td>
                    </tr>
                  ),
                )}
                <tr style={{ height: "30px" }}>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: "right",
                      fontSize: "10px",
                      paddingRight: "8px",
                    }}
                  >
                    รวมยอดเงินได้และภาษีที่นำส่ง (
                    <span style={{ fontStyle: "italic" }}>นำไปรวมกับ</span>{" "}
                    <span style={{ fontWeight: "bold" }}>ใบแนบ ภ.ง.ด.1</span>{" "}
                    <span style={{ fontStyle: "italic" }}>
                      แผ่นอื่น (ถ้ามี)
                    </span>
                    )
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontSize: "11px",
                      padding: "4px",
                      paddingRight: "3px",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #000",
                        paddingBottom: "2px",
                      }}
                    >
                      {Math.floor(
                        pageData.reduce((s, e) => s + e.incomeAmount, 0),
                      ).toLocaleString()}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: "11px",
                      padding: "4px",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #000",
                        paddingBottom: "2px",
                      }}
                    >
                      {String(
                        Math.round(
                          (pageData.reduce((s, e) => s + e.incomeAmount, 0) -
                            Math.floor(
                              pageData.reduce((s, e) => s + e.incomeAmount, 0),
                            )) *
                            100,
                        ),
                      ).padStart(2, "0")}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontSize: "11px",
                      padding: "4px",
                      paddingRight: "3px",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #000",
                        paddingBottom: "2px",
                      }}
                    >
                      {Math.floor(
                        pageData.reduce((s, e) => s + e.taxAmount, 0),
                      ).toLocaleString()}
                    </div>
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontSize: "11px",
                      padding: "4px",
                    }}
                  >
                    <div
                      style={{
                        borderBottom: "1px dotted #000",
                        paddingBottom: "2px",
                      }}
                    >
                      {String(
                        Math.round(
                          (pageData.reduce((s, e) => s + e.taxAmount, 0) -
                            Math.floor(
                              pageData.reduce((s, e) => s + e.taxAmount, 0),
                            )) *
                            100,
                        ),
                      ).padStart(2, "0")}
                    </div>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                border: "1px solid #000",
                backgroundColor: "#eee",
                display: "flex",
                fontSize: "10px",
                minHeight: "60px",
                marginTop: "-1px",
              }}
            >
              <div
                style={{
                  width: "55%",
                  padding: "4px 8px",
                  borderRight: "1px solid #000",
                }}
              >
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: "9px",
                    marginBottom: "2px",
                  }}
                >
                  (ให้กรอกลำดับที่ต่อเนื่องกันไปทุกแผ่น)
                </div>
                <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
                  หมายเหตุ * เงื่อนไขการหักภาษี ให้กรอกดังนี้
                </div>
                <div style={{ marginLeft: "15px", fontSize: "9px" }}>
                  <div>
                    ■ หัก ณ ที่จ่าย{" "}
                    <span style={{ marginLeft: "30px" }}>กรอก 1</span>
                  </div>
                  <div>
                    ■ ออกให้ตลอดไป{" "}
                    <span style={{ marginLeft: "20px" }}>กรอก 2</span>
                  </div>
                  <div>
                    ■ ออกให้ครั้งเดียว{" "}
                    <span style={{ marginLeft: "20px" }}>กรอก 3</span>
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "45%",
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      border: "1px solid #000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "8px",
                      textAlign: "center",
                    }}
                  >
                    ประทับตรา
                    <br />
                    นิติบุคคล
                    <br />
                    (ถ้ามี)
                  </div>
                </div>
                <div style={{ flex: 1, fontSize: "9px" }}>
                  <div
                    style={{
                      marginBottom: "3px",
                      borderBottom: "1px dotted #000",
                      paddingBottom: "1px",
                    }}
                  >
                    ลงชื่อ...................................................ผู้จ่ายเงิน
                  </div>
                  <div
                    style={{
                      marginBottom: "3px",
                      borderBottom: "1px dotted #000",
                      paddingBottom: "1px",
                      textAlign: "center",
                    }}
                  >
                    (...................................................)
                  </div>
                  <div
                    style={{
                      marginBottom: "3px",
                      borderBottom: "1px dotted #000",
                      paddingBottom: "1px",
                    }}
                  >
                    ตำแหน่ง.......................................................
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "9px",
                    }}
                  >
                    <span>ยื่นวันที่</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        margin: "0 2px",
                        minWidth: "15px",
                        textAlign: "center",
                      }}
                    >
                      {currentDay}
                    </span>
                    <span>เดือน</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        margin: "0 2px",
                        minWidth: "50px",
                        textAlign: "center",
                      }}
                    >
                      {currentMonth}
                    </span>
                    <span>พ.ศ.</span>
                    <span
                      style={{
                        borderBottom: "1px dotted #000",
                        margin: "0 2px",
                        minWidth: "30px",
                        textAlign: "center",
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

PND1Preview.displayName = "PND1Preview";

export default PND1Preview;
