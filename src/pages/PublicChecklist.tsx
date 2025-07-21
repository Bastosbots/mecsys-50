
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Clock, Camera } from "lucide-react";

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
              {checklist.completed_at && (
                <div>
                  <span className="font-medium">Concluído em:</span> {format(new Date(checklist.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </div>
              )}
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{item.item_name}</span>
                          <Badge 
                            variant={item.checked ? "default" : "destructive"} 
                            className="text-xs px-2 py-0.5"
                          >
                            {item.checked ? 'Verificado' : 'Não Verificado'}
                          </Badge>
                        </div>
                        {item.observation && (
                          <div className="text-sm text-muted-foreground mt-1">
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
              <p className="text-sm whitespace-pre-wrap">{checklist.general_observations}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicChecklist;
