"use client";

import React, { forwardRef } from "react";
import { WithholdingCertData } from "@/types/documents";
import { formatCurrency } from "@/utils/formatters";

interface WithholdingCertPreviewProps {
  data: WithholdingCertData;
}

// --- Helper Function: แปลงตัวเลขเป็นบาทถ้วน ---
const thaiBahtToText = (amount: number): string => {
  if (isNaN(amount)) return "";

  const numStr = amount.toFixed(2);
  const [bahtStr, satangStr] = numStr.split(".");
  const thaiNum = [
    "ศูนย์",
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
  const unit = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  const convert = (n: string): string => {
    let text = "";
    const len = n.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(n[i]);
      const pos = len - i - 1;
      const unitIndex = pos % 6;

      if (digit !== 0) {
        if (pos > 0 && pos % 6 === 0 && len > 7) text += "ล้าน";

        if (unitIndex === 0 && digit === 1 && len > 1) {
          text += "เอ็ด";
        } else if (unitIndex === 1 && digit === 2) {
          text += "ยี่";
        } else if (unitIndex === 1 && digit === 1) {
          text += "";
        } else {
          text += thaiNum[digit];
        }
        text += unit[unitIndex];
      } else if (pos > 0 && pos % 6 === 0 && len > 7) {
        text += "ล้าน";
      }
    }
    return text;
  };

  let text = "";
  if (Number(bahtStr) === 0) text += "ศูนย์บาท";
  else text += convert(bahtStr) + "บาท";

  if (Number(satangStr) === 0) {
    text += "ถ้วน";
  } else {
    let satangText = "";
    const sLen = satangStr.length;
    for (let i = 0; i < sLen; i++) {
      const digit = parseInt(satangStr[i]);
      const pos = sLen - i - 1;
      if (digit !== 0) {
        if (
          pos === 0 &&
          digit === 1 &&
          sLen > 1 &&
          parseInt(satangStr[0]) !== 0
        )
          satangText += "เอ็ด";
        else if (pos === 1 && digit === 2) satangText += "ยี่";
        else if (pos === 1 && digit === 1) satangText += "";
        else satangText += thaiNum[digit];
        satangText += pos === 1 ? "สิบ" : "";
      }
    }
    text += satangText + "สตางค์";
  }

  return text;
};

const WithholdingCertPreview = forwardRef<
  HTMLDivElement,
  WithholdingCertPreviewProps
