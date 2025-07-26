import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Plus, FileText, Clock, Eye, Edit, Check, Share } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useChecklists, useUpdateChecklist } from "@/hooks/useChecklists";
import { useCreatePublicLink } from "@/hooks/usePublicLinks";
import CreateChecklistForm from "@/components/CreateChecklistForm";
import ChecklistViewer from "@/components/ChecklistViewer";
import EditChecklistForm from "@/components/EditChecklistForm";

const MechanicDashboard = () => {
  const { signOut, user, profile } = useAuth();
  const { data: checklists = [] } = useChecklists();
  const updateChecklistMutation = useUpdateChecklist();
  const createPublicLinkMutation = useCreatePublicLink();
  const [activeView, setActiveView] = useState<'dashboard' | 'new-checklist' | 'view-checklist' | 'edit-checklist'>('dashboard');
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);

  // Filtrar checklists do mecânico atual
  const myChecklists = checklists.filter(c => c.mechanic_id === user?.id);
  const completedChecklists = myChecklists.filter(c => c.status === 'Concluído');
  const pendingChecklists = myChecklists.filter(c => c.status === 'Pendente');

  const handleCompleteChecklist = async (checklist: any) => {
    try {
      await updateChecklistMutation.mutateAsync({
        id: checklist.id,
        status: 'Concluído'
      });
      toast.success('Checklist concluído com sucesso!');
    } catch (error) {
      console.error('Error completing checklist:', error);
      toast.error('Erro ao concluir checklist');
    }
  };

  const handleSharePublicLink = async (checklistId: string) => {
    await createPublicLinkMutation.mutateAsync(checklistId);
  };

  const handleViewChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('view-checklist');
  };

  const handleEditChecklist = (checklist: any) => {
    setSelectedChecklist(checklist);
    setActiveView('edit-checklist');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedChecklist(null);
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };

  if (activeView === 'new-checklist') {
    return (
      <CreateChecklistForm 
        onBack={handleBackToDashboard}
        onComplete={() => {
          handleBackToDashboard();
          toast.success('Checklist criado com sucesso!');
        }}
      />
    );
  }

  if (activeView === 'view-checklist') {
    return (
      <ChecklistViewer 
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (activeView === 'edit-checklist') {
    return (
      <EditChecklistForm 
        checklist={selectedChecklist}
        onBack={handleBackToDashboard}
        onSave={() => {
          handleBackToDashboard();
          toast.success('Checklist atualizado com sucesso!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background no-horizontal-scroll h-screen-mobile safe-top safe-bottom">
      {/* Header - Otimizado para mobile */}
      <header className="bg-card border-b border-border px-3 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 sticky top-0 z-40 backdrop-blur-sm bg-card/95">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-foreground truncate">
              Painel do Mecânico
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground truncate">
              {profile?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              onClick={() => setActiveView('new-checklist')}
              className="h-9 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm touch-target"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">Novo</span>
              <span className="xs:hidden">+</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="h-9 px-3 sm:h-10 sm:px-4 text-xs sm:text-sm touch-target"
              size="sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden xs:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-3 sm:p-4 lg:p-6 pb-safe">
        {/* Quick Stats - Grid responsivo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mb-4 lg:mb-8">
          <Card className="touch-highlight-none">
            <CardHeader className="p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm lg:text-base font-medium flex items-center justify-between">
                <span className="truncate">Concluídos</span>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                {completedChecklists.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-highlight-none">
            <CardHeader className="p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm lg:text-base font-medium flex items-center justify-between">
                <span className="truncate">Pendentes</span>
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                {pendingChecklists.length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="touch-highlight-none">
            <CardHeader className="p-2 sm:p-3 lg:p-4 pb-1 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm lg:text-base font-medium flex items-center justify-between">
                <span className="truncate">Total</span>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 lg:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                {myChecklists.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Checklists */}
        <Card className="touch-highlight-none">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
              <FileText className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              <span>Meus Checklists</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="space-y-3 lg:space-y-4">
              {myChecklists.map((checklist) => (
                <div key={checklist.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors touch-highlight-none">
                  {/* Header do checklist - Mobile first */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground line-clamp-2">
                      {checklist.vehicle_name} - {checklist.plate}
                    </h3>
                    
                    {/* Badges - Stack em mobile, inline em desktop */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 items-start sm:items-center">
                      <Badge 
                        variant={checklist.priority === 'Alta' ? 'destructive' : 'secondary'}
                        className="text-xs px-2 py-0.5 touch-target"
                      >
                        {checklist.priority}
                      </Badge>
                      <Badge 
                        variant={checklist.status === 'Concluído' ? "default" : "secondary"}
                        className="text-xs px-2 py-0.5 touch-target"
                      >
                        {checklist.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Info do checklist */}
                  <div className="space-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
                    <p><strong>Cliente:</strong> {checklist.customer_name}</p>
                    <div className="flex flex-col xs:flex-row xs:gap-4">
                      <p><strong>Data:</strong> {new Date(checklist.created_at).toLocaleDateString('pt-BR')}</p>
                      {checklist.completed_at && (
                        <p><strong>Concluído:</strong> {new Date(checklist.completed_at).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>

                  {/* Botões de ação - Mobile optimized */}
                  <div className="flex flex-col xs:flex-row gap-2 xs:gap-1">
                    {checklist.status === 'Pendente' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleCompleteChecklist(checklist)}
                        disabled={updateChecklistMutation.isPending}
                        className="h-9 px-3 text-xs bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2 touch-target w-full xs:w-auto"
                      >
                        <Check className="h-3 w-3" />
                        <span>Concluir</span>
                      </Button>
                    )}
                    
                    <div className="flex gap-1 xs:flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewChecklist(checklist)}
                        className="h-9 px-3 text-xs flex items-center justify-center gap-2 touch-target flex-1 xs:flex-initial"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Visualizar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChecklist(checklist)}
                        className="h-9 px-3 text-xs flex items-center justify-center gap-2 touch-target flex-1 xs:flex-initial"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSharePublicLink(checklist.id)}
                        disabled={createPublicLinkMutation.isPending}
                        className="h-9 px-3 text-xs flex items-center justify-center gap-2 touch-target flex-1 xs:flex-initial"
                      >
                        <Share className="h-3 w-3" />
                        <span>Compartilhar</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {myChecklists.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm sm:text-base mb-4">Nenhum checklist criado ainda.</p>
                  <Button 
                    onClick={() => setActiveView('new-checklist')}
                    className="h-10 px-4 text-sm touch-target"
                  >
                    Criar Primeiro Checklist
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MechanicDashboard;
