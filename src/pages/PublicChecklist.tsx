import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, Camera, Download } from "lucide-react";
import jsPDF from 'jspdf';

const PublicChecklist = () => {
  const { token } = useParams<{ token: string }>();

  const { data: checklistData, isLoading, error } = useQuery({
    queryKey: ['public-checklist', token],
    queryFn: async () => {
      if (!token) throw new Error('Token não fornecido');

      // Get checklist by public token
      const { data: linkData, error: linkError } = await supabase
        .from('checklist_public_links')
        .select('checklist_id')
        .eq('public_token', token)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        throw new Error('Link público não encontrado ou expirado');
      }

      // Get checklist with items
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists')
        .select(`
          *,
          mechanic:profiles!checklists_mechanic_id_fkey(full_name)
        `)
        .eq('id', linkData.checklist_id)
        .single();

      if (checklistError) throw checklistError;

      // Get checklist items
      const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', linkData.checklist_id)
        .order('category', { ascending: true })
        .order('item_name', { ascending: true });

      if (itemsError) throw itemsError;

      return { checklist, items: items || [] };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  if (error || !checklistData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Checklist não encontrado</h1>
          <p className="text-muted-foreground">O link pode ter expirado ou não ser válido.</p>
        </div>
      </div>
    );
  }

  const { checklist, items } = checklistData;
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Cancelado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Parse images from video_url field
  const parseImages = (videoUrl: string | null) => {
    if (!videoUrl) return [];
    
    try {
      const parsed = JSON.parse(videoUrl);
      return Array.isArray(parsed) ? parsed : [videoUrl];
    } catch {
      return [videoUrl];
    }
  };

  const images = parseImages(checklist.video_url);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = 20;

 // Company header (centered)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const companyName = settings?.company_name || 'Nome da Empresa';
    doc.text(companyName, pageWidth/2, yPosition, { align: 'center' });
    
    yPosition += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (settings?.company_address) {
      doc.text(settings.company_address, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 6;
    }
    
    if (settings?.company_phone) {
      doc.text(`Telefone: ${settings.company_phone}`, pageWidth/2, yPosition, { align: 'center' });
      yPosition += 6;
    }

    yPosition += 10;
    
    // Title CHECKLIST (centered and bold)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CHECKLIST DE INSPEÇÃO', pageWidth/2, yPosition, { align: 'center' });
    
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
    doc.text(`Nome: ${checklist.customer_name}`, leftColX, yPosition);
    yPosition += 6;
    
    // Add some spacing for additional client info if needed
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

    // Move to next section after both columns
    yPosition = Math.max(clientEndY, rightYPosition + 10);

    // Items table
    doc.setFont('helvetica', 'bold');
    doc.text('Itens de Inspeção:', leftColX, yPosition);
    yPosition += 10;

    // Table headers with borders
    const tableY = yPosition;
    const tableHeight = 8;
    const colWidths = [20, 80, 40, 35];
    const colPositions = [leftColX, leftColX + colWidths[0], leftColX + colWidths[0] + colWidths[1], leftColX + colWidths[0] + colWidths[1] + colWidths[2]];
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
    doc.text('Status', colPositions[0] + 2, tableY + 5);
    doc.text('Item', colPositions[1] + 2, tableY + 5);
    doc.text('Categoria', colPositions[2] + 2, tableY + 5);
    doc.text('Observação', colPositions[3] + 2, tableY + 5);

    yPosition = tableY + tableHeight;

    // Data rows
    doc.setFont('helvetica', 'normal');
    items.forEach((item: any) => {
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
      doc.text(item.checked ? 'Check' : '○', colPositions[0] + 2, rowY + 5);
      doc.text(item.item_name.substring(0, 35), colPositions[1] + 2, rowY + 5);
      doc.text(item.category.substring(0, 18), colPositions[2] + 2, rowY + 5);
      doc.text((item.observation || '').substring(0, 22), colPositions[3] + 2, rowY + 5);
      
      yPosition += tableHeight;
    });

    yPosition += 15;

    // General observations
    if (checklist.general_observations) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Observações Gerais:', leftColX, yPosition);
      yPosition += 10;
      
      doc.setFont('helvetica', 'normal');
      const splitObservations = doc.splitTextToSize(checklist.general_observations, pageWidth - 2*margin);
      doc.text(splitObservations, leftColX, yPosition);
    }

    // Footer with date and checklist info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Checklist: ${checklist.vehicle_name} - ${checklist.plate}`, leftColX, pageHeight - 15);
    doc.text(`Data: ${new Date(checklist.created_at).toLocaleDateString('pt-BR')}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

    const fileName = `checklist-${checklist.plate}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Relatório de Inspeção</h1>
          <Badge variant="outline" className={`${getStatusColor(checklist.status)} text-lg px-4 py-2`}>
            {checklist.status}
          </Badge>
        </div>

        {/* Checklist Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informações do Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Cliente:</span> {checklist.customer_name}
              </div>
              <div>
                <span className="font-medium">Veículo:</span> {checklist.vehicle_name}
              </div>
              <div>
                <span className="font-medium">Placa:</span> {checklist.plate}
              </div>
              <div>
                <span className="font-medium">Mecânico:</span> {checklist.mechanic?.full_name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Data:</span> {format(new Date(checklist.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso da Inspeção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Itens verificados</span>
                  <span>{checkedItems} de {totalItems}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  {progress.toFixed(1)}% concluído
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Photos Section */}
        {images.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Fotos da Inspeção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`Foto da inspeção ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(imageUrl, '_blank')}
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', imageUrl);
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items by Category */}
        <div className="space-y-6">
          {Object.entries(itemsByCategory).map(([category, categoryItems]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline" className="text-sm">
                    {categoryItems.filter(item => item.checked).length}/{categoryItems.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {item.checked ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.item_name}</span>
                          <Badge 
                            variant={item.checked ? "default" : "destructive"} 
                            className="text-xs px-2 py-0.5 flex-shrink-0"
                          >
                            {item.checked ? 'Verificado' : 'Não Verificado'}
                          </Badge>
                        </div>
                        {item.observation && (
                          <div className="text-sm text-muted-foreground mt-1 break-words overflow-hidden">
                            <span className="font-medium">Observação:</span> {item.observation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* General Observations */}
        {checklist.general_observations && (
          <Card>
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap break-words overflow-hidden">{checklist.general_observations}</p>
            </CardContent>
          </Card>
        )}

        {/* PDF Download Button */}
        <div className="flex justify-center pb-8">
          <Button onClick={generatePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicChecklist;
