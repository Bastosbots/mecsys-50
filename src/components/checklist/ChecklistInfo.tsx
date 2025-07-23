
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, FileText, User, Calendar, Video } from "lucide-react";

interface ChecklistInfoProps {
  checklist: any;
}

const ChecklistInfo = ({ checklist }: ChecklistInfoProps) => {
  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Vehicle Information */}
      <Card>
        <CardHeader className="mobile-card-padding lg:p-6">
          <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
            <Car className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            Informações do Veículo
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-card-padding lg:p-6 space-y-2 lg:space-y-3">
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Veículo</span>
            <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.vehicle_name}</p>
          </div>
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Placa</span>
            <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.plate}</p>
          </div>
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Cliente</span>
            <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.customer_name}</p>
          </div>
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Data de Criação</span>
            <p className="mobile-text-xs lg:text-sm font-semibold">{new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground">Prioridade</span>
            <Badge variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'} className="mobile-text-xs lg:text-sm px-1 lg:px-2 py-0.5">
              {checklist.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Information */}
      <Card>
        <CardHeader className="mobile-card-padding lg:p-6">
          <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
            <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            Informações do Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="mobile-card-padding lg:p-6 space-y-2 lg:space-y-3">
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3 lg:h-4 lg:w-4" />
              Mecânico
            </span>
            <p className="mobile-text-xs lg:text-sm font-semibold">{checklist.profiles?.full_name || 'Usuário'}</p>
          </div>
          <div>
            <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
              Data de Criação
            </span>
            <p className="mobile-text-xs lg:text-sm font-semibold">
              {new Date(checklist.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          {checklist.completed_at && (
            <div>
              <span className="mobile-text-xs lg:text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
                Data de Conclusão
              </span>
              <p className="mobile-text-xs lg:text-sm font-semibold">
                {new Date(checklist.completed_at).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Imagens da Inspeção */}
      {checklist.video_url && (
        <Card>
          <CardHeader className="mobile-card-padding lg:p-6">
            <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
              <Video className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              Imagens da Inspeção
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-card-padding lg:p-6">
            {(() => {
              try {
                const images = JSON.parse(checklist.video_url);
                if (Array.isArray(images) && images.length > 0) {
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((url: string, index: number) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(url, '_blank')}
                            onError={(e) => {
                              console.error('Error loading image:', url);
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                }
              } catch (error) {
                console.error('Error parsing video_url:', error);
              }
              
              // Fallback para URLs simples
              return (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={checklist.video_url} 
                    alt="Imagem da inspeção"
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(checklist.video_url, '_blank')}
                    onError={(e) => {
                      console.error('Error loading image:', checklist.video_url);
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* General Observations */}
      {checklist.general_observations && (
        <Card>
          <CardHeader className="mobile-card-padding lg:p-6">
            <CardTitle className="mobile-text-sm lg:text-lg">Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="mobile-card-padding lg:p-6">
            <p className="mobile-text-xs lg:text-sm whitespace-pre-wrap break-words overflow-hidden">{checklist.general_observations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChecklistInfo;
