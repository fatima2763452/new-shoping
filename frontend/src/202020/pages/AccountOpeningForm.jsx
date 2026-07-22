import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';

const AccountOpeningForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    dob: '',
    gender: 'Male',
    segment: 'F&O',
    mobileLast4: '',
    aadhaarLast4: '',
    panLast4: '',
    refName: '',
    initialDeposit: '',
    applicationDate: new Date().toISOString().split('T')[0],
  });

  const [photo, setPhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePDF = async () => {
    const wrapper = document.getElementById('pdf-wrapper');
    wrapper.style.display = 'block';

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById('pdf-page-1');

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        windowWidth: 800,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const usableWidth = pageWidth - margin * 2;

      // Add captured page 1 image
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);

      // Start page 2 for Terms & Conditions
      pdf.addPage();
      let y = margin;

      const ensureSpace = (requiredHeight) => {
        if (y + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      // Header title on page 2
      pdf.setTextColor(12, 50, 96); // #0c3260
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("TERMS & CONDITIONS", margin, y);
      y += 24;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      // Split terms and write paragraph by paragraph
      const termsText = englishSections[0].content;
      const paragraphs = termsText.split('\n\n');

      for (const para of paragraphs) {
        if (!para || !para.trim()) continue;
        const lines = para.split('\n');
        const firstLine = lines[0].trim();
        const headingMatch = firstLine.match(/^\d+\.\s+.+/);

        if (headingMatch) {
          // Render section heading bold
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          const headingLines = pdf.splitTextToSize(firstLine, usableWidth);
          ensureSpace(headingLines.length * 13 + 4);
          pdf.text(headingLines, margin, y);
          y += headingLines.length * 13 + 4;

          // Render paragraph lines as normal
          const rest = lines.slice(1).join('\n');
          if (rest && rest.trim()) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            const restLines = pdf.splitTextToSize(rest, usableWidth);
            for (let i = 0; i < restLines.length; ) {
              const maxLines = Math.floor((pageHeight - margin - y) / 12);
              if (maxLines <= 0) {
                pdf.addPage();
                y = margin;
              }
              const chunk = restLines.slice(0, maxLines);
              pdf.text(chunk, margin, y);
              y += chunk.length * 12 + 3;
              restLines.splice(0, chunk.length);
            }
          }
        } else {
          // Regular paragraph
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          const paraLines = pdf.splitTextToSize(para, usableWidth);
          for (let i = 0; i < paraLines.length; ) {
            const maxLines = Math.floor((pageHeight - margin - y) / 12);
            if (maxLines <= 0) {
              pdf.addPage();
              y = margin;
            }
            const chunk = paraLines.slice(0, maxLines);
            pdf.text(chunk, margin, y);
            y += chunk.length * 12 + 3;
            paraLines.splice(0, chunk.length);
          }
        }
        y += 6; // paragraph spacing
      }

      // Add signature line at bottom
      ensureSpace(40);
      y += 20;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      // pdf.text("Applicant Signature", pageWidth - margin - 125, y);
      // pdf.line(pageWidth - margin - 125, y - 10, pageWidth - margin, y - 10);

      pdf.save(`Account_Opening_${formData.customerName || 'Form'}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      wrapper.style.display = 'none';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generatePDF();
  };

  const labelStyle = { fontSize: '8px', fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', backgroundColor: '#f8fafc', padding: '4px 6px' };
  const valueStyle = { fontSize: '9px', fontWeight: 'bold', color: '#000000', padding: '4px 6px' };

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
        `12. Acceptance of Terms\nBy using our services, the Client acknowledges that they have read, understood, and agreed to all Terms & Conditions mentioned`
    }
  ];

  const termsList = englishSections[0].content.split('\n\n');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span> Back
          </button>
          <div className="w-16"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 shadow-xl">
          <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-blue-400 text-sm font-bold uppercase tracking-wider">Account Opening Form</p>
            </div>
            <div className="text-slate-500 text-sm md:text-right">
              <p className="font-semibold text-slate-400">Master Client Registry</p>
              <p>New Account Application</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer Name</label>
              <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Customer ID (Auto / Custom)</label>
              <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} required className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Segment</label>
              <div className="flex gap-6 items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.segment.includes('F&O')}
                    onChange={(e) => {
                      let newSegments = formData.segment.split(',').map(s => s.trim()).filter(Boolean);
                      if (e.target.checked) {
                        if (!newSegments.includes('F&O')) newSegments.push('F&O');
                      } else {
                        newSegments = newSegments.filter(s => s !== 'F&O');
                      }
                      setFormData(prev => ({ ...prev, segment: newSegments.join(', ') }));
                    }}
                    className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-750 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>F&O</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={formData.segment.includes('MCX')}
                    onChange={(e) => {
                      let newSegments = formData.segment.split(',').map(s => s.trim()).filter(Boolean);
                      if (e.target.checked) {
                        if (!newSegments.includes('MCX')) newSegments.push('MCX');
                      } else {
                        newSegments = newSegments.filter(s => s !== 'MCX');
                      }
                      setFormData(prev => ({ ...prev, segment: newSegments.join(', ') }));
                    }}
                    className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-750 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span>MCX</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mobile Number (Last 4 Digits)</label>
              <div className="flex w-full bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500">
                <span className="flex items-center px-3 bg-slate-900 border-r border-slate-700 text-slate-500 font-mono tracking-widest text-lg mt-1">XXXXXX</span>
                <input type="text" name="mobileLast4" maxLength="4" value={formData.mobileLast4} onChange={handleChange} required placeholder="7890" className="w-full bg-transparent px-3 py-2 outline-none font-mono tracking-widest" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Initial Deposit</label>
              <input type="text" name="initialDeposit" value={formData.initialDeposit} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" placeholder="₹ 0.00" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aadhaar Number (Last 4 Digits)</label>
              <div className="flex w-full bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500">
                <span className="flex items-center px-3 bg-slate-900 border-r border-slate-700 text-slate-500 font-mono tracking-widest text-lg mt-1">XXXXXXXX</span>
                <input type="text" name="aadhaarLast4" maxLength="4" value={formData.aadhaarLast4} onChange={handleChange} required placeholder="1234" className="w-full bg-transparent px-3 py-2 outline-none font-mono tracking-widest" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">PAN Card (Last 4 Chars)</label>
              <div className="flex w-full bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-blue-500">
                <span className="flex items-center px-3 bg-slate-900 border-r border-slate-700 text-slate-500 font-mono tracking-widest text-lg mt-1">XXXXXX</span>
                <input type="text" name="panLast4" maxLength="4" value={formData.panLast4} onChange={handleChange} required placeholder="123A" className="w-full bg-transparent px-3 py-2 outline-none font-mono tracking-widest uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reference Name</label>
              <input type="text" name="refName" value={formData.refName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none" placeholder="Who referred this customer?" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Date of Application</label>
              <input type="date" name="applicationDate" value={formData.applicationDate} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none [color-scheme:dark]" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Upload Photo</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800" />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined">download</span> Submit & Download PDF
            </button>
          </div>
        </form>
      </div>

      {/* Hidden PDF Template */}
      <div id="pdf-wrapper" style={{ display: 'none', position: 'absolute', top: 0, left: 0, zIndex: 9999, width: '800px', backgroundColor: '#ffffff' }}>
        <div id="pdf-content" style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', width: '800px', boxSizing: 'border-box' }}>

          {/* ================= PAGE 1 ================= */}
          <div id="pdf-page-1" style={{ padding: '30px', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0c3260', paddingBottom: '8px', marginBottom: '20px' }}>
              <div>
                <img src={logo} alt="Shree Laxmi Trader Pvt. Ltd. Logo" style={{ height: '62px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  backgroundColor: '#0c3260',
                  color: '#ffffff',
                  padding: '6px 20px',
                  textAlign: 'right',
                  clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  minWidth: '260px'
                }}>
                  <h2 style={{ fontSize: '12px', fontWeight: '900', margin: '0', letterSpacing: '0.5px' }}>ACCOUNT OPENING FORM</h2>
                  <p style={{ fontSize: '7px', fontWeight: 'bold', margin: '1px 0 0 0', opacity: '0.9', letterSpacing: '0.5px' }}>FOR INDIVIDUAL / HUF / CORPORATE / NRI</p>
                </div>
                {photo ? (
                  <div style={{ width: '80px', height: '80px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={photo} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '80px', height: '80px', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '7px', color: '#94a3b8', flexShrink: 0, padding: '4px', lineHeight: '1.2' }}>
                    Passport Size<br />Photo Here
                  </div>
                )}
              </div>
            </div>

            {/* Section 1 */}
            <div style={{
              backgroundColor: '#0c3260',
              color: '#ffffff',
              padding: '5px 15px',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              display: 'inline-block',
              clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0 100%)',
              width: 'fit-content',
              minWidth: '220px'
            }}>
              1. PERSONAL / ENTITY DETAILS
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #a2b4cd', marginTop: '6px', marginBottom: '15px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ width: '130px', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Customer Name</td>
                  <td style={{ ...valueStyle }}>{formData.customerName || ''}</td>
                  <td style={{ width: '80px', borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Date</td>
                  <td style={{ width: '120px', ...valueStyle }}>{formData.applicationDate ? new Date(formData.applicationDate).toLocaleDateString('en-GB') : ''}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Account Type</td>
                  <td colSpan={3} style={{ ...valueStyle }}>
                    <span style={{ marginRight: '16px' }}>☑ Individual</span>
                    <span style={{ marginRight: '16px' }}>☐ HUF</span>
                    <span style={{ marginRight: '16px' }}>☐ Corporate</span>
                    <span>☐ NRI</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Customer ID</td>
                  <td style={{ ...valueStyle }}>{formData.customerId || ''}</td>
                  <td style={{ borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>PAN</td>
                  <td style={{ ...valueStyle }}>XXXXXX{formData.panLast4.toUpperCase() || 'XXXX'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Gender</td>
                  <td style={{ ...valueStyle }}>{formData.gender || ''}</td>
                  <td style={{ borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Date of Birth</td>
                  <td style={{ ...valueStyle }}>{formData.dob ? new Date(formData.dob).toLocaleDateString('en-GB') : ''}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Reference Name</td>
                  <td style={{ ...valueStyle }}>{formData.refName || ''}</td>
                  <td style={{ borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Mobile No.</td>
                  <td style={{ ...valueStyle }}>XXXXXX{formData.mobileLast4 || ''}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Aadhaar No.</td>
                  <td style={{ ...valueStyle }}>XXXXXXXX{formData.aadhaarLast4 || ''}</td>
                  <td style={{ borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Segment</td>
                  <td style={{ ...valueStyle }}>
                    <span style={{ marginRight: '16px' }}>{formData.segment.includes('F&O') ? '☑ F&O' : '☐ F&O'}</span>
                    <span>{formData.segment.includes('MCX') ? '☑ MCX' : '☐ MCX'}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Initial Deposit</td>
                  <td style={{ ...valueStyle }}>{formData.initialDeposit ? `Rs. ${formData.initialDeposit}` : ''}</td>
                  <td style={{ borderLeft: '1px solid #a2b4cd', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Status</td>
                  <td style={{ ...valueStyle }}>Active</td>
                </tr>
                <tr>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Address</td>
                  <td colSpan={3} style={{ ...valueStyle }}>123, Shakti Nagar, Navsari, Gujarat - 396445</td>
                </tr>
              </tbody>
            </table>

            {/* Section 4 */}
            <div style={{
              backgroundColor: '#0c3260',
              color: '#ffffff',
              padding: '5px 15px',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              display: 'inline-block',
              clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0 100%)',
              width: 'fit-content',
              minWidth: '220px'
            }}>
              2. TRADING PREFERENCES
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #a2b4cd', marginTop: '6px', marginBottom: '15px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ width: '130px', borderRight: '1px solid #a2b4cd', ...labelStyle }}>Segment</td>
                  <td style={{ ...valueStyle }}>
                    <span style={{ marginRight: '12px' }}>{formData.segment === 'F&O' ? '☑ F&O' : '☐ F&O'}</span>
                    <span>{formData.segment === 'MCX' ? '☑ MCX' : '☐ MCX'}</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #a2b4cd' }}>
                  <td style={{ borderRight: '1px solid #a2b4cd', ...labelStyle }}>Trading Frequency</td>
                  <td style={{ ...valueStyle }}>
                    <span style={{ marginRight: '16px' }}>☐ Low</span>
                    <span style={{ marginRight: '16px' }}>☑ Medium</span>
                    <span>☐ High</span>
                  </td>
                </tr>
               
              </tbody>
            </table>

            {/* Section 5 */}
            <div style={{
              backgroundColor: '#0c3260',
              color: '#ffffff',
              padding: '5px 15px',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              display: 'inline-block',
              clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0 100%)',
              width: 'fit-content',
              minWidth: '220px'
            }}>
              3. DOCUMENTS REQUIRED (SELF ATTESTED)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #a2b4cd', marginTop: '6px', marginBottom: '15px' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', ...valueStyle }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>☑ PAN Card</div>
                      <div>☑ Income Proof (ITR / Form 16)</div>
                      <div>☑ Aadhaar Card</div>
                      <div>☑ Address Proof</div>
                      <div>☑ Photograph</div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Declaration & Signatures */}
            <div style={{
              backgroundColor: '#0c3260',
              color: '#ffffff',
              padding: '5px 15px',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              display: 'inline-block',
              clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0 100%)',
              width: 'fit-content',
              minWidth: '220px'
            }}>
              4. DECLARATION
            </div>
            <div style={{ border: '1px solid #a2b4cd', padding: '15px', marginTop: '6px', fontSize: '10px', color: '#1e293b', lineHeight: '1.4' }}>
              <p style={{ margin: '0 0 15px 0', color: '#dc2626', fontSize: '10px', fontWeight: '700', textAlign: 'center' }}>
                <strong>Note:</strong> We are not registered with SEBI. High-leverage trading involves significant financial risk. Please trade at your own risk. The company shall not be responsible for any profit, loss, or financial consequences arising from your trading activities.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div>
                  <p style={{ margin: '0', fontSize: '11px', fontWeight: 'bold' }}>Name: <span style={{ textDecoration: 'underline' }}>{formData.customerName || '____________________'}</span></p>
                </div>
                <div>
                  <p style={{ margin: '0', fontSize: '11px', fontWeight: 'bold' }}>Date: <span style={{ textDecoration: 'underline' }}>{formData.applicationDate ? new Date(formData.applicationDate).toLocaleDateString('en-GB') : 'DD / MM / YYYY'}</span></p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountOpeningForm;