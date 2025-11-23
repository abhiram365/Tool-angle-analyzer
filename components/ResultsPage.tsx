
import React, { useState } from 'react';
import { Header } from './Header';
import { AnalysisResults } from './AnalysisResults';
import type { AnalysisReport } from '../types';
import { RestartIcon } from './icons/RestartIcon';
import { PrintIcon } from './icons/PrintIcon';
import { WordIcon } from './icons/WordIcon';
import { ExcelIcon } from './icons/ExcelIcon';
import { CalibrationTool } from './CalibrationTool';
import { checkCompliance, getStandardRange } from '../services/standardsData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Let TypeScript know that these libraries are loaded globally from the HTML
declare const docx: any;
declare const XLSX: any;


interface ResultsPageProps {
    reports: AnalysisReport[];
    analysisTime: number;
    onReset: () => void;
    threeDModelUrl: string | null; // New prop for 3D model URL
    onShowHistory: () => void;
}

export default function ResultsPage({ reports: initialReports, analysisTime, onReset, threeDModelUrl, onShowHistory }: ResultsPageProps) {
  const [reports, setReports] = useState(initialReports);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationOffset, setCalibrationOffset] = useState(0);

  const handleExportWord = async () => {
    if (!reports || reports.length === 0) return;
    if (typeof docx === 'undefined') {
        alert('Word export library not loaded. Please check your internet connection.');
        return;
    }

    const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableCell, TableRow, WidthType, HeadingLevel, AlignmentType, PageBreak } = docx;

    const generateReportContent = async (report: AnalysisReport, index: number) => {
        const content: any[] = [
            new Paragraph({ text: `Report for Image ${index + 1}`, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
        ];

        if (report.error) {
            content.push(new Paragraph({ children: [new TextRun({ text: `Error: ${report.error}`, color: 'ff0000', bold: true })] }));
            return content;
        }
        
        if (!report.results) {
            content.push(new Paragraph("No analysis results for this image."));
            return content;
        }

        if (report.imagePreviewUrl) {
            try {
                const img = new Image();
                img.src = report.imagePreviewUrl;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                });
                const imgBase64 = report.imagePreviewUrl.split(',')[1];
                const imageBuffer = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                const docxWidth = 550;
                const docxHeight = docxWidth / aspectRatio;

                content.push(new Paragraph({
                    children: [new ImageRun({ data: imageBuffer, transformation: { width: docxWidth, height: docxHeight } })],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }));
            } catch (e) {
                console.error("Could not load image for Word export", e);
                content.push(new Paragraph({ children: [new TextRun({ text: "(Image could not be loaded for export)", color: 'ff0000' })] }));
            }
        }

        content.push(new Paragraph({ text: "Results Summary", heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));

        const tableHeader = new TableRow({
            children: [
                new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Angle Name", bold: true })] })] }),
                new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Measured", bold: true })] })] }),
                new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "ASME Standard", bold: true })] })] }),
                new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Confidence", bold: true })] })] }),
            ],
        });

        const dataRows = report.results.map(result => new TableRow({
            children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: result.isCompliant ? 'Compliant' : 'Deviation', color: result.isCompliant ? '22c55e' : 'fb923c' })]})] }),
                new TableCell({ children: [new Paragraph(result.angleName)] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${result.measuredValue.toFixed(1)}°`, bold: true, color: result.isCompliant ? '22c55e' : 'fb923c' })]})] }),
                new TableCell({ children: [new Paragraph(result.standard)] }),
                new TableCell({ children: [new Paragraph(result.confidence)] }),
            ],
        }));

        content.push(new Table({ rows: [tableHeader, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }));

        const recommendationResults = report.results.filter(r => !r.isCompliant || r.confidence !== 'High');
        if (recommendationResults.length > 0) {
            content.push(new Paragraph({ text: "Adjustment Recommendations & Notes", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }));
            recommendationResults.forEach(result => {
                if(result.recommendation) {
                    content.push(new Paragraph({
                        children: [new TextRun({ text: `${result.angleName} Note`, bold: true })],
                        spacing: { before: 200 }
                    }));
                    content.push(new Paragraph({
                        children: [new TextRun({ text: result.recommendation })],
                        indent: { left: 400 }
                    }));
                }
            });
        }
        
        return content;
    };

    const docChildren: any[] = [];
    for (let i = 0; i < reports.length; i++) {
        const reportContent = await generateReportContent(reports[i], i);
        docChildren.push(...reportContent);
        if (i < reports.length - 1) {
            docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
    }
    
    const doc = new Document({ sections: [{ children: docChildren }] });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-reports.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!reports || reports.length === 0) return;
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded. Please check your internet connection.');
        return;
    }

    const workbook = XLSX.utils.book_new();
    reports.forEach((report, index) => {
      const sheetName = `Report ${index + 1}`;
      let worksheetData;

      if (report.error) {
        worksheetData = [['Error:'], [report.error]];
      } else if (report.results) {
        const header = ["Status", "Angle Name", "Measured (°)", "ASME Standard", "Confidence", "Recommendation/Notes"];
        const data = report.results.map(res => [
            res.isCompliant ? "Compliant" : "Deviation",
            res.angleName,
            res.measuredValue,
            res.standard,
            res.confidence,
            res.recommendation || ""
        ]);
        worksheetData = [header, ...data];
      } else {
        worksheetData = [["No results for this image."]];
      }
      
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      worksheet['!cols'] = [ {wch:12}, {wch:25}, {wch:12}, {wch:20}, {wch:12}, {wch:60} ];
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, "analysis-reports.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    reports.forEach((report, index) => {
        if (index > 0) doc.addPage();

        // Header
        doc.setFillColor(251, 146, 60); // Orange
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("Cutting Tool Inspector AI - Analysis Report", 14, 13);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`File: ${report.fileName || 'Untitled'}`, 14, 30);
        doc.text(`Date: ${new Date(report.timestamp).toLocaleDateString()}`, 14, 36);
        
        if (report.imagePreviewUrl) {
            try {
                // Add image
                const imgProps = doc.getImageProperties(report.imagePreviewUrl);
                const pdfWidth = 100;
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(report.imagePreviewUrl, 'JPEG', 14, 45, pdfWidth, pdfHeight);
                
                // Move cursor down
                let currentY = 45 + pdfHeight + 10;
                
                if (report.results) {
                    const tableData = report.results.map(res => [
                        res.isCompliant ? "Compliant" : "Deviation",
                        res.angleName,
                        `${res.measuredValue.toFixed(1)}°`,
                        res.standard,
                        res.confidence
                    ]);

                    autoTable(doc, {
                        startY: currentY,
                        head: [['Status', 'Angle Name', 'Measured', 'Standard', 'Confidence']],
                        body: tableData,
                        theme: 'grid',
                        headStyles: { fillColor: [249, 115, 22] }, // Orange header
                    });
                    
                    const finalY = (doc as any).lastAutoTable.finalY || currentY;
                    
                    // Add recommendations
                    const issues = report.results.filter(r => !r.isCompliant);
                    if (issues.length > 0) {
                         doc.setFontSize(14);
                         doc.text("Recommendations", 14, finalY + 15);
                         doc.setFontSize(10);
                         
                         let y = finalY + 25;
                         issues.forEach(issue => {
                             if (issue.recommendation) {
                                 const splitText = doc.splitTextToSize(`${issue.angleName}: ${issue.recommendation}`, 180);
                                 doc.text(splitText, 14, y);
                                 y += (splitText.length * 5) + 5;
                             }
                         });
                    }
                }

            } catch (e) {
                console.error("Error adding image to PDF", e);
            }
        }
    });

    doc.save("tool-analysis-report.pdf");
  };

  const handleCalibration = (offset: number) => {
    setIsCalibrating(false);
    setCalibrationOffset(offset);
    
    // Apply offset to all reports
    const updatedReports = reports.map(report => {
        if (!report.results) return report;
        
        const updatedResults = report.results.map(result => {
            const original = result.originalValue !== undefined ? result.originalValue : result.measuredValue;
            const newVal = original + offset;
            
            // Re-check compliance
            const standardRange = getStandardRange(result.angleName, "HSS"); // Default material
            const compliant = checkCompliance(result.angleName, newVal, "HSS");
            
            let recommendation = "";
            if (!compliant) {
                 if (newVal < parseFloat(standardRange.split('-')[0])) {
                    recommendation = `Value is below standard (${standardRange}). Consider increasing the angle.`;
                } else {
                    recommendation = `Value is above standard (${standardRange}). Consider decreasing the angle.`;
                }
            } else {
                recommendation = "";
            }

            return {
                ...result,
                measuredValue: newVal,
                originalValue: original,
                isCompliant: compliant,
                recommendation,
                standard: standardRange
            };
        });

        return { ...report, results: updatedResults };
    });
    
    setReports(updatedReports);
  };


  return (
    <div className="min-h-screen font-sans text-zinc-800 dark:text-zinc-200">
      <div className="no-print">
        <Header onShowHistory={onShowHistory} onGoHome={onReset} />
      </div>
      <main className="container mx-auto px-4 py-8 printable-area">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                 <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">
                    Analysis Complete
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Analysis of {reports.length} image(s) completed in {(analysisTime / 1000).toFixed(2)} seconds.
                    {calibrationOffset !== 0 && <span className="ml-2 text-orange-500">(Calibrated: {calibrationOffset > 0 ? '+' : ''}{calibrationOffset.toFixed(1)}°)</span>}
                </p>
            </div>
             <div className="no-print flex items-center gap-2 flex-wrap">
                <button
                    onClick={onReset}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                    <RestartIcon />
                    Start New Analysis
                </button>
                 <div className="flex items-center gap-2">
                    {reports[0]?.imagePreviewUrl && (
                        <button 
                            onClick={() => setIsCalibrating(true)}
                            className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-bold py-2 px-3 rounded-lg transition-colors duration-300"
                            title="Calibrate Tool Angles"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </button>
                    )}
                    <button onClick={handleExportPDF} title="Generate PDF Report" className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-bold py-2 px-3 rounded-lg transition-colors duration-300">
                        <span className="font-bold text-sm">PDF</span>
                    </button>
                    <button onClick={handleExportWord} title="Export to Word (.docx)" className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-bold py-2 px-3 rounded-lg transition-colors duration-300">
                        <WordIcon />
                    </button>
                    <button onClick={handleExportExcel} title="Export to Excel (.xlsx)" className="flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-bold py-2 px-3 rounded-lg transition-colors duration-300">
                        <ExcelIcon />
                    </button>
                </div>
            </div>
        </div>

        {reports.map((report, index) => (
            <div key={index} className="mb-16 last:mb-0 p-6 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-2xl font-semibold text-orange-500 dark:text-orange-400 mb-6 pb-4 border-b-2 border-zinc-200 dark:border-zinc-800">
                  Report {index + 1} {(report as any).fileName ? ` - ${(report as any).fileName}` : ''}
                </h2>
                <AnalysisResults 
                    results={report.results} 
                    error={report.error} 
                    imagePreviewUrl={report.imagePreviewUrl} 
                    threeDModelUrl={threeDModelUrl}
                />
            </div>
        ))}
        
        {isCalibrating && reports[0]?.imagePreviewUrl && (
            <CalibrationTool 
                src={reports[0].imagePreviewUrl!} 
                onConfirmCalibration={handleCalibration}
                onCancel={() => setIsCalibrating(false)}
            />
        )}
      </main>
    </div>
  );
}