>(({ data }, ref) => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear() + 543;

  const getDigits = (text: string) => {
    const clean = text?.replace(/[^0-9]/g, "") || "";
    const digits = clean.split("");
    while (digits.length < 13) digits.push("");
    return digits;
  };

  const companyTaxId = getDigits(data.companyTaxId);
  const employeeTaxId = getDigits(data.employee.idNumber);
  const income401 = data.incomeDetails.find((d) => d.incomeType === "40(1)");

  // --- Styles สำหรับจัดกึ่งกลาง ---
  const s = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      backgroundColor: "#f5f5f5",
    },
    page: {
      width: "200mm",
      minHeight: "287mm",
      padding: "8mm 10mm",
      backgroundColor: "#fff",
      fontFamily: '"TH Sarabun New", "Sarabun", sans-serif',
      color: "#000",
      boxSizing: "border-box" as const,
      fontSize: "13pt",
      lineHeight: "1.15",
      margin: "0 auto",
    },
    mainBox: {
      border: "1.5pt solid #000",
      borderRadius: "10px",
      overflow: "hidden",
      marginTop: "1mm",
    },
    hLine: { borderBottom: "1pt solid #000" },
    dottedWrapper: {
      display: "inline-flex",
      flexDirection: "column" as const,
      justifyContent: "flex-end",
      position: "relative" as const,
      height: "20px",
      marginBottom: "-2px",
      paddingLeft: "5px",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    dottedText: {
      display: "block",
      position: "absolute" as const,
      top: "0",
      left: "5px",
      right: "0",
      lineHeight: "1",
    },
    dottedLine: {
      position: "absolute" as const,
      bottom: "0",
      left: "0",
      right: "0",
      borderBottom: "1px dotted #000",
    },
    taxBox: {
      width: "15px",
      height: "18px",
      border: "1pt solid #000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "13pt",
      lineHeight: "1",
      backgroundColor: "#fff",
      marginLeft: "-1px",
    },
    checkBox: {
      width: "12px",
      height: "12px",
      border: "1pt solid #000",
      display: "inline-block",
      marginRight: "4px",
      position: "relative" as const,
      top: "-2px",
      backgroundColor: "#fff",
    },
    smallNote: {
      fontSize: "8.5pt",
      color: "#333",
      marginLeft: "35px",
      marginTop: "0px",
      lineHeight: "1",
    },
    headerCell: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      borderRight: "1pt solid #000",
      height: "38px",
      fontSize: "12pt",
    },
    totalWordRow: {
      borderTop: "none",
      borderBottom: "1pt solid #000",
      padding: "2px 5px",
      fontSize: "12pt",
      fontWeight: "bold" as const,
      height: "22px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fff",
    },
  };

  const RenderTaxID = ({ digits }: { digits: string[] }) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "5px" }}>
      <div style={s.taxBox}>{digits[0]}</div>
      <div style={{ display: "flex" }}>
        {digits.slice(1, 5).map((d, i) => (
          <div key={i} style={s.taxBox}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        {digits.slice(5, 10).map((d, i) => (
          <div key={i} style={s.taxBox}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        {digits.slice(10, 12).map((d, i) => (
          <div key={i} style={s.taxBox}>
            {d}
          </div>
        ))}
      </div>
      <div style={s.taxBox}>{digits[12]}</div>
    </div>
  );

  const CheckboxItem = ({ label, checked, style }: any) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: "5px",
        ...style,
      }}
    >
      <div style={s.checkBox}>
        {checked && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              left: "0px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            ✓
          </div>
        )}
      </div>
      <span style={{ fontSize: "12pt", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );

  const DottedField = ({
    children,
    style,
  }: {
    children?: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div style={{ ...s.dottedWrapper, ...style }}>
      <span style={s.dottedText}>{children}</span>
      <span style={s.dottedLine} />
    </div>
  );

  const tableRowCount = 17;

  return (
    <div ref={ref} style={s.page}>
      <style>
        {`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>

      {/* Header */}
      <div
        style={{
          fontSize: "8.5pt",
          position: "relative",
          marginTop: "0",
          marginBottom: "2mm",
          lineHeight: "1.1",
        }}
      >
        <div>
          <strong>ฉบับที่ 1</strong> (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย
          ใช้แนบพร้อมกับแบบแสดงรายการภาษี)
        </div>
        <div>
          <strong>ฉบับที่ 2</strong> (สำหรับผู้ถูกหักภาษี ณ ที่จ่าย
          เก็บไว้เป็นหลักฐาน)
        </div>
      </div>

      <div
        style={{
          position: "relative",
          marginBottom: "1.5mm",
        }}
      >
        {/* หัวข้อ - อยู่กึ่งกลางกระดาษ */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{ fontSize: "18pt", fontWeight: "bold", lineHeight: "1.1" }}
          >
            หนังสือรับรองการหักภาษี ณ ที่จ่าย
          </div>
          <div
            style={{ fontSize: "13pt", fontWeight: "bold", lineHeight: "1.1" }}
          >
            ตามมาตรา 50 ทวิ แห่งประมวลรัษฎากร
          </div>
        </div>

        {/* เล่มที่/เลขที่ - อยู่มุมขวา */}
        <div
          style={{
            fontSize: "10pt",
            position: "absolute",
            right: "0",
            top: "0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              marginBottom: "2px",
            }}
          >
            <span
              style={{ width: "35px", textAlign: "right", marginRight: "5px" }}
            >
              เล่มที่
            </span>
            <div
              style={{
                borderBottom: "1px dotted #000",
                width: "70px",
                textAlign: "center",
              }}
            >
              &nbsp;
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span
              style={{ width: "35px", textAlign: "right", marginRight: "5px" }}
            >
              เลขที่
            </span>
            <div
              style={{
                borderBottom: "1px dotted #000",
                width: "70px",
                textAlign: "center",
                fontSize: "10pt",
              }}
            >
              {data.docRunNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Main Box */}
      <div style={s.mainBox}>
        {/* Payer Section */}
        <div style={{ ...s.hLine, padding: "4px 8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "13pt" }}>
              ผู้มีหน้าที่หักภาษี ณ ที่จ่าย : -
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "11pt", marginRight: "5px" }}>
                เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)*
              </span>
              <RenderTaxID digits={companyTaxId} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: "1px",
            }}
          >
            <span style={{ minWidth: "20px" }}>ชื่อ</span>
            <DottedField style={{ flex: 1 }}>{data.companyName}</DottedField>
          </div>
          <div style={s.smallNote}>
            (ให้ระบุว่าเป็น บุคคล นิติบุคคล บริษัท สมาคม หรือคณะบุคคล)
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: "1px",
            }}
          >
            <span style={{ minWidth: "25px" }}>ที่อยู่</span>
            <DottedField style={{ flex: 1 }}>{data.companyAddress}</DottedField>
          </div>
          <div style={s.smallNote}>
            (ให้ระบุ ชื่ออาคาร/หมู่บ้าน ห้องเลขที่ ชั้นที่ เลขที่ ตรอก/ซอย
            หมู่ที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด)
          </div>
        </div>

        {/* Payee Section */}
        <div style={{ padding: "4px 8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "13pt" }}>
              ผู้ถูกหักภาษี ณ ที่จ่าย : -
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: "11pt", marginRight: "5px" }}>
                เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)*
              </span>
              <RenderTaxID digits={employeeTaxId} />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: "1px",
            }}
          >
            <span style={{ minWidth: "20px" }}>ชื่อ</span>
            <DottedField style={{ flex: 1 }}>
              {data.employee.titleName} {data.employee.firstName}{" "}
              {data.employee.lastName}
            </DottedField>
          </div>
          <div style={s.smallNote}>
            (ให้ระบุว่าเป็น บุคคล นิติบุคคล บริษัท สมาคม หรือคณะบุคคล)
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginTop: "1px",
            }}
          >
            <span style={{ minWidth: "25px" }}>ที่อยู่</span>
            <DottedField style={{ flex: 1 }}>
              {data.employee.address}
            </DottedField>
          </div>
          <div style={s.smallNote}>
            (ให้ระบุ ชื่ออาคาร/หมู่บ้าน ห้องเลขที่ ชั้นที่ เลขที่ ตรอก/ซอย
            หมู่ที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด)
          </div>
        </div>

        {/* Form Sequence */}
        <div style={{ ...s.hLine, padding: "3px 8px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginRight: "10px",
                marginTop: "2px",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ marginRight: "5px", fontWeight: "bold" }}>
                ลำดับที่
              </div>
              <div
                style={{
                  width: "45px",
                  height: "18px",
                  border: "1pt solid #000",
                  textAlign: "center",
                  marginRight: "5px",
                }}
              >
                &nbsp;
              </div>
              <div>ในแบบ</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "2px",
                }}
              >
                <CheckboxItem
                  label="(1) ภ.ง.ด.1ก"
                  checked={data.formType === "1kor"}
                  style={{ width: "auto" }}
                />
                <CheckboxItem
                  label="(2) ภ.ง.ด.1ก พิเศษ"
                  style={{ width: "auto" }}
                />
                <CheckboxItem label="(3) ภ.ง.ด.2" style={{ width: "auto" }} />
                <CheckboxItem label="(4) ภ.ง.ด.3" style={{ width: "auto" }} />
                <CheckboxItem label="(5) ภ.ง.ด.2ก" style={{ width: "auto" }} />
                <CheckboxItem
                  label="(6) ภ.ง.ด.3ก"
                  style={{ width: "auto", marginRight: 0 }}
                />
              </div>
              <div style={{ display: "flex" }}>
                <CheckboxItem
                  label="(7) ภ.ง.ด.53"
                  checked={data.formType === "53"}
                  style={{ width: "auto" }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "8.5pt",
              color: "#333",
              marginTop: "1px",
              lineHeight: "1",
              paddingLeft: "65px",
            }}
          >
            (ให้สามารถอ้างอิงหรือสอบยันกันได้ระหว่างลำดับที่ตามหนังสือรับรองฯ
            กับแบบยื่นรายการภาษีหักที่จ่าย)
          </div>
        </div>

        {/* Table Header */}
        <div style={{ ...s.hLine, display: "flex", backgroundColor: "#fff" }}>
          <div style={{ width: "60%", ...s.headerCell }}>
            ประเภทเงินได้พึงประเมินที่จ่าย
          </div>
          <div
            style={{
              width: "15%",
              ...s.headerCell,
              flexDirection: "column",
              fontSize: "11pt",
              lineHeight: "1.1",
            }}
          >
            <div>วัน เดือน</div>
            <div>หรือปีภาษี ที่จ่าย</div>
          </div>
          <div style={{ width: "13%", ...s.headerCell }}>จำนวนเงินที่จ่าย</div>
          <div
            style={{
              width: "12%",
              ...s.headerCell,
              borderRight: "none",
              flexDirection: "column",
              fontSize: "11pt",
              lineHeight: "1.1",
            }}
          >
            <div>ภาษีที่หัก</div>
            <div>และนำส่งไว้</div>
          </div>
        </div>

        {/* Table Body */}
        <div style={{ display: "flex", position: "relative" }}>
          <div
            style={{
              width: "60%",
              borderRight: "1pt solid #000",
              padding: "3px 5px",
              fontSize: "11pt",
              lineHeight: "1.2",
            }}
          >
            <div>
              1. เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตามมาตรา 40 (1)
            </div>
            <div>2. ค่าธรรมเนียม ค่านายหน้า ฯลฯ ตามมาตรา 40 (2)</div>
            <div>3. ค่าแห่งลิขสิทธิ์ ฯลฯ ตามมาตรา 40 (3)</div>

            <div style={{ display: "flex" }}>
              <div style={{ width: "15px" }}>4.</div>
              <div>(ก) ดอกเบี้ย ฯลฯ ตามมาตรา 40 (4) (ก)</div>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ width: "15px" }}></div>
              <div>(ข) เงินปันผล เงินส่วนแบ่งกำไร ฯลฯ ตามมาตรา 40 (4) (ข)</div>
            </div>

            <div style={{ paddingLeft: "30px" }}>
              (1) กรณีผู้ได้รับเงินปันผลได้รับเครดิตภาษี โดยจ่ายจาก
            </div>
            <div style={{ paddingLeft: "42px" }}>
              กำไรสุทธิของกิจการที่ต้องเสียภาษีเงินได้นิติบุคคลในอัตราดังนี้
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (1.1) อัตราร้อยละ 30 ของกำไรสุทธิ
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (1.2) อัตราร้อยละ 25 ของกำไรสุทธิ
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (1.3) อัตราร้อยละ 20 ของกำไรสุทธิ
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (1.4) อัตราอื่นๆ (ระบุ)...................ของกำไรสุทธิ
            </div>
            <div style={{ paddingLeft: "30px" }}>
              (2) กรณีผู้ได้รับเงินปันผลไม่ได้รับเครดิตภาษี เนื่องจากจ่ายจาก
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (2.1) กำไรสุทธิของกิจการที่ได้รับยกเว้นภาษีเงินได้นิติบุคคล
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (2.2)
              เงินปันผลหรือเงินส่วนแบ่งของกำไรที่ได้รับยกเว้นไม่ต้องนำมารวม
            </div>
            <div style={{ paddingLeft: "60px" }}>
              คำนวณเป็นรายได้เพื่อเสียภาษีเงินได้นิติบุคคล
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (2.3) กำไรสุทธิส่วนที่ได้หักผลขาดทุนสุทธิยกมาไม่เกิน 5 ปี
            </div>
            <div style={{ paddingLeft: "60px" }}>
              ก่อนรอบระยะเวลาบัญชีปีปัจจุบัน
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (2.4) กำไรที่รับรู้ทางบัญชีโดยวิธีส่วนได้เสีย (equity method)
            </div>
            <div style={{ paddingLeft: "42px" }}>
              (2.5) อื่น ๆ
              (ระบุ)....................................................
            </div>
            <div>
              5. การจ่ายเงินได้ที่ต้องหักภาษี ณ ที่จ่าย
              ตามคำสั่งกรมสรรพากรที่ออกตามมาตรา
            </div>
            <div style={{ paddingLeft: "12px" }}>
              3 เตรส เช่น รางวัล ส่วนลดหรือประโยชน์ใด ๆ
              เนื่องจากการส่งเสริมการขาย รางวัล
            </div>
            <div style={{ paddingLeft: "12px" }}>
              ในการประกวด การแข่งขัน การชิงโชค ค่าแสดงของนักแสดงสาธารณะ ค่าจ้าง
            </div>
            <div style={{ paddingLeft: "12px" }}>
              ทำของ ค่าโฆษณา ค่าเช่า ค่าขนส่ง ค่าบริการ ค่าเบี้ยประกันวินาศภัย
              ฯลฯ
            </div>

            <div style={{ marginTop: "6px" }}>
              6. อื่น ๆ (ระบุ)
              ...........................................................................................................
            </div>
          </div>

          <div
            style={{ width: "40%", display: "flex", flexDirection: "column" }}
          >
            {Array.from({ length: tableRowCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flex: 1,
                  borderBottom: "1px dotted #ccc",
                  minHeight: "19px",
                }}
              >
                <div
                  style={{
                    width: "37.5%",
                    borderRight: "1pt solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11pt",
                  }}
                >
                  {i === 0 && income401?.paymentDate}
                </div>
                <div
                  style={{
                    width: "32.5%",
                    borderRight: "1pt solid #000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "5px",
                    fontSize: "11pt",
                  }}
                >
                  {i === 0 &&
                    income401?.totalIncome &&
                    formatCurrency(income401.totalIncome)}
                </div>
                <div
                  style={{
                    width: "30%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "5px",
                    fontSize: "11pt",
                  }}
                >
                  {i === 0 &&
                    income401?.totalTax &&
                    formatCurrency(income401.totalTax)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Row */}
        <div
          style={{
            display: "flex",
            height: "28px",
            borderTop: "1pt solid #000",
            fontSize: "12pt",
            fontWeight: "bold",
          }}
        >
          <div
            style={{
              width: "75%",
              borderRight: "1pt solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "10px",
            }}
          >
            รวมเงินที่จ่ายและภาษีที่หักนำส่ง
          </div>
          <div
            style={{
              width: "13%",
              borderRight: "1pt solid #000",
              borderBottom: "1pt solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "5px",
            }}
          >
            {formatCurrency(data.grandTotalIncome)}
          </div>
          <div
            style={{
              width: "12%",
              borderBottom: "1pt solid #000",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: "5px",
            }}
          >
            {formatCurrency(data.grandTotalTax)}
          </div>
        </div>

        {/* Total Words Row */}
        <div style={s.totalWordRow}>
          <span style={{ whiteSpace: "nowrap" }}>
            รวมเงินภาษีที่หักนำส่ง (ตัวอักษร)
          </span>
          <span
            style={{
              marginLeft: "10px",
              border: "none",
              textDecoration: "none",
            }}
          >
            ({thaiBahtToText(data.grandTotalTax)})
          </span>
        </div>

        {/* Footer */}
        <div style={{ padding: "4px 8px 0 8px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9.5pt",
              marginBottom: "3px",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              เงินที่จ่ายเข้า กบข./กสจ./กองทุนสงเคราะห์ครูโรงเรียนเอกชน{" "}
              <span
                style={{
                  borderBottom: "1px dotted #000",
                  width: "45px",
                  textAlign: "right",
                  margin: "0 3px",
                }}
              ></span>{" "}
              บาท
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              กองทุนประกันสังคม{" "}
              <span
                style={{
                  borderBottom: "1px dotted #000",
                  width: "45px",
                  textAlign: "right",
                  margin: "0 3px",
                }}
              ></span>{" "}
              บาท
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              กองทุนสำรองเลี้ยงชีพ{" "}
              <span
                style={{
                  borderBottom: "1px dotted #000",
                  width: "45px",
                  textAlign: "right",
                  margin: "0 3px",
                }}
              ></span>{" "}
              บาท
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11pt",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginRight: "10px",
                border: "1pt solid #000",
                padding: "1px 5px",
                fontSize: "10pt",
              }}
            >
              ผู้จ่ายเงิน
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <CheckboxItem
                label="(1) หัก ณ ที่จ่าย"
                checked={true}
                style={{ width: "auto" }}
              />
              <CheckboxItem
                label="(2) ออกให้ตลอดไป"
                style={{ width: "auto" }}
              />
              <CheckboxItem
                label="(3) ออกให้ครั้งเดียว"
                style={{ width: "auto" }}
              />
              <CheckboxItem
                label="(4) อื่น ๆ (ระบุ)................"
                style={{ width: "auto" }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              borderTop: "1pt solid #000",
              margin: "0 -8px",
            }}
          >
            <div
              style={{
                width: "42%",
                padding: "5px 8px",
                borderRight: "1pt solid #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "9pt",
                  textAlign: "center",
                  lineHeight: "1.15",
                }}
              >
                <span style={{ fontWeight: "bold" }}>คำเตือน</span>{" "}
                ผู้มีหน้าที่ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย <br />
                ฝ่าฝืนไม่ปฏิบัติตามมาตรา 50 ทวิ แห่งประมวล <br />
                รัษฎากร ต้องรับโทษทางอาญาตามมาตรา 35 <br />
                แห่งประมวลรัษฎากร
              </div>
            </div>

            <div
              style={{
                width: "58%",
                padding: "3px 8px",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{ fontSize: "9.5pt" }}>
                ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงกับความจริงทุกประการ
              </div>

              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontSize: "11pt" }}>ลงชื่อ</span>
                <div
                  style={{
                    borderBottom: "1px dotted #000",
                    width: "120px",
                    margin: "0 6px",
                  }}
                ></div>
                <span style={{ fontSize: "11pt" }}>ผู้จ่ายเงิน</span>
              </div>

              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "baseline",
                  fontSize: "10pt",
                }}
              >
                <div
                  style={{
                    borderBottom: "1px dotted #000",
                    width: "35px",
                    textAlign: "center",
                  }}
                >
                  {currentDay}
                </div>
                <span style={{ margin: "0 4px" }}>/</span>
                <div
                  style={{
                    borderBottom: "1px dotted #000",
                    width: "35px",
                    textAlign: "center",
                  }}
                >
                  {currentMonth}
                </div>
                <span style={{ margin: "0 4px" }}>/</span>
                <div
                  style={{
                    borderBottom: "1px dotted #000",
                    width: "45px",
                    textAlign: "center",
                  }}
                >
                  {currentYear}
                </div>
              </div>
              <div style={{ fontSize: "8.5pt", marginTop: "1px" }}>
                (วัน เดือน ปี ที่ออกหนังสือรับรองฯ)
              </div>

              {/* Stamp */}
              <div
                style={{
                  position: "absolute",
                  right: "8px",
                  bottom: "4px",
                  width: "44px",
                  height: "44px",
                  border: "1.5pt solid #000",
                  borderRadius: "50%",
                  fontSize: "7.5pt",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  lineHeight: "1.05",
                }}
              >
                <div>ประทับตรา</div>
                <div>นิติบุคคล</div>
                <div>(ถ้ามี)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footnotes */}
      <div
        style={{
          display: "flex",
          fontSize: "8.5pt",
          marginTop: "1mm",
          lineHeight: "1.2",
          alignItems: "flex-start",
        }}
      >
        <div style={{ whiteSpace: "nowrap", marginRight: "5px" }}>
          <strong>หมายเหตุ</strong> เลขประจำตัวผู้เสียภาษีอากร (13 หลัก)*
          หมายถึง
        </div>
        <div>
          <div>
            1. กรณีบุคคลธรรมดาไทย ให้ใช้เลขประจำตัวประชาชนของกรมการปกครอง
          </div>
          <div>
            2. กรณีนิติบุคคล ให้ใช้เลขทะเบียนนิติบุคคลของกรมพัฒนาธุรกิจการค้า
          </div>
          <div>
            3. กรณีอื่น ๆ นอกเหนือจาก 1. และ 2. ให้ใช้เลขประจำตัวผู้เสียภาษีอากร
            (13 หลัก) ของกรมสรรพากร
          </div>
        </div>
      </div>
    </div>
  );
});

WithholdingCertPreview.displayName = "WithholdingCertPreview";

export default WithholdingCertPreview;
