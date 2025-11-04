import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

interface ExportProgressReportProps {
  stats: {
    totalSwings: number;
    avgHitsScore: number;
    improvement: number;
    bestPillar: string;
    focusArea: string;
  };
  batMetrics: any;
  bodyMetrics: any;
  ballMetrics: any;
  brainMetrics: any;
  goals?: Array<{
    metric_name: string;
    current_value: number;
    target_value: number;
    unit: string;
    status: string;
  }>;
}

export function ExportProgressReport({
  stats,
  batMetrics,
  bodyMetrics,
  ballMetrics,
  brainMetrics,
  goals = [],
}: ExportProgressReportProps) {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageWidth, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('H.I.T.S. Progress Report', pageWidth / 2, 20, { align: 'center' });
      
      // Date
      pdf.setFontSize(10);
      pdf.text(new Date().toLocaleDateString(), pageWidth - 20, 10, { align: 'right' });
      
      yPosition = 40;
      pdf.setTextColor(0, 0, 0);

      // Summary Stats Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Performance Summary', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const summaryData = [
        ['Total Swings Analyzed', stats.totalSwings.toString()],
        ['Average H.I.T.S. Score', stats.avgHitsScore.toString()],
        ['Improvement', `${stats.improvement > 0 ? '+' : ''}${stats.improvement} points`],
        ['Strongest Pillar', stats.bestPillar],
        ['Focus Area', stats.focusArea],
      ];

      summaryData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label + ':', 25, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 80, yPosition);
        yPosition += 7;
      });

      yPosition += 5;

      // Bat Metrics Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🏏 Bat Metrics', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const batData = [
        ['Bat Speed', `${batMetrics.batSpeed} mph`, `Grade: ${batMetrics.batSpeedGrade}`],
        ['Attack Angle', `${batMetrics.attackAngle}°`, `Grade: ${batMetrics.attackAngleGrade}`],
        ['Time in Zone', `${batMetrics.timeInZone}s`, `Grade: ${batMetrics.timeInZoneGrade}`],
        ['Personal Best', `${batMetrics.personalBest} mph`, ''],
      ];

      batData.forEach(([metric, value, grade]) => {
        pdf.text(metric, 25, yPosition);
        pdf.text(value, 80, yPosition);
        if (grade) pdf.text(grade, 130, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Body Metrics Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('💪 Body Metrics', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const bodyData = [
        ['Sequence Efficiency', `${bodyMetrics.sequenceEfficiency}%`, `Grade: ${bodyMetrics.sequenceGrade}`],
        ['Tempo Ratio', `${bodyMetrics.tempoRatio}:1`, `Grade: ${bodyMetrics.tempoGrade}`],
        ['Power Distribution', `L:${bodyMetrics.legsPower}% C:${bodyMetrics.corePower}% A:${bodyMetrics.armsPower}%`, ''],
        ['Load Time', `${bodyMetrics.loadTime}s`, ''],
        ['Launch Time', `${bodyMetrics.launchTime}s`, ''],
      ];

      bodyData.forEach(([metric, value, grade]) => {
        pdf.text(metric, 25, yPosition);
        pdf.text(value, 80, yPosition);
        if (grade) pdf.text(grade, 130, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Ball Metrics Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('⚾ Ball Metrics', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const ballData = [
        ['Exit Velocity', `${ballMetrics.exitVelocity} mph`, `Grade: ${ballMetrics.exitVelocityGrade}`],
        ['Hard Hit %', `${ballMetrics.hardHitPercentage}%`, `Grade: ${ballMetrics.hardHitGrade}`],
        ['Launch Angle', `FB:${ballMetrics.flyBallPercentage}% LD:${ballMetrics.lineDrivePercentage}%`, `Grade: ${ballMetrics.launchAngleGrade}`],
        ['Total Swings', ballMetrics.totalSwings.toString(), ''],
      ];

      ballData.forEach(([metric, value, grade]) => {
        pdf.text(metric, 25, yPosition);
        pdf.text(value, 80, yPosition);
        if (grade) pdf.text(grade, 130, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Brain Metrics Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('🧠 Brain Metrics', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const brainData = [
        ['Reaction Time', `${brainMetrics.reactionTime} ms`, `Grade: ${brainMetrics.reactionTimeGrade}`],
        ['Swing Decision', `${brainMetrics.goodSwingsPercentage}%`, `Grade: ${brainMetrics.swingDecisionGrade}`],
        ['Chase Rate', `${brainMetrics.chaseRate}%`, ''],
        ['Focus Score', `${brainMetrics.focusScore}`, `Grade: ${brainMetrics.focusGrade}`],
      ];

      brainData.forEach(([metric, value, grade]) => {
        pdf.text(metric, 25, yPosition);
        pdf.text(value, 80, yPosition);
        if (grade) pdf.text(grade, 130, yPosition);
        yPosition += 6;
      });

      // Goals Section
      if (goals.length > 0) {
        yPosition += 5;
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🎯 Active Goals', 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        goals.slice(0, 10).forEach((goal) => {
          const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
          pdf.text(goal.metric_name, 25, yPosition);
          pdf.text(`${goal.current_value} → ${goal.target_value} ${goal.unit}`, 80, yPosition);
          pdf.text(`${progress.toFixed(0)}%`, 140, yPosition);
          yPosition += 6;
          
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }

      // Footer
      const footerY = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by H.I.T.S. - Hitter Intelligence Training System', pageWidth / 2, footerY, { align: 'center' });

      // Save PDF
      const fileName = `HITS_Progress_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Report Downloaded!",
        description: "Your progress report has been saved as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={exporting}
      variant="outline"
      className="w-full"
    >
      {exporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export Progress Report
        </>
      )}
    </Button>
  );
}
