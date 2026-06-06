import { jsPDF } from "jspdf";
import { Video, VideoAnalysis, KeyFrame } from "@/types";

export class ReportExporter {
  private static formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  static exportToJSON(video: Video, analysis: VideoAnalysis, frames: KeyFrame[]) {
    const data = {
      video,
      analysis,
      frames,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viddy-analysis-${video.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportToCSV(analysis: VideoAnalysis) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Start Time (Seconds),Timestamp,Text\n";

    analysis.transcript.forEach((seg) => {
      const timeStr = this.formatTime(seg.start);
      // Escape quotes in text
      const cleanText = seg.text.replace(/"/g, '""');
      csvContent += `${seg.start},${timeStr},"${cleanText}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `viddy-transcript-${analysis.videoId}.csv`;
    a.click();
  }

  static exportToMarkdown(video: Video, analysis: VideoAnalysis) {
    const md = `# Viddy Analysis: ${video.title}
---
**Original Link:** ${video.sourceUrl}
**Duration:** ${this.formatTime(video.duration)}
**Analyzed On:** ${new Date(video.createdAt).toLocaleDateString()}

## Executive Summary
${analysis.summary}

## In-depth Technical Analysis
${analysis.detailedSummary}

## Key Chapter Breakdowns
${analysis.chapters.map((ch) => `- **${this.formatTime(ch.timestamp)}** - ${ch.label}`).join("\n")}

## Major Key Insights
${analysis.keyPoints
  .map(
    (kp) =>
      `### [${this.formatTime(kp.timestamp)}] ${kp.label}\n${kp.description}${
        kp.imageUrl ? `\n\n![Key Frame](${kp.imageUrl})` : ""
      }`
  )
  .join("\n\n")}

## Extracted Links & References
${analysis.urls.map((u) => `- **[${u.label}](${u.url})** mentioned around ${this.formatTime(u.timestamp || 0)}`).join("\n")}

## Extracted Named Entities
${analysis.entities.map((e) => `- **${e.name}** (${e.type}): mentioned ${e.count} times`).join("\n")}
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `viddy-report-${video.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportToPDF(video: Video, analysis: VideoAnalysis, frames: KeyFrame[]) {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 30;

    const addHeader = (title: string) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(79, 70, 229); // #4F46E5 Indigo
      doc.text(title, margin, y);
      y += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 25;
      }
    };

    // --- PAGE 1: TITLE & COVER PAGE ---
    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(15, 23, 42); // slate-900
    const titleLines = doc.splitTextToSize(video.title, pageWidth - 2 * margin);
    doc.text(titleLines, margin, y + 20);
    y += 20 + titleLines.length * 10;

    // Subtitle
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("AI Video Analysis & Structured Intelligence Report", margin, y);
    y += 15;

    // Stats Box
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(margin, y, pageWidth - 2 * margin, 45, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    
    doc.text(`Duration:`, margin + 10, y + 12);
    doc.setFont("Helvetica", "normal");
    doc.text(`${this.formatTime(video.duration)}`, margin + 50, y + 12);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Analyzed On:`, margin + 10, y + 22);
    doc.setFont("Helvetica", "normal");
    doc.text(`${new Date(video.createdAt).toLocaleString()}`, margin + 50, y + 22);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Source Link:`, margin + 10, y + 32);
    doc.setFont("Helvetica", "normal");
    const cleanUrl = video.sourceUrl.length > 50 ? video.sourceUrl.substring(0, 50) + "..." : video.sourceUrl;
    doc.text(cleanUrl, margin + 50, y + 32);
    
    y += 65;

    // Executive Summary
    addHeader("Executive Summary");
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(analysis.summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 6 + 15;

    // --- PAGE 2: IN-DEPTH SUMMARY & CHAPTERS ---
    checkPageBreak(80);
    if (y > 25) {
      doc.addPage();
      y = 25;
    }

    addHeader("Chapters & Key Moments");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    
    analysis.chapters.forEach((ch) => {
      checkPageBreak(12);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(this.formatTime(ch.timestamp), margin, y);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(ch.label, margin + 25, y);
      y += 8;
    });

    y += 12;

    // --- KEY INSIGHTS ---
    checkPageBreak(50);
    addHeader("Key Insights Extracted");
    
    analysis.keyPoints.forEach((kp) => {
      checkPageBreak(25);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${this.formatTime(kp.timestamp)}] ${kp.label}`, margin, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const kpDescLines = doc.splitTextToSize(kp.description, pageWidth - 2 * margin);
      doc.text(kpDescLines, margin, y);
      y += kpDescLines.length * 5 + 8;
    });

    // Save
    doc.save(`viddy-analysis-report-${video.id}.pdf`);
  }
}
