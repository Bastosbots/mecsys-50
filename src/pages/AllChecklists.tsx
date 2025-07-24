import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Plus, ClipboardCheck, Search, Filter, X, Clock, CheckCircle, AlertCircle, Pause, Check, Share } from "lucide-react";
import { useChecklists, useUpdateChecklist } from "@/hooks/useChecklists";
import { useCreatePublicLink } from "@/hooks/usePublicLinks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate, useSearchParams } from "react-router-dom";
import CreateChecklistForm from "@/components/CreateChecklistForm";
import ChecklistViewer from "@/components/ChecklistViewer";
import EditChecklistForm from "@/components/EditChecklistForm";
import { useAuth } from "@/hooks/useAuth";

const AllChecklists = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allChecklists = [], isLoading } = useChecklists();
  const { profile, user } = useAuth();
  const updateChecklistMutation = useUpdateChecklist();
  const createPublicLinkMutation = useCreatePublicLink();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mechanicFilter, setMechanicFilter] = useState('all');

  // Get current mode from URL params
  const viewId = searchParams.get('view');
  const editId = searchParams.get('edit');
  const isCreating = searchParams.get('create') === 'true';
  
  const isAdmin = profile?.role === 'admin';
  const isMechanic = profile?.role === 'mechanic';

  // Filter checklists based on user role
  const checklists = useMemo(() => {
    if (isAdmin) {
      // Admins can see all checklists
      return allChecklists;
    } else {
      // Mechanics can only see their own checklists
      return allChecklists.filter(checklist => checklist.mechanic_id === user?.id);
    }
  }, [allChecklists, isAdmin, user?.id]);

  // Filter checklists based on search and filters
  const filteredChecklists = useMemo(() => {
    return checklists.filter(checklist => {
      const matchesSearch = searchTerm === '' || 
        checklist.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.plate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || checklist.status === statusFilter;
      
      const matchesMechanic = mechanicFilter === 'all' || 
        checklist.mechanic_id === mechanicFilter;

      return matchesSearch && matchesStatus && matchesMechanic;
    });
  }, [checklists, searchTerm, statusFilter, mechanicFilter]);

  // Get unique mechanics for filter (only show mechanics filter for admins)
  const mechanics = useMemo(() => {
    if (!isAdmin) return [];
    
    const uniqueMechanics = checklists.reduce((acc, checklist) => {
      if (checklist.mechanic && !acc.find(m => m.mechanic_id === checklist.mechanic_id)) {
        acc.push({
          mechanic_id: checklist.mechanic_id,
          full_name: checklist.mechanic.full_name
        });
      }
      return acc;
    }, [] as any[]);
    return uniqueMechanics;
  }, [checklists, isAdmin]);

  const handleView = (checklistId: string) => {
    navigate(`/checklists?view=${checklistId}`);
  };

  const handleEdit = (checklistId: string) => {
    navigate(`/checklists?edit=${checklistId}`);
  };

  const handleCreate = () => {
    navigate('/checklists?create=true');
  };

  const handleBack = () => {
    navigate('/checklists');
  };

  const handleComplete = () => {
    // Navigate back after creating checklist
    handleBack();
  };

  const handleSave = () => {
    // Navigate back after saving checklist
    handleBack();
  };

  const handleCompleteChecklist = async (checklistId: string) => {
    try {
      await updateChecklistMutation.mutateAsync({
        id: checklistId,
        status: 'Concluído',
        completed_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error completing checklist:', error);
    }
  };

  const handleSharePublicLink = async (checklistId: string) => {
    await createPublicLinkMutation.mutateAsync(checklistId);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMechanicFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || mechanicFilter !== 'all';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle className="h-3 w-3" />;
      case 'Em Andamento':
        return <Clock className="h-3 w-3" />;
      case 'Cancelado':
        return <Pause className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

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

  // Show form when creating
  if (isCreating) {
    return (
      <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
        <CreateChecklistForm 
          onBack={handleBack}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Show viewer when viewing
  if (viewId) {
    const selectedChecklist = checklists.find(c => c.id === viewId);
    
    if (!selectedChecklist) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Checklist não encontrado.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
        <ChecklistViewer 
          checklist={selectedChecklist}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Show edit form when editing
  if (editId) {
    const selectedChecklist = checklists.find(c => c.id === editId);
    
    if (!selectedChecklist) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Checklist não encontrado.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
        <EditChecklistForm 
          checklist={selectedChecklist}
          onBack={handleBack}
          onSave={handleSave}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando checklists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h1 className={`font-bold ${isAdmin ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
            {isAdmin ? 'Todos os Checklists' : 'Meus Checklists'}
          </h1>
        </div>
        <Button 
          onClick={handleCreate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Checklist
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${isAdmin ? 'text-sm' : 'text-base'}`}>
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className={`ml-auto text-muted-foreground hover:text-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`grid gap-3 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, veículo, placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 ${isAdmin ? 'h-8 text-xs' : 'h-10'}`}
              />
            </div>
            
            {/* Only show status filter for admins */}
            {isAdmin && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Only show mechanic filter for admins */}
            {isAdmin && (
              <Select value={mechanicFilter} onValueChange={setMechanicFilter}>
                <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                  <SelectValue placeholder="Mecânico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Mecânicos</SelectItem>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.mechanic_id} value={mechanic.mechanic_id}>
                      {mechanic.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className={`flex items-center gap-2 text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
        <span>
          Mostrando {filteredChecklists.length} de {checklists.length} checklists
        </span>
        {hasActiveFilters && (
          <span className="text-primary">
            (com filtros aplicados)
          </span>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Show Cliente column only for admins */}
                {isAdmin && <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Cliente</TableHead>}
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Veículo</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Placa</TableHead>
                {/* Only show mechanic column for admins */}
                {isAdmin && <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Mecânico</TableHead>}
                {/* Show Status column only for admins */}
                {isAdmin && <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Status</TableHead>}
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Data</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 4} className={`text-center py-8 text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
                    {hasActiveFilters ? 'Nenhum checklist encontrado com os filtros aplicados.' : 'Nenhum checklist encontrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    {/* Show Cliente column only for admins */}
                    {isAdmin && (
                      <TableCell className={`font-medium ${isAdmin ? 'text-xs py-2' : 'text-sm py-3'}`}>
                        {checklist.customer_name}
                      </TableCell>
                    )}
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      {checklist.vehicle_name}
                    </TableCell>
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      {checklist.plate}
                    </TableCell>
                    {/* Only show mechanic column for admins */}
                    {isAdmin && (
                      <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                        {checklist.mechanic?.full_name || 'N/A'}
                      </TableCell>
                    )}
                    {/* Show Status column only for admins */}
                    {isAdmin && (
                      <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(checklist.status)} flex items-center gap-1 w-fit ${isAdmin ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}
                        >
                          {getStatusIcon(checklist.status)}
                          {checklist.status}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      {format(new Date(checklist.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView(checklist.id)}
                          title="Visualizar checklist"
                          className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        >
                          <Eye className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(checklist.id)}
                          title="Editar checklist"
                          className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        >
                          <Edit className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSharePublicLink(checklist.id)}
                          title="Copiar link público"
                          className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                          disabled={createPublicLinkMutation.isPending}
                        >
                          <Share className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                        </Button>
                        {/* Only show complete button for admins and when status is "Em Andamento" */}
                        {isAdmin && checklist.status === 'Em Andamento' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCompleteChecklist(checklist.id)}
                            title="Concluir checklist"
                            className={`${isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'} text-green-600 hover:text-green-700 hover:bg-green-50`}
                            disabled={updateChecklistMutation.isPending}
                          >
                            <Check className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AllChecklists;
