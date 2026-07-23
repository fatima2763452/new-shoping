import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import api from '../../services/api';
import logo from '../../assets/logo.jpeg';
import dhanlaxmiStamp from '../../assets/dhanlaxmi_stamp.jpg';
import dhanlaxmiSignature from '../../assets/dhanlaxmi_signature.jpg';

import autoTable from "jspdf-autotable";
const loadImageAsBase64 = (src) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = src;
    });
};

const getImgDimensions = (src) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 2, height: 1 });
        img.src = src;
    });
};

const assetCache = {};
const getImageAsset = async (src) => {
    if (assetCache[src]) return assetCache[src];
    const [base64, dims] = await Promise.all([
        loadImageAsBase64(src),
        getImgDimensions(src)
    ]);
    if (base64) {
        assetCache[src] = { base64, dims };
    }
    return { base64, dims };
};
// Helper for standard Indian currency formatting
const formatIndianCurrency = (n) => {
    const num = Number(n ?? 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper for profit/loss sign formatting (+/- at the back)
const formatProfitLoss = (n) => {
    const num = Number(n ?? 0);
    const sign = num >= 0 ? '+' : '-';
    const absVal = Math.abs(num);
    return `${sign}₹${absVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00A0`;
};

// Helper to render ₹ symbol as a high-res image (PDF built-in fonts don't support ₹)
const createRupeeImage = (hexColor, fontSizePt) => {
    const scale = 8;
    const sizePx = fontSizePt * 1.33;
    const font = `bold ${Math.round(sizePx * scale)}px "Segoe UI", Arial, sans-serif`;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = font;
    const metrics = ctx.measureText('₹');
    const w = Math.ceil(metrics.width) + 2;
    const h = Math.ceil(sizePx * scale * 1.1);
    canvas.width = w;
    canvas.height = h;
    ctx.font = font;
    ctx.fillStyle = hexColor;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('₹', 1, h * 0.75);
    return { dataUrl: canvas.toDataURL('image/png'), w: w / scale, h: h / scale };
};
const rgbToHex = (rgb) => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');

// Helper to format raw number for PDF table (without currency symbol)
const formatPDFNumber = (n) => {
    const num = Number(n ?? 0);
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Helper for PDF specific profit/loss formatting
const formatPDFProfitLoss = (n) => {
    const num = Number(n ?? 0);
    const sign = num >= 0 ? '+' : '-';
    const absVal = Math.abs(num);
    return `${sign}${absVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper to format date to DD MMM (e.g. 30 JUN)
const formatDDMMM = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${day} ${months[date.getMonth()]}`;
};

// Mask mobile number to show last 4 digits
const maskMobileNumber = (num) => {
    const val = num || '9876543210';
    const stripped = val.replace(/[^0-9]/g, '');
    if (stripped.length >= 4) {
        return `+91 XXXXX XX${stripped.slice(-4)}`;
    }
    return val;
};

// Mask PAN number to show last 4 digits
const maskPanNumber = (pan) => {
    const val = (pan || 'ABCPT1234Q').toUpperCase();
    if (val.length >= 4) {
        return `XXXXXX${val.slice(-4)}`;
    }
    return val;
};

export default function Invoice() {
    const navigate = useNavigate();
    const { id: customerId } = useParams();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [margin, setMargin] = useState(''); // Margin Input State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [invoiceData, setInvoiceData] = useState([]);
    const [invoiceId, setInvoiceId] = useState('');
    const [summary, setSummary] = useState({ totalTurnover: 0, totalProfit: 0, totalLoss: 0, totalBrokerage: 0, netPnl: 0 });
    const [fetchStatus, setFetchStatus] = useState(''); // For UI debug
    const [filterStats, setFilterStats] = useState({ total: 0, matched: 0, range: '' });
    const [clientName, setClientName] = useState('');
    const [clientCode, setClientCode] = useState('');
    const [isClosedAccount, setIsClosedAccount] = useState(false);

    // New editable parameters for Client Details & Margins (empty by default, user-driven)
    const [panNumber, setPanNumber] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address, setAddress] = useState('');
    const [freeMargin, setFreeMargin] = useState('');
    const [holdMargin, setHoldMargin] = useState('');
    const [totalMargin, setTotalMargin] = useState('');

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const userInfoStr = localStorage.getItem('userInfo');
                if (!userInfoStr) return;
                const userInfo = JSON.parse(userInfoStr);
                const ownerId = userInfo?._id;
                if (!ownerId) return;

                const res = await api.get(`/customers?ownerId=${ownerId}`);
                const customer = res.data.find(c => c._id === customerId);
                if (customer) {
                    setClientName(customer.name);
                    setClientCode(customer.customerId);
                }
            } catch (err) {
                console.error("Failed to fetch customer", err);
            }
        };
        fetchCustomer();
    }, [customerId]);

    // Fetch Orders (Exit records)
    const fetchOrders = async () => {
        setLoading(true);
        setFetchStatus('Fetching...');
        try {
            const res = await api.get(`/trades/weekly/${customerId}`);
            const count = res.data?.length || 0;
            setFetchStatus(`Loaded ${count} closed orders from server.`);
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[Invoice] Fetch Failed:', err);
            setFetchStatus(`Fetch Failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Set default dates (start of month to today)
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(now.toISOString().split('T')[0]);

        fetchOrders();
        getImageAsset(logo);
        getImageAsset(dhanlaxmiStamp);
        getImageAsset(dhanlaxmiSignature);
    }, [customerId]);

    const isDateInRange = (rawDate, startStr, endStr) => {
        if (!rawDate || !startStr || !endStr) return false;
        
        let dStr = '';
        if (typeof rawDate === 'string') {
            if (rawDate.includes('T')) {
                dStr = rawDate.split('T')[0];
            } else if (rawDate.includes('-')) {
                dStr = rawDate.slice(0, 10);
            }
        }
        
        if (!dStr) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dStr = `${year}-${month}-${day}`;
            }
        }

        if (!dStr) return false;

        const dObj = new Date(rawDate);
        let localDStr = dStr;
        if (!isNaN(dObj.getTime())) {
            const localYYYY = dObj.getFullYear();
            const localMM = String(dObj.getMonth() + 1).padStart(2, '0');
            const localDD = String(dObj.getDate()).padStart(2, '0');
            localDStr = `${localYYYY}-${localMM}-${localDD}`;
        }

        const inUtc = (dStr >= startStr && dStr <= endStr);
        const inLocal = (localDStr >= startStr && localDStr <= endStr);

        return inUtc || inLocal;
    };

    const generateInvoice = () => {
        if (!startDate || !endDate) return;

        const filtered = orders.filter(o => {
            const fallbackDate = o.date || o.createdAt;
            return isDateInRange(fallbackDate, startDate, endDate);
        });

        setFilterStats({
            total: orders.length,
            matched: filtered.length,
            range: `${startDate} to ${endDate}`
        });

        // Generate Invoice ID if not already set
        if (!invoiceId) {
            const rand4 = Math.floor(1000 + Math.random() * 9000);
            setInvoiceId(`R#######${rand4}`);
        }

        // Process Data for Invoice
        let totalTurnover = 0;
        let totalBrokerageAccumulated = 0;
        let totalProfit = 0;
        let totalLoss = 0;

        const processed = filtered.map(order => {
            const qty = parseFloat(order.quantity) || 0;
            const entryPrice = parseFloat(order.price) || 0;
            const exitPrice = parseFloat(order.ltp) || 0;

            const entryValue = entryPrice * qty;
            const exitValue = exitPrice * qty;
            const netPnl = parseFloat(order.realizedPnl) || 0;
            const finalBrokerage = parseFloat(order.brokerageFee) || 0;

            totalTurnover += (entryValue + exitValue);
            totalBrokerageAccumulated += finalBrokerage;

            if (netPnl >= 0) {
                totalProfit += netPnl;
            } else {
                totalLoss += Math.abs(netPnl);
            }

            return {
                ...order,
                qty,
                entryPrice,
                exitPrice,
                netPnl,
                totalBrokerage: finalBrokerage,
                dateStr: new Date(order.date || order.createdAt).toLocaleDateString()
            };
        });

        setInvoiceData(processed);
        setSummary({
            totalTurnover,
            totalProfit,
            totalLoss,
            totalBrokerage: totalBrokerageAccumulated,
            netPnl: totalProfit - totalLoss
        });
        setGenerated(true);
    };

    // --- PDF DOWNLOAD HANDLER ---
    const handleDownloadPDF = async () => {
        try {
            setLoading(true);

            const pdf = new jsPDF('p', 'pt', 'a4');
            const activeFont = 'helvetica';
            pdf.setFont(activeFont, 'normal');

            const pageW = pdf.internal.pageSize.getWidth();   // 595.28
            const pageH = pdf.internal.pageSize.getHeight();  // 841.89
            const marginSize = 40; 
            let cursorY = marginSize;

            const darkText = [15, 23, 42];      // Slate 900
            const mutedText = [100, 116, 139];  // Slate 500
            const greenColor = [0, 176, 80];    // Green
            const redColor = [239, 68, 68];     // Red
            const contentW = pageW - 2 * marginSize;

            // Load cached image assets (Logo, Stamp, Signature)
            const [{ base64: logoBase64, dims: logoDims }, { base64: stampBase64 }, { base64: sigBase64 }] = await Promise.all([
                getImageAsset(logo),
                getImageAsset(dhanlaxmiStamp),
                getImageAsset(dhanlaxmiSignature)
            ]);

            // Header Elements (Logo on the left)
            if (logoBase64) {
                const logoH = 70; // height in pt
                const logoW = (logoDims.width / logoDims.height) * logoH;
                pdf.addImage(logoBase64, 'JPEG', marginSize, cursorY, logoW, logoH);
            }

            cursorY += 65;

            // Subheader Bar
            pdf.setFillColor(15, 23, 42); // Slate 900
            pdf.rect(marginSize, cursorY, contentW, 20, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(9);
            pdf.text('STOCK TRADING INVOICE', marginSize + 10, cursorY + 13);

            cursorY += 30;

            // Invoice Meta & Client Details Section
            // Left Column: Invoice details
            pdf.setTextColor(100, 116, 139);
            pdf.setFont(activeFont, 'semibold');
            pdf.setFontSize(8.5);

            pdf.text('Invoice No.', marginSize, cursorY + 16);
            pdf.text('Invoice Date', marginSize, cursorY + 30);

            pdf.setTextColor(15, 23, 42);
            pdf.text(':', marginSize + 70, cursorY + 16);
            pdf.text(':', marginSize + 70, cursorY + 30);

            pdf.setFont(activeFont, 'bold');
            pdf.text(invoiceId, marginSize + 78, cursorY + 16);
            pdf.setFont(activeFont, 'normal');
            pdf.text(new Date().toLocaleDateString('en-GB'), marginSize + 78, cursorY + 30);

            // Right Column: Client details border card
            const clientCardW = 220;
            const clientCardH = 85;
            const clientCardX = pageW - marginSize - clientCardW;
            const clientCardY = cursorY;

            pdf.setDrawColor(226, 232, 240); // Slate 200
            pdf.setFillColor(248, 250, 252); // Slate 50
            pdf.roundedRect(clientCardX, clientCardY, clientCardW, clientCardH, 6, 6, 'FD');

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(37, 99, 235); // Blue 600
            pdf.text('CLIENT DETAILS', clientCardX + 10, clientCardY + 15);

            pdf.setDrawColor(226, 232, 240);
            pdf.line(clientCardX + 10, clientCardY + 20, clientCardX + clientCardW - 10, clientCardY + 20);

            pdf.setFontSize(8);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Client Name', clientCardX + 10, clientCardY + 32);
            pdf.text('Client ID', clientCardX + 10, clientCardY + 44);
            pdf.text('PAN Number', clientCardX + 10, clientCardY + 56);
            pdf.text('Mobile Number', clientCardX + 10, clientCardY + 68);
            pdf.text('Address', clientCardX + 10, clientCardY + 80);

            pdf.setTextColor(15, 23, 42);
            pdf.text(':', clientCardX + 75, clientCardY + 32);
            pdf.text(':', clientCardX + 75, clientCardY + 44);
            pdf.text(':', clientCardX + 75, clientCardY + 56);
            pdf.text(':', clientCardX + 75, clientCardY + 68);
            pdf.text(':', clientCardX + 75, clientCardY + 80);

            pdf.setFont(activeFont, 'bold');
            pdf.text(clientName || '', clientCardX + 82, clientCardY + 32);
            pdf.text(clientCode || '', clientCardX + 82, clientCardY + 44);
            pdf.setFont(activeFont, 'normal');
            pdf.text(maskPanNumber(panNumber), clientCardX + 82, clientCardY + 56);
            pdf.text(maskMobileNumber(mobileNumber), clientCardX + 82, clientCardY + 68);
            pdf.text(address || '123, Shakti Nagar, Gujarat', clientCardX + 82, clientCardY + 80);

            cursorY += clientCardH + 20;

            // Trade Details Table
            // Table Header Title Bar
            pdf.setFillColor(15, 23, 42); // Slate 900
            pdf.rect(marginSize, cursorY, contentW, 18, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(8.5);
            pdf.text('TRADE DETAILS', pageW / 2, cursorY + 12, { align: 'center' });

            cursorY += 18;

            const tableColumns = [
                { header: 'No.', dataKey: 'idx' },
                { header: 'STOCK', dataKey: 'stock' },
                { header: 'TYPE', dataKey: 'type' },
                { header: 'AVG. BUY PRICE', dataKey: 'buyPrice' },
                { header: 'QTY', dataKey: 'qty' },
                { header: 'EXIT PRICE', dataKey: 'exitPrice' },
                { header: 'BROKERAGE', dataKey: 'brokerage' },
                { header: 'P/L', dataKey: 'pl' },
            ];

            const tableRows = invoiceData.map((item, idx) => {
                const symbol = item.symbol?.toUpperCase();
                const dateStr = formatDDMMM(item.date || item.createdAt);
                return {
                    idx: String(idx + 1),
                    stock: `${symbol}\n${dateStr}`,
                    type: item.action?.toUpperCase() || 'SELL',
                    buyPrice: formatPDFNumber(item.entryPrice),
                    qty: String(item.qty),
                    exitPrice: formatPDFNumber(item.exitPrice),
                    brokerage: formatPDFNumber(item.totalBrokerage),
                    pl: formatPDFProfitLoss(item.netPnl),
                    _netPnl: item.netPnl
                };
            });

            const tableResult = autoTable(pdf, {
                startY: cursorY,
                columns: tableColumns,
                body: tableRows,
                margin: { left: marginSize, right: marginSize },
                tableWidth: 'auto',
                theme: 'grid',
                styles: { font: activeFont },
                headStyles: {
                    fillColor: [241, 245, 249],  // Light gray
                    textColor: [15, 23, 42],      // Slate 900
                    fontStyle: 'bold',
                    fontSize: 7.5,
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.5,
                    lineColor: [226, 232, 240]
                },
                bodyStyles: {
                    fontSize: 7,
                    fontStyle: 'bold',
                    textColor: [15, 23, 42],
                    valign: 'middle',
                    lineWidth: 0.5,
                    lineColor: [226, 232, 240]
                },
                columnStyles: {
                    idx: { cellWidth: 25, halign: 'center' },
                    stock: { cellWidth: 'auto', halign: 'left' },
                    type: { cellWidth: 45, halign: 'center' },
                    buyPrice: { cellWidth: 80, halign: 'right' },
                    qty: { cellWidth: 45, halign: 'center' },
                    exitPrice: { cellWidth: 80, halign: 'right' },
                    brokerage: { cellWidth: 70, halign: 'right' },
                    pl: { cellWidth: 85, halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'body') {
                        const rowData = tableRows[data.row.index];
                        if (data.column.dataKey === 'pl') {
                            data.cell.styles.textColor = rowData._netPnl >= 0 ? [0, 176, 80] : [239, 68, 68];
                        }
                        if (data.column.dataKey === 'type') {
                            data.cell.styles.textColor = rowData.type === 'BUY' ? [37, 99, 235] : [220, 38, 38];
                        }
                    }
                },
                rowPageBreak: 'avoid'
            });

            cursorY = (tableResult?.finalY ?? pdf.lastAutoTable?.finalY ?? cursorY) + 20;

            const ensureSpace = (neededHeight) => {
                if (cursorY + neededHeight > pageH - 50) {
                    pdf.addPage();
                    cursorY = marginSize;
                }
            };

            // Summary Footer Cards (MARGIN DETAILS on Left, PAYMENT SUMMARY on Right)
            ensureSpace(125);

            const summaryCardW = (contentW - 15) / 2;

            // Left Card: MARGIN DETAILS
            const displayFreeMargin = freeMargin !== '' && freeMargin !== null && !isNaN(parseFloat(freeMargin)) ? parseFloat(freeMargin) : 0;
            const displayHoldMargin = holdMargin !== '' && holdMargin !== null && !isNaN(parseFloat(holdMargin)) ? parseFloat(holdMargin) : 0;
            const displayTotalMargin = totalMargin !== '' && totalMargin !== null && !isNaN(parseFloat(totalMargin)) ? parseFloat(totalMargin) : 0;

            pdf.setDrawColor(226, 232, 240);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(marginSize, cursorY, summaryCardW, 115, 6, 6, 'FD');

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(37, 99, 235);
            pdf.text('MARGIN DETAILS', marginSize + 10, cursorY + 15);

            pdf.setDrawColor(226, 232, 240);
            pdf.line(marginSize + 10, cursorY + 20, marginSize + summaryCardW - 10, cursorY + 20);

            pdf.setFontSize(7.5);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Free Margin', marginSize + 10, cursorY + 35);
            pdf.text('Hold Margin', marginSize + 10, cursorY + 55);
            pdf.text('Total Margin', marginSize + 10, cursorY + 75);

            pdf.setTextColor(15, 23, 42);
            pdf.text(`Rs. ${formatPDFNumber(displayFreeMargin)}`, marginSize + summaryCardW - 10, cursorY + 35, { align: 'right' });
            pdf.text(`Rs. ${formatPDFNumber(displayHoldMargin)}`, marginSize + summaryCardW - 10, cursorY + 55, { align: 'right' });
            pdf.text(`Rs. ${formatPDFNumber(displayTotalMargin)}`, marginSize + summaryCardW - 10, cursorY + 75, { align: 'right' });

            // Right Card: PAYMENT SUMMARY
            const rightCardX = marginSize + summaryCardW + 15;
            pdf.setDrawColor(226, 232, 240);
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(rightCardX, cursorY, summaryCardW, 115, 6, 6, 'FD');

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(8);
            pdf.setTextColor(37, 99, 235);
            pdf.text('PAYMENT SUMMARY', rightCardX + 10, cursorY + 15);

            pdf.setDrawColor(226, 232, 240);
            pdf.line(rightCardX + 10, cursorY + 20, rightCardX + summaryCardW - 10, cursorY + 20);

            pdf.setFontSize(7.5);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Total Buy Value', rightCardX + 10, cursorY + 32);
            pdf.text('Total Sell Value', rightCardX + 10, cursorY + 44);
            pdf.text('Gross Profit', rightCardX + 10, cursorY + 56);

            pdf.setTextColor(15, 23, 42);
            pdf.text(`Rs. ${formatPDFNumber(totalBuyValueSum)}`, rightCardX + summaryCardW - 10, cursorY + 32, { align: 'right' });
            pdf.text(`Rs. ${formatPDFNumber(totalSellValueSum)}`, rightCardX + summaryCardW - 10, cursorY + 44, { align: 'right' });

            const grossProfitVal = summary.netPnl + summary.totalBrokerage;
            pdf.setFont(activeFont, 'bold');
            pdf.setTextColor(grossProfitVal >= 0 ? 0 : 239, grossProfitVal >= 0 ? 176 : 68, grossProfitVal >= 0 ? 80 : 68);
            pdf.text(`Rs. ${formatPDFNumber(grossProfitVal)}`, rightCardX + summaryCardW - 10, cursorY + 56, { align: 'right' });

            pdf.setDrawColor(226, 232, 240);
            pdf.line(rightCardX + 10, cursorY + 86, rightCardX + summaryCardW - 10, cursorY + 86);

            const netPayableVal = summary.netPnl - (summary.totalBrokerage * 0.18);
            pdf.setFillColor(236, 253, 245);
            pdf.setDrawColor(167, 243, 208);
            pdf.roundedRect(rightCardX + 8, cursorY + 92, summaryCardW - 16, 18, 3, 3, 'FD');

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(7.5);
            pdf.setTextColor(6, 95, 70);
            pdf.text('Net Payable / Receivable', rightCardX + 14, cursorY + 104);
            pdf.setFontSize(8.5);
            pdf.text(`Rs. ${formatPDFNumber(netPayableVal)}`, rightCardX + summaryCardW - 14, cursorY + 104, { align: 'right' });

            cursorY += 130;

            // Real Stamp & Signature block
            ensureSpace(70);

            // Stamp Image (Left)
            if (stampBase64) {
                pdf.addImage(stampBase64, 'PNG', marginSize + 20, cursorY - 10, 75, 75);
            }

            // Signature Image (Right)
            const rightEdgeX = pageW - marginSize;
            if (sigBase64) {
                pdf.addImage(sigBase64, 'PNG', rightEdgeX - 140, cursorY - 15, 140, 45);
            }

            pdf.setDrawColor(203, 213, 225);
            pdf.setLineWidth(1);
            pdf.line(rightEdgeX - 140, cursorY + 32, rightEdgeX, cursorY + 32);

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(7.5);
            pdf.setTextColor(148, 163, 184);
            pdf.text('Authorized Signatory', rightEdgeX - 70, cursorY + 42, { align: 'center' });

            cursorY += 55;

            // Notes and disclaimer
            ensureSpace(45);
            pdf.setDrawColor(241, 245, 249);
            pdf.line(marginSize, cursorY, pageW - marginSize, cursorY);
            cursorY += 12;

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(7.5);
            pdf.setTextColor(71, 85, 105);
            pdf.text('Note:', marginSize, cursorY);

            pdf.setFont(activeFont, 'normal');
            pdf.setFontSize(7);
            pdf.setTextColor(148, 163, 184);
            pdf.text('1. Brokerage charged as per the agreed terms.', marginSize, cursorY + 10);
            pdf.text('2. Payment to be made within T+1 settlement cycle.', marginSize, cursorY + 19);
            pdf.text('3. This is a computer generated invoice, does not require physical signature.', marginSize, cursorY + 28);

            pdf.setFont(activeFont, 'bold');
            pdf.setFontSize(9);
            pdf.setTextColor(15, 23, 42);
            pdf.text('THANK YOU FOR TRADING WITH US!', pageW - marginSize, cursorY + 20, { align: 'right' });

            const safeClientName = (clientName || 'Invoice').replace(/[^a-zA-Z0-9]/g, '_');
            const d = new Date();
            const formattedDate = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear().toString().slice(-2)}`;

            pdf.save(`${safeClientName}_${formattedDate}.pdf`);

        } catch (error) {
            console.error('PDF Error:', error);
            alert(`PDF generation failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // If not generated, show form

    // If not generated, show form
    if (!generated) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 flex flex-col items-center pt-20">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full dark:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold dark:text-white">Generate Tax Invoice</h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Client Details Form Section */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Edit Client Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PAN Number (Last 4 digits)</label>
                                    <input
                                        type="text"
                                        value={panNumber}
                                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                                        maxLength={4}
                                        placeholder="e.g. ABCPT1234Q"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mobile Number  (Last 4 digits)</label>
                                    <input
                                        type="text"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        maxLength={4}
                                        placeholder="e.g. +91 98765 43210"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. 123, Shakti Nagar, Gujarat"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Margins Form Section */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
                            <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Edit Margin Details</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Free Margin</label>
                                    <input
                                        type="text"
                                        value={freeMargin}
                                        onChange={(e) => setFreeMargin(e.target.value)}
                                        placeholder="Auto"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Hold Margin</label>
                                    <input
                                        type="text"
                                        value={holdMargin}
                                        onChange={(e) => setHoldMargin(e.target.value)}
                                        placeholder="Auto"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Total Margin</label>
                                    <input
                                        type="text"
                                        value={totalMargin}
                                        onChange={(e) => setTotalMargin(e.target.value)}
                                        placeholder="Auto"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Closed Account Note Checkbox */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                            <input
                                type="checkbox"
                                id="closed-account-checkbox"
                                checked={isClosedAccount}
                                onChange={(e) => setIsClosedAccount(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="closed-account-checkbox" className="text-sm font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                Close account statement (settlement note)
                            </label>
                        </div>

                        <button
                            onClick={generateInvoice}
                            disabled={loading}
                            className="w-full bg-[#00B050] hover:bg-[#009040] text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? 'Loading Data...' : 'Generate Invoice'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculations for the totals
    const totalBuyValueSum = invoiceData.reduce((acc, item) => acc + (item.entryPrice * item.qty), 0);
    const totalSellValueSum = invoiceData.reduce((acc, item) => acc + (item.exitPrice * item.qty), 0);

    // Invoice View
    return (
        <div className="min-h-screen bg-slate-50 text-black p-8 print:p-0">
            {/* Print / Download Controls - Hidden in Print */}
            <div className="max-w-5xl mx-auto mb-8 flex justify-between print:hidden">
                <button onClick={() => setGenerated(false)} className="flex items-center gap-2 text-gray-600 hover:text-black font-semibold">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex gap-2">
                    {/* Manual PDF Download Button */}
                    <button onClick={handleDownloadPDF} disabled={loading} className="flex items-center gap-2 bg-[#00B050] text-white px-5 py-2.5 rounded-lg hover:bg-[#009040] font-bold shadow-lg shadow-green-500/10 transition-all">
                        <Download className="w-4 h-4" /> {loading ? 'Downloading...' : 'Download PDF'}
                    </button>
                </div>
            </div>

            {/* Invoice Document - ID added for html2canvas */}
            <div id="invoice-content" className="max-w-5xl mx-auto border border-[#e5e7eb] rounded-2xl bg-white shadow-xl print:shadow-none print:border-none overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="p-8 pb-0">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                        <div>
                            <img src={logo} alt="Logo" style={{ height: '70px', maxWidth: '300px', objectFit: 'contain' }} />
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] mt-1 pl-1">
                                YOUR TRUST, OUR COMMITMENT
                            </p>
                        </div>

                      
                    </div>

                    <div className="my-4"></div>

                    {/* Subheader Bar */}
                    <div className="bg-[#0f172a] text-white px-4 py-2 rounded font-bold text-xs uppercase tracking-wider mb-6">
                        STOCK TRADING INVOICE
                    </div>

                    {/* Invoice Meta & Client Details */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Left Column: Invoice Details */}
                        <div className="space-y-2 text-xs font-semibold text-slate-700 col-span-1 mt-4">
                            <div className="flex">
                                <span className="w-28 text-slate-400">Invoice No.</span>
                                <span className="mr-2">:</span>
                                <span className="text-slate-900 font-bold">{invoiceId}</span>
                            </div>
                            <div className="flex">
                                <span className="w-28 text-slate-400">Invoice Date</span>
                                <span className="mr-2">:</span>
                                <span className="text-slate-900">{new Date().toLocaleDateString('en-GB')}</span>
                            </div>
                           
                        </div>

                        {/* Right Column: Client Details */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                                <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">CLIENT DETAILS</h4>
                            </div>
                            <div className="space-y-2 text-xs font-semibold text-slate-700">
                                <div className="flex">
                                    <span className="w-28 text-slate-400">Client Name</span>
                                    <span className="mr-2">:</span>
                                    <span className="text-slate-900 font-bold">{clientName}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-slate-400">Client ID</span>
                                    <span className="mr-2">:</span>
                                    <span className="text-slate-900 font-bold">{clientCode}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-slate-400">PAN Number</span>
                                    <span className="mr-2">:</span>
                                    <span className="text-slate-900 font-mono">{maskPanNumber(panNumber)}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-slate-400">Mobile Number</span>
                                    <span className="mr-2">:</span>
                                    <span className="text-slate-900">{maskMobileNumber(mobileNumber)}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-28 text-slate-400">Address</span>
                                    <span className="mr-2">:</span>
                                    <span className="text-slate-900 leading-relaxed">
                                        {address || '123, Shakti Nagar, Gujarat'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trade Details Header */}
                    <div className="bg-[#0f172a] text-white px-4 py-2.5 rounded-t-xl font-bold text-center text-xs uppercase tracking-wider">
                        TRADE DETAILS
                    </div>

                    {/* Trade Details Table */}
                    <div className="overflow-hidden rounded-b-xl border border-t-0 border-slate-200 shadow-sm mb-6">
                        <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-slate-100/80 text-black font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 text-center w-12">No.</th>
                                    <th className="px-3 py-3 text-left">STOCK</th>
                                    <th className="px-3 py-3 text-center w-20">TYPE</th>
                                    <th className="px-3 py-3 text-right">AVG. BUY PRICE</th>
                                    <th className="px-3 py-3 text-center w-24">QTY</th>
                                    <th className="px-3 py-3 text-right">EXIT PRICE</th>
                                    <th className="px-3 py-3 text-right">BROKERAGE</th>
                                    <th className="px-3 py-3 text-right">P/L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoiceData.map((item, idx) => (
                                    <tr key={idx} className="even:bg-slate-50/30 hover:bg-slate-50 transition-colors font-medium">
                                        <td className="px-3 py-3.5 text-center text-slate-400 font-semibold">{idx + 1}</td>
                                        <td className="px-3 py-3.5 font-bold text-slate-900">
                                            <div className="flex flex-col">
                                                <span>{item.symbol?.toUpperCase()}</span>
                                                <span className="text-[9px] text-slate-400 font-medium mt-0.5">{formatDDMMM(item.date || item.createdAt)}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5 text-center">
                                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                                                item.action?.toUpperCase() === 'BUY' 
                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                                    : 'bg-red-50 text-red-600 border border-red-100'
                                            }`}>
                                                {item.action?.toUpperCase() || 'SELL'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5 text-right text-slate-700">
                                            {formatIndianCurrency(item.entryPrice).replace('₹', '')}
                                        </td>
                                        <td className="px-3 py-3.5 text-center text-slate-700">
                                            {item.qty}
                                        </td>
                                        <td className="px-3 py-3.5 text-right text-slate-700">
                                            {formatIndianCurrency(item.exitPrice).replace('₹', '')}
                                        </td>
                                        <td className="px-3 py-3.5 text-right text-slate-700">
                                            {formatIndianCurrency(item.totalBrokerage).replace('₹', '')}
                                        </td>
                                        <td className={`px-3 py-3.5 text-right font-extrabold whitespace-nowrap ${item.netPnl >= 0 ? 'text-[#00B050]' : 'text-[#ef4444]'}`}>
                                            {formatProfitLoss(item.netPnl)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Spacer for Summary Footer */}
                    <div className="my-4"></div>

                    {/* Summary Footer / Cards */}
                    <div className="flex justify-between mb-6 gap-3">

                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 w-full max-w-md">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                                <span className="material-symbols-outlined text-blue-600 text-sm">assessment</span>
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">MARGIN DETAILS</h4>
                            </div>
                            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                                <div className="flex justify-between pb-2">
                                    <span className="text-slate-400">Free Margin</span>
                                    <span className="text-slate-900">
                                        {formatIndianCurrency(freeMargin !== '' && freeMargin !== null && !isNaN(parseFloat(freeMargin)) ? parseFloat(freeMargin) : 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-slate-400">Hold Margin</span>
                                    <span className="text-slate-900">
                                        {formatIndianCurrency(holdMargin !== '' && holdMargin !== null && !isNaN(parseFloat(holdMargin)) ? parseFloat(holdMargin) : 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-slate-400">Total Margin</span>
                                    <span className="text-slate-900">
                                        {formatIndianCurrency(totalMargin !== '' && totalMargin !== null && !isNaN(parseFloat(totalMargin)) ? parseFloat(totalMargin) : 0)}
                                    </span>
                                </div>

                              
                                {/* <div className="flex justify-between">
                                    <span className="text-slate-400">Gross Profit</span>
                                    <span className={`font-bold ${summary.netPnl >= 0 ? 'text-[#00B050]' : 'text-[#ef4444]'}`}>
                                        {formatIndianCurrency(summary.netPnl + summary.totalBrokerage)}
                                    </span>
                                </div>
                                 */}
                                {/* <div className="border-t border-dashed border-slate-200 my-2"></div> */}
                                
                                {/* <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100">
                                    <span className="font-bold uppercase tracking-wider">Net Payable / Receivable</span>
                                    <span className="text-sm font-black whitespace-nowrap">
                                        {formatIndianCurrency(summary.netPnl - (summary.totalBrokerage * 0.18))}
                                    </span>
                                </div> */}
                            </div>
                        </div>
                        {/* PAYMENT SUMMARY - Aligned to Right, occupying 50% width equivalent */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 w-full max-w-md">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
                                <span className="material-symbols-outlined text-blue-600 text-sm">assessment</span>
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">PAYMENT SUMMARY</h4>
                            </div>
                            <div className="space-y-2.5 text-xs font-semibold text-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Buy Value</span>
                                    <span className="text-slate-900">{formatIndianCurrency(totalBuyValueSum)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Sell Value</span>
                                    <span className="text-slate-900">{formatIndianCurrency(totalSellValueSum)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Gross Profit</span>
                                    <span className={`font-bold ${summary.netPnl >= 0 ? 'text-[#00B050]' : 'text-[#ef4444]'}`}>
                                        {formatIndianCurrency(summary.netPnl + summary.totalBrokerage)}
                                    </span>
                                </div>
                                
                                <div className="border-t border-dashed border-slate-200 my-2"></div>
                                
                                <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-100">
                                    <span className="font-bold uppercase tracking-wider">Net Payable / Receivable</span>
                                    <span className="text-sm font-black whitespace-nowrap">
                                        {formatIndianCurrency(summary.netPnl - (summary.totalBrokerage * 0.18))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    

                    {/* Signature stamp and Verifications */}
                    <div className="flex justify-between border-t border-slate-100 pt-6 mb-6">
                        {/* QR Verification Box */}
                        {/* <div className="border border-slate-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm max-w-[260px]">
                            <div className="w-14 h-14 bg-slate-100 flex items-center justify-center border border-slate-200 rounded p-1 flex-shrink-0">
                                <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-60">
                                    <div className="bg-slate-900"></div><div className="bg-slate-900"></div><div className="bg-white"></div><div className="bg-slate-900"></div>
                                    <div className="bg-white"></div><div className="bg-slate-900"></div><div className="bg-slate-900"></div><div className="bg-white"></div>
                                    <div className="bg-slate-900"></div><div className="bg-white"></div><div className="bg-slate-900"></div><div className="bg-slate-900"></div>
                                    <div className="bg-slate-900"></div><div className="bg-slate-900"></div><div className="bg-white"></div><div className="bg-slate-900"></div>
                                </div>
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold leading-normal">
                                <p className="text-slate-700">Scan to Verify</p>
                                <p className="text-slate-400 font-normal">Invoice No.</p>
                                <p className="font-mono text-slate-600 truncate max-w-[120px]">{invoiceId}</p>
                            </div>
                        </div> */}

                        {/* Left: Stamp */}
                        <div className="opacity-95 select-none flex items-center justify-start pl-6">
                            <img 
                                src={dhanlaxmiStamp} 
                                alt="Dhanlaxmi Capital Stamp" 
                                className="w-36 h-36 object-contain transform rotate-[-4deg]" 
                            />
                        </div>

                        {/* Right: Signature */}
                        <div className="text-right flex flex-col items-end relative pr-6">
                            <div className="h-24 w-72 flex items-center justify-center select-none relative">
                                <img 
                                    src={dhanlaxmiSignature} 
                                    alt="Authorized Signatory Signature" 
                                    className="w-72 h-24 object-contain absolute bottom-0 right-0 opacity-95" 
                                />
                            </div>
                            <div className="w-72 border-t border-slate-300 my-1"></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pr-4">Authorized Signatory</p>
                        </div>
                    </div>

                    {/* Note details */}
                    <div className="border-t border-slate-100 pt-4 mb-6">
                        <div className="flex justify-between items-end">
                            <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                <p className="text-slate-600 font-bold mb-1">Note:</p>
                                <p>1. Brokerage charged as per the agreed terms.</p>
                                <p>2. Payment to be made within T+1 settlement cycle.</p>
                                <p>3. This is a computer generated invoice, does not require physical signature.</p>
                            </div>
                            {/* <p className="text-xs font-serif italic font-bold text-slate-800 uppercase tracking-wide">
                                Thank You For Trading With Us!
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Footer Solid Strip */}
                {/* <div className="bg-[#0f172a] text-white px-8 py-4 flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">verified</span>
                        <span>SEBI REGISTERED BROKER - INZ000123456</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">groups</span>
                        <span>MEMBER - NSE | BSE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                        <span>SUPPORT - +91 98765 43210</span>
                    </div>
                </div> */}
            </div>

            {/* Post-Generation Debug Info (small) */}
            <div className="max-w-4xl mx-auto mt-4 text-[10px] text-gray-400 text-center opacity-70 bg-gray-50 p-2 rounded border border-gray-100 print:hidden">
                <div>API Status: {fetchStatus} | Client ID: {customerId}</div>
                <div>Filter Info: Total {filterStats.total} | Range: {filterStats.range} | Matched: {filterStats.matched}</div>
                {orders.length > 0 && filterStats.matched === 0 && (
                    <div className="text-red-400 font-bold mt-1">
                        TIP: Orders found on server, but skipped by Date Filter. Check dates carefully!
                    </div>
                )}
            </div>
        </div>
    );
}
