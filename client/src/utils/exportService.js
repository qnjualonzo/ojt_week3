import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const generatePDF = (activities, username) => {
  try {
    if (!activities || activities.length === 0) {
      alert("No tasks to export.");
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(40, 44, 52);
    doc.text("Progress Report", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Student/User: ${username}`, 14, 30);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, 35);

    const tableColumn = ["Task", "Details", "Deadline", "Status"];
    const tableRows = activities.map(task => [
      task.title,
      task.description || "N/A",
      task.deadline ? new Date(task.deadline).toLocaleDateString() : "No Date",
      task.drive_link ? "Completed (File Attached)" : "Pending"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] } 
    });

    doc.save(`${username}_Progress_Report.pdf`);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Failed to generate PDF report. Please try again.");
  }
};

export const generateExcel = (activities, username) => {
  try {
    if (!activities || activities.length === 0) {
      alert("No tasks to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(activities);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, `${username}_OJT_Data.xlsx`);
  } catch (error) {
    console.error("Excel generation failed:", error);
    alert("Failed to generate Excel file. Please try again.");
  }
};