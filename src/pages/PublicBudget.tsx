import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Calendar, User, Car, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePageTitle } from "@/hooks/usePageTitle";
import jsPDF from 'jspdf';

const PublicBudget = () => {
  const { token } = useParams<{ token: string }>();

  const { data: budget, isLoading, error } = useQuery({
    queryKey: ['public-budget', token],
    queryFn: async () => {
      if (!token) throw new Error('Token não fornecido');

      // First, get the budget ID from the public link
      const { data: linkData, error: linkError } = await supabase
        .from('budget_public_links')
        .select('budget_id')
        .eq('public_token', token)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        throw new Error('Link público não encontrado ou expirado');
      }

      // Get the budget details
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', linkData.budget_id)
        .single();

      if (budgetError || !budgetData) {
        throw new Error('Orçamento não encontrado');
      }

      // Get the mechanic info separately
      const { data: mechanicData, error: mechanicError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', budgetData.mechanic_id)
        .single();

      // Get budget items
      const { data: itemsData, error: itemsError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('budget_id', linkData.budget_id)
        .order('created_at', { ascending: true });

      if (itemsError) {
        throw new Error('Erro ao carregar itens do orçamento');
      }

      return { 
        ...budgetData, 
        items: itemsData || [], 
        mechanic: mechanicData || null 
      };
    },
    enabled: !!token,
  });

  // Set dynamic page title based on budget data
  usePageTitle(budget ? `Orçamento ${budget.budget_number} - ${budget.customer_name || 'Cliente'}` : 'Orçamento Público');

  const downloadPDF = () => {
    if (!budget) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = 20;

    // Company header (centered)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('S. R. M. Servicos E Manutenção De Veiculos Ltda', pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Avenida 25 de Agosto, nº: 4702, Centro - Rolim de Moura - RO', pageWidth/2, yPosition, { align: 'center' });

    yPosition += 10;
    
    // Title ORÇAMENTO (centered and bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORÇAMENTO', pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 20;

    // Two column layout for client and vehicle info
    const leftColX = margin;
    const rightColX = pageWidth/2 + 10;
    
    // Client section (left)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', leftColX, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${budget.customer_name || 'Não informado'}`, leftColX, yPosition);
    yPosition += 6;
    
    doc.text(`Orçamento: ${budget.budget_number}`, leftColX, yPosition);
    yPosition += 6;
    
    // Add some spacing for additional client info if needed
    const clientEndY = yPosition + 10;

    // Vehicle section (right) - reset yPosition for right column
    let rightYPosition = yPosition - 20; // Start at same level as "Cliente:"
    
    doc.setFont('helvetica', 'bold');
    doc.text('Veículo:', rightColX, rightYPosition);
    rightYPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Modelo: ${budget.vehicle_name || 'Não informado'}`, rightColX, rightYPosition);
    rightYPosition += 6;
    
    doc.text(`Status: ${budget.status}`, rightColX, rightYPosition);
    rightYPosition += 6;
    
    doc.text(`Data: ${format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}`, rightColX, rightYPosition);
    rightYPosition += 6;

    // Move to next section after both columns
    yPosition = Math.max(clientEndY, rightYPosition + 10);

    // Items table
    doc.setFont('helvetica', 'bold');
    doc.text('Itens do Orçamento:', leftColX, yPosition);
    yPosition += 10;

    // Table headers with borders
    const tableY = yPosition;
    const tableHeight = 8;
    const colWidths = [70, 25, 25, 25, 30];
    const colPositions = [leftColX, leftColX + colWidths[0], leftColX + colWidths[0] + colWidths[1], leftColX + colWidths[0] + colWidths[1] + colWidths[2], leftColX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]];
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

    // Header background and borders
    doc.setFillColor(240, 240, 240);
    doc.rect(leftColX, tableY, tableWidth, tableHeight, 'F');
    
    // Header borders
    doc.setLineWidth(0.3);
    doc.rect(leftColX, tableY, tableWidth, tableHeight);
    colPositions.slice(1).forEach(pos => {
      doc.line(pos, tableY, pos, tableY + tableHeight);
    });

    // Header text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Serviço', colPositions[0] + 2, tableY + 5);
    doc.text('Qtd', colPositions[1] + 2, tableY + 5);
    doc.text('Valor Unit.', colPositions[2] + 2, tableY + 5);
    doc.text('Categoria', colPositions[3] + 2, tableY + 5);
    doc.text('Total', colPositions[4] + 2, tableY + 5);

    yPosition = tableY + tableHeight;

    // Data rows
    doc.setFont('helvetica', 'normal');
    if (budget.items && budget.items.length > 0) {
      budget.items.forEach((item: any) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 30;
        }

        const rowY = yPosition;
        
        // Row borders
        doc.rect(leftColX, rowY, tableWidth, tableHeight);
        colPositions.slice(1).forEach(pos => {
          doc.line(pos, rowY, pos, rowY + tableHeight);
        });

        // Row data
        doc.text(item.service_name.substring(0, 30), colPositions[0] + 2, rowY + 5);
        doc.text(item.quantity.toString(), colPositions[1] + 2, rowY + 5);
        doc.text(`R$ ${Number(item.unit_price).toFixed(2)}`, colPositions[2] + 2, rowY + 5);
        doc.text(item.service_category.substring(0, 12), colPositions[3] + 2, rowY + 5);
        doc.text(`R$ ${Number(item.total_price).toFixed(2)}`, colPositions[4] + 2, rowY + 5);
        
        yPosition += tableHeight;
      });
    }

    yPosition += 15;

    // Summary section
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo:', leftColX, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: R$ ${Number(budget.total_amount).toFixed(2)}`, leftColX, yPosition);
    yPosition += 6;

    if (budget.discount_amount > 0) {
      doc.text(`Desconto: R$ ${Number(budget.discount_amount).toFixed(2)}`, leftColX, yPosition);
      yPosition += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Final: R$ ${Number(budget.final_amount).toFixed(2)}`, leftColX, yPosition);
    yPosition += 15;

    // Observations
    if (budget.observations) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', leftColX, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'normal');
      const splitObservations = doc.splitTextToSize(budget.observations, pageWidth - 2*margin);
      doc.text(splitObservations, leftColX, yPosition);
    }

    // Footer with date and budget info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Orçamento: ${budget.budget_number}`, leftColX, pageHeight - 15);
    doc.text(`Data: ${format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

    const fileName = `orcamento-${budget.budget_number}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando orçamento...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Orçamento não encontrado</h1>
          <p className="text-muted-foreground">
            O link pode ter expirado ou não ser válido.
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'rejeitado':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Orçamento Público</h1>
          <p className="text-muted-foreground">
            Visualize os detalhes do orçamento abaixo
          </p>
        </div>

        <div id="budget-content" className="space-y-6">
          {/* Budget Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Orçamento {budget.budget_number}
                </CardTitle>
                <Badge className={getStatusColor(budget.status)}>
                  {budget.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{budget.customer_name || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Veículo</p>
                    <p className="font-medium">{budget.vehicle_name || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-medium">
                      {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mecânico</p>
                    <p className="font-medium">{budget.mechanic?.full_name || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Itens do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budget.items && budget.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budget.items.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.service_name}</TableCell>
                        <TableCell>{item.service_category}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          R$ {Number(item.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum item encontrado neste orçamento.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">
                  R$ {Number(budget.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {budget.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span className="font-medium">
                    - R$ {Number(budget.discount_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">
                  R$ {Number(budget.final_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          {budget.observations && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {budget.observations}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* PDF Download Button */}
        <div className="mt-8 text-center">
          <Button onClick={downloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicBudget;
