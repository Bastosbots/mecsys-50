
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Download, Printer } from "lucide-react";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useUpdateChecklist } from "@/hooks/useChecklists";
import { useAuth } from "@/hooks/useAuth";
import ChecklistProgress from "./checklist/ChecklistProgress";
import ChecklistItems from "./checklist/ChecklistItems";
import ChecklistInfo from "./checklist/ChecklistInfo";
import jsPDF from 'jspdf';

interface ChecklistViewerProps {
  checklist: any;
  onBack: () => void;
}

const ChecklistViewer = ({ checklist, onBack }: ChecklistViewerProps) => {
  const { data: items = [] } = useChecklistItems(checklist.id);
  const updateChecklistMutation = useUpdateChecklist();
  const { profile } = useAuth();

  const totalItems = items.length;
  const checkedItems = items.filter((item: any) => item.checked).length;
  const isAdmin = profile?.role === 'admin';

  const handleCompleteChecklist = async () => {
    try {
      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        status: 'Concluído',
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing checklist:', error);
    }
  };

  const generatePDF = (shouldPrint = false) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = 20;

    // Company header (centered)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const companyName = 'Checklist de Veículo';
    doc.text(companyName, pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Title CHECKLIST (centered and bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST DE INSPEÇÃO', pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Two column layout for client and vehicle info
    const leftColX = margin;
    const rightColX = pageWidth/2 + 10;
    
    // Client section (left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', leftColX, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${checklist.customer_name}`, leftColX, yPosition);
    yPosition += 6;
    
    const clientEndY = yPosition + 10;

    // Vehicle section (right) - reset yPosition for right column
    let rightYPosition = yPosition - 14; // Start at same level as "Cliente:"
    
    doc.setFont('helvetica', 'bold');
    doc.text('Veículo:', rightColX, rightYPosition);
    rightYPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Modelo: ${checklist.vehicle_name}`, rightColX, rightYPosition);
    rightYPosition += 6;
    doc.text(`Placa: ${checklist.plate}`, rightColX, rightYPosition);
    rightYPosition += 6;
    doc.text(`Status: ${checklist.status}`, rightColX, rightYPosition);
    rightYPosition += 6;

    // Move to next section after both columns
    yPosition = Math.max(clientEndY, rightYPosition + 10);

    // Progress section
    doc.setFont('helvetica', 'bold');
    doc.text('Progresso da Inspeção:', leftColX, yPosition);
    yPosition += 10;

    // Progress table with borders
    const progressY = yPosition;
    const progressHeight = 8;
    const progressWidth = pageWidth - 2 * margin;

    // Progress background and borders
    doc.setFillColor(240, 240, 240);
    doc.rect(leftColX, progressY, progressWidth, progressHeight, 'F');
    
    doc.setLineWidth(0.3);
    doc.rect(leftColX, progressY, progressWidth, progressHeight);

    // Progress text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const progressText = `Itens Verificados: ${checkedItems} de ${totalItems} (${totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0}% concluído)`;
    doc.text(progressText, leftColX + 2, progressY + 5);

    yPosition = progressY + progressHeight + 15;

    // Items table
    doc.setFont('helvetica', 'bold');
    doc.text('Itens de Inspeção:', leftColX, yPosition);
    yPosition += 10;

    // Table headers with borders
    const tableY = yPosition;
    const tableHeight = 8;
    const colWidths = [15, 60, 35, 65];
    const colPositions = [leftColX, leftColX + colWidths[0], leftColX + colWidths[0] + colWidths[1], leftColX + colWidths[0] + colWidths[1] + colWidths[2]];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Header background and borders
    doc.setFillColor(240, 240, 240);
    doc.rect(leftColX, tableY, tableWidth, tableHeight, 'F');
    
    doc.setLineWidth(0.3);
    doc.rect(leftColX, tableY, tableWidth, tableHeight);
    colPositions.slice(1).forEach(pos => {
      doc.line(pos, tableY, pos, tableY + tableHeight);
    });

    // Header text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Check', colPositions[0] + 2, tableY + 5);
    doc.text('Item', colPositions[1] + 2, tableY + 5);
    doc.text('Categoria', colPositions[2] + 2, tableY + 5);
    doc.text('Observação', colPositions[3] + 2, tableY + 5);

    yPosition = tableY + tableHeight;

    // Item rows
    doc.setFont('helvetica', 'normal');
    items.forEach((item: any) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      const rowY = yPosition;
      
      // Row borders
      doc.rect(leftColX, rowY, tableWidth, tableHeight);
      colPositions.slice(1).forEach(pos => {
        doc.line(pos, rowY, pos, rowY + tableHeight);
      });

      // Row data
      doc.text(item.checked ? 'Sim' : '', colPositions[0] + 6, rowY + 5);
      doc.text(item.item_name.substring(0, 25), colPositions[1] + 2, rowY + 5);
      doc.text(item.category.substring(0, 15), colPositions[2] + 2, rowY + 5);
      doc.text((item.observation || '').substring(0, 25), colPositions[3] + 2, rowY + 5);
      
      yPosition += tableHeight;
    });

    yPosition += 10;

    // General observations section
    if (checklist.general_observations && yPosition < pageHeight - 40) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações Gerais:', leftColX, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const splitObservations = doc.splitTextToSize(checklist.general_observations, pageWidth - 2 * margin);
      
      // Add border around observations
      const obsHeight = splitObservations.length * 5 + 6;
      doc.setFillColor(250, 250, 250);
      doc.rect(leftColX, yPosition - 2, tableWidth, obsHeight, 'F');
      doc.rect(leftColX, yPosition - 2, tableWidth, obsHeight);
      
      doc.text(splitObservations, leftColX + 2, yPosition + 3);
      yPosition += obsHeight + 10;
    }

    // Footer with date and checklist info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Checklist: ${checklist.vehicle_name} - ${checklist.plate}`, leftColX, pageHeight - 15);
    doc.text(`Data: ${new Date(checklist.created_at).toLocaleDateString('pt-BR')}`, pageWidth - margin, pageHeight - 15, { align: 'right' });
    
 

    // Generate filename
    const fileName = `checklist-${checklist.plate}-${new Date().toISOString().split('T')[0]}.pdf`;

    if (shouldPrint) {
      // Open print dialog
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    } else {
      // Download PDF
      doc.save(fileName);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border mobile-card-padding lg:px-6 mobile-header-height lg:py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button variant="outline" onClick={onBack} className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2">
              <ArrowLeft className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Voltar</span>
            </Button>
            <div>
              <h1 className="mobile-text-lg lg:text-2xl font-bold text-foreground">Visualizar Checklist</h1>
              <p className="mobile-text-xs lg:text-base text-muted-foreground">
                {checklist.vehicle_name} - {checklist.plate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Badge variant={checklist.completed_at ? "default" : "secondary"} className="mobile-text-xs lg:text-sm px-2 lg:px-4 py-1 lg:py-2">
              {checklist.completed_at ? 'Concluído' : 'Pendente'}
            </Badge>
            
            {/* PDF Download Button - Available for all users */}
            <Button 
              onClick={() => generatePDF(false)}
              variant="outline"
              className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="mobile-text-xs lg:text-sm">Baixar PDF</span>
            </Button>

            {/* PDF Print Button - Only available for admins */}
            {isAdmin && (
              <Button 
                onClick={() => generatePDF(true)}
                variant="outline"
                className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2"
              >
                <Printer className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="mobile-text-xs lg:text-sm">Imprimir</span>
              </Button>
            )}

            {/* Only show complete button for admins and when status is "Em Andamento" */}
            {isAdmin && checklist.status === 'Em Andamento' && (
              <Button 
                onClick={handleCompleteChecklist}
                disabled={updateChecklistMutation.isPending}
                className="mobile-btn lg:h-10 lg:px-4 flex items-center gap-1 lg:gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="mobile-text-xs lg:text-sm">Concluir</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mobile-card-padding lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
          {/* Checklist Items */}
          <div className="lg:col-span-2">
            <ChecklistProgress checkedItems={checkedItems} totalItems={totalItems} />
            <ChecklistItems items={items} />
          </div>

          {/* Sidebar - Info */}
          <ChecklistInfo checklist={checklist} />
        </div>
      </div>
    </div>
  );
};

export default ChecklistViewer;
