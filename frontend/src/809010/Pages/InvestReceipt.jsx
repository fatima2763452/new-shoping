// src/Pages/InvestReceipt.jsx
import React, { useRef } from "react";
// import BASE64_PLACEHOLDER from "./base64";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import NavBar from "../Components/NavBar";
import { imgAndSign } from "./data.js";

// import React, { useRef } from 'react';
// import { useLocation } from 'react-router-dom';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import NavBar from '../Components/NavBar';


function InvestReceipt() {
  const location = useLocation();

  const {
    companyName,
    customerName = "",
    fatherName,
    dob,
    gender,
    mobileNumber,
    email,
    aadhaar,
    address,
    initialDeposit,
    applicationDate,
    photo
  } = location.state || {};

  const firstName = (customerName || "").split(" ")[0] || "";
  const lastName = (customerName || "").split(" ")[1] || "";

  const receiptRef = useRef();

  const handleDownloadPDF = async () => {
    try {
      const btn = document.querySelector(".no-print");
      if (btn) btn.style.visibility = "hidden";

      // Create canvas image of the visible form first
      const element = receiptRef.current;
      const originalWidth = element.style.width;
      element.style.width = "595px"; // A4 width in pt approximation for canvas -> keeps proportions

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // Create PDF
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const usableWidth = pageWidth - margin * 2;

      // Add the captured form image at top
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);

      // Now add the embedded font (Base64) for Hindi — placeholder below
      // (Hindi embedded-font support removed) — PDF will include English Terms only.

      // Start a new page for Terms & Conditions and set initial y
      pdf.addPage();
      let y = margin;

      // Helper to ensure there's room on current page, otherwise add a page and reset y
      const ensureSpace = (requiredHeight) => {
        if (y + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // Write company header for T&C pages (blue, slightly larger, left-aligned)
      pdf.setTextColor(0, 102, 204); // professional blue
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("RADHE BROCKRAGE HOUSE PVT. LTD", margin, y);
      y += 26;
      // reset text color and font for body
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);

      // Helper to write content but treat numbered headings (e.g., "1. Introduction") as bold
      const writeTermsContent = (title, content) => {
        // Section title (big/bold)
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(13);
        const titleLines = pdf.splitTextToSize(title, usableWidth);
        ensureSpace(titleLines.length * 16 + 6);
        pdf.text(titleLines, margin, y);
        y += titleLines.length * 16 + 8;

        // Body: split into paragraphs separated by double newlines
        const paragraphs = content.split("\n\n");
        for (const para of paragraphs) {
          if (!para || !para.trim()) continue;
          // If paragraph starts with numbered heading (e.g., "1. Introduction"), split it
          const lines = para.split("\n");
          const firstLine = lines[0].trim();
          const headingMatch = firstLine.match(/^\d+\.\s+.+/);
          if (headingMatch) {
            // Render the heading bold
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            const headingLines = pdf.splitTextToSize(firstLine, usableWidth);
            ensureSpace(headingLines.length * 16 + 4);
            pdf.text(headingLines, margin, y);
            y += headingLines.length * 16 + 4;

            // Render remaining lines of paragraph as normal text
            const rest = lines.slice(1).join("\n");
            if (rest && rest.trim()) {
              pdf.setFont("helvetica", "normal");
              pdf.setFontSize(11);
              const restLines = pdf.splitTextToSize(rest, usableWidth);
              for (let i = 0; i < restLines.length;) {
                const maxLines = Math.floor((pageHeight - margin - y) / 14);
                if (maxLines <= 0) {
                  pdf.addPage();
                  y = margin;
                }
                const chunk = restLines.slice(0, maxLines);
                pdf.text(chunk, margin, y);
                y += chunk.length * 14 + 4;
                restLines.splice(0, chunk.length);
              }
            }
          } else {
            // Regular paragraph
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(11);
            const paraLines = pdf.splitTextToSize(para, usableWidth);
            for (let i = 0; i < paraLines.length;) {
              const maxLines = Math.floor((pageHeight - margin - y) / 14);
              if (maxLines <= 0) {
                pdf.addPage();
                y = margin;
              }
              const chunk = paraLines.slice(0, maxLines);
              pdf.text(chunk, margin, y);
              y += chunk.length * 14 + 4;
              paraLines.splice(0, chunk.length);
            }
          }
        }

        // small gap after section
        y += 8;
      };

      // ------------------ Full English Terms (as provided) ------------------
      const englishSections = [
        {
          title: "Terms & Conditions",
          content:
            `1. Introduction\nThese Terms & Conditions (“Terms”) govern all trading, investment, advisory, and related services provided by our Private Brokerage House (“Broker”, “We”, “Us”). By opening an account or making any trade through us, the client (“You”, “Client”, “Investor”) agrees to abide by these Terms.\n\n` +
            `2. Account Opening & Verification\nThe Client must provide valid KYC documents such as ID proof, address proof, and bank details.\nThe Broker reserves the right to approve or reject any account without specifying a reason.\nAll information provided by the Client must be accurate and updated. Any false information may lead to account suspension.\n\n` +
            `3. Trading Authorization\nBy using our services, the Client authorizes the Broker to execute buy/sell trades on their behalf as instructed.\nThe Broker may refuse or delay any transaction due to technical issues, market volatility, or regulatory reasons.\nMisuse of trading instructions or unauthorized activities can lead to termination of services.\n\n` +
            `4. Brokerage & Charges\nBrokerage will be charged as per the agreed rate between the Broker and the Client.\nGST, STT, exchange fees, and other statutory charges will be applied as per government regulations.\nBrokerage rates may change with prior notice to the Client.\n\n` +
            `5. Payments, Payouts & Settlements\nThe Client must maintain sufficient balance before placing any order.\nPayouts will be processed only into the verified bank account.\nThe Broker is not responsible for delays caused by banks, payment gateways, or technical issues.\n\n` +
            `6. Risk Disclosure\nTrading in equities, derivatives, and other financial instruments involves market risk.\nThe Client understands that losses may exceed profits and accepts full responsibility for their trading decisions.\nThe Broker does not guarantee profits or returns in any form.\n\n` +
            `7. Advisory Disclaimer\nAny advice, suggestion, or view shared by the Broker is only for informational purposes.\nThe Client must evaluate risks independently before making decisions.\nThe Broker shall not be held liable for any financial loss due to market movements.\n\n` +
            `8. Confidentiality & Data Protection\nClient information will be kept confidential and used only for service purposes.\nThe Broker may share data with regulators or authorities if legally required.\nThe Client must keep their login credentials secure.\n\n` +
            `9. Termination of Services\nEither party may terminate the account with written notice.\nThe Broker may immediately terminate services if fraud, misuse, or breach of Terms is detected.\nAll pending dues must be cleared before termination.\n\n` +
            `10. Limitation of Liability\nThe Broker shall not be liable for loss of profit, data, or any damage arising due to:\n- Market volatility\n- Exchange downtime\n- Technical failures\n- Force majeure events\nThe Client trades entirely at their own risk.\n\n` +
            `11. Dispute Resolution\nAny dispute shall be resolved amicably through discussion.\nIf unresolved, it shall be subject to the jurisdiction of local courts.\n\n` +
            `12. Acceptance of Terms\nBy using our services, the Client acknowledges that they have read, understood, and agreed to all Terms & Conditions mentioned above.`
        }
      ];

      for (const sec of englishSections) {
        writeTermsContent(sec.title, sec.content);
      }

      // Add signature image under the T&C (bottom-right) if available
      try {
        const sigPath = imgAndSign['809010'].signature;
        const sigImgEl = new Image();
        sigImgEl.crossOrigin = "anonymous";
        sigImgEl.src = `${process.env.PUBLIC_URL}/${sigPath}`;
        await new Promise((resolve, reject) => {
          sigImgEl.onload = resolve;
          sigImgEl.onerror = reject;
        });

        // desired display width in PDF points
        const desiredW = 120; // points in jsPDF units
        const desiredH = (sigImgEl.naturalHeight * desiredW) / sigImgEl.naturalWidth;

        // position below the last written y, aligned to right
        let placeY = y + 10;
        if (placeY + desiredH > pageHeight - margin) {
          pdf.addPage();
          placeY = margin + 10;
        }

        const placeX = pageWidth - margin - desiredW;

        // Create a higher-resolution temporary canvas (scale by pixelScale) so image is sharp when downsampled into PDF
        const pixelScale = 3; // increase for better quality
        const canvasW = Math.max(1, Math.round(sigImgEl.naturalWidth * pixelScale));
        const canvasH = Math.max(1, Math.round(sigImgEl.naturalHeight * pixelScale));
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvasW;
        tmpCanvas.height = canvasH;
        const ctx = tmpCanvas.getContext("2d");
        // White background for signature
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);
        // Draw the image scaled up
        ctx.drawImage(sigImgEl, 0, 0, canvasW, canvasH);
        const sigDataUrl = tmpCanvas.toDataURL("image/png");

        // Add to PDF at desired display size (jsPDF will downsample the high-res image)
        pdf.addImage(sigDataUrl, "PNG", placeX, placeY, desiredW, desiredH);
        y = placeY + desiredH + 8;
      } catch (e) {
        console.warn("Could not load signature image for PDF:", e);
      }

      // Hindi Terms removed: only English sections will be written to the PDF.

      // finalize
      pdf.save("Confirmation Form.pdf");

      // restore
      element.style.width = originalWidth;
      if (btn) btn.style.visibility = "visible";
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("PDF generate करते समय error आया — console देखें।");
      // try to restore button if error
      const btn = document.querySelector(".no-print");
      if (btn) btn.style.visibility = "visible";
    }
  };

  return (
    <>
      <NavBar />

      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <div
          ref={receiptRef}
          style={{
            margin: "0 auto",
            padding: "30px 0 0 0",
            width: "100%",
            fontFamily: "Arial",
            color: "#222",
            background: "#fff"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: "1.3em", color: "#007bff" }}>
              {companyName || "INVESTMENT Pvt. Ltd."}
            </div>
            <div style={{ fontSize: "1em", marginBottom: 10 }}>
              We are registered with SEBI as a Stock Broker.
            </div>
          </div>

          <hr />

          <div style={{ display: "flex", justifyContent: "space-between", width: "90%", margin: "0 auto" }}>
            <div style={{ width: "65%" }}>
              <div style={{ fontWeight: "bold", marginBottom: 10, fontSize: "16px" }}>
                Customer Personal Information
              </div>

              <div><b>First Name:</b> {firstName}</div>
              <div><b>Last Name:</b> {lastName}</div>
              <div><b>Father's Name:</b> {fatherName}</div>
              <div><b>Date of Birth:</b> {dob ? new Date(dob).toLocaleDateString("en-GB") : ""}</div>
              <div><b>Gender:</b> {gender}</div>
              <div><b>Mobile Number:</b> {mobileNumber}</div>
              <div><b>Email ID:</b> {email}</div>
              <div><b>Aadhaar Number:</b> {aadhaar}</div>
              <div><b>Address:</b> {address}</div>
              <div><b>Initial Deposit:</b> {initialDeposit ? `INR ${Number(initialDeposit).toLocaleString("en-IN")}` : ""}</div>
              <div><b>Date of Application:</b> {applicationDate ? new Date(applicationDate).toLocaleDateString("en-GB") : ""}</div>
            </div>

            <div style={{ width: 120, height: 140 }}>
              {
                (() => {
                  const fallbackPhoto = photo;
                  return (
                    <img src={fallbackPhoto} alt="Customer" style={{ width: 120, height: 120, objectFit: "cover" }} />
                  );
                })()
              }
            </div>
          </div>

          <hr />

          <div style={{ width: "90%", margin: "0 auto", marginBottom: 30 }}>
            I hereby declare that all the above information is true to the best of my knowledge.
          </div>

          <div style={{ width: "90%", margin: "0 auto", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontStyle: "italic" }}>Signature of Authorized Officer</span>
            <img src={`${process.env.PUBLIC_URL}/${imgAndSign['809010'].signature}`}
              alt="Signature" style={{ maxWidth: 120 }} />
          </div>

          <div className="text-center mt-4" style={{ marginBottom: 30 }}>
            <button className="btn btn-primary no-print" onClick={handleDownloadPDF}>Download PDF</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvestReceipt;
