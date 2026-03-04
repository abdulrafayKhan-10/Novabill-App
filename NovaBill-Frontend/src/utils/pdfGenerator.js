import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoiceData) => {
    const doc = new jsPDF("p", "pt", "a4");

    // Document Styling Options
    const primaryColor = [79, 70, 229]; // Indigo-600
    const textColor = [51, 65, 85]; // Slate-700
    const lightGray = [241, 245, 249]; // Slate-100

    // Header section
    doc.setFontSize(26);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 40, 60);

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "normal");

    // Company details (Mockup)
    doc.text("NovaBill App", 40, 80);
    doc.text("123 Business Avenue", 40, 95);
    doc.text("Suite 400", 40, 110);
    doc.text("support@novabill.app", 40, 125);

    // Invoice Details (Right Aligned)
    const rightMargin = 555;
    doc.setFont("helvetica", "bold");

    const invNumber = invoiceData.invoiceNumber || "AUTO-GENERATED";
    doc.text(`Invoice Number:`, rightMargin - 140, 60);
    doc.text(`Issue Date:`, rightMargin - 140, 75);
    doc.text(`Due Date:`, rightMargin - 140, 90);

    doc.setFont("helvetica", "normal");
    doc.text(invNumber, rightMargin, 60, { align: "right" });

    // Format dates manually to avoid locale string bugs
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
    };

    doc.text(formatDate(invoiceData.invoiceDate), rightMargin, 75, { align: "right" });
    doc.text(formatDate(invoiceData.dueDate), rightMargin, 90, { align: "right" });

    // Bill To Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 40, 160);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Valued Client", 40, 175);
    // (In a full app we'd map customer details here, for now it's placeholder)
    doc.text("Client Address Line 1", 40, 190);
    doc.text("Client City, Zip Code", 40, 205);

    // Divider Line
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(1);
    doc.line(40, 225, 555, 225);

    // Table Generation
    const tableHead = [["Item", "Description", "Price", "Qty", "Total"]];
    const tableBody = invoiceData.items.map(item => [
        item.name || `Item #${item.itemId}`, // name will be there if passed from InvoicesPage
        item.description || "-",
        `$${Number(item.unitPrice || 0).toFixed(2)}`,
        item.quantity || 1,
        `$${(Number(item.unitPrice || 0) * Number(item.quantity || 1)).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: 245,
        head: tableHead,
        body: tableBody,
        theme: "striped",
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "left"
        },
        columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 195 },
            2: { cellWidth: 70, halign: "right" },
            3: { cellWidth: 50, halign: "right" },
            4: { cellWidth: 80, halign: "right" }
        },
        bodyStyles: {
            textColor: textColor,
        },
        alternateRowStyles: {
            fillColor: lightGray
        },
        margin: { top: 40, left: 40, right: 40 }
    });

    // Totals Calculation Area
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 30 : 350;

    // Need to cleanly compute totals incase quantities changed
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (Number(item.unitPrice || 0) * Number(item.quantity || 1)), 0);
    const paid = Number(invoiceData.paidAmount || 0);
    const balance = Math.max(0, subtotal - paid);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", rightMargin - 60, finalY, { align: "right" });
    doc.text("Paid Amount:", rightMargin - 60, finalY + 15, { align: "right" });

    doc.setFontSize(12);
    doc.text("Balance Due:", rightMargin - 60, finalY + 35, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`$${subtotal.toFixed(2)}`, rightMargin, finalY, { align: "right" });
    doc.text(`-$${paid.toFixed(2)}`, rightMargin, finalY + 15, { align: "right" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor); // Indigo
    doc.text(`$${balance.toFixed(2)}`, rightMargin, finalY + 35, { align: "right" });

    // Notes area
    if (invoiceData.notes) {
        doc.setFontSize(10);
        doc.setTextColor(...textColor);
        doc.text("Notes / Terms:", 40, finalY);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139); // Slate-500

        const splitNotes = doc.splitTextToSize(invoiceData.notes, 280);
        doc.text(splitNotes, 40, finalY + 15);
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Generated by NovaBill - Premium Invoice Management", 40, pageHeight - 30);

    // Save Document
    doc.save(`Invoice_${invNumber}.pdf`);
    return true;
};
