import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Plus, DollarSign, Search, Filter, X } from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate, useSearchParams } from "react-router-dom";
import BudgetForm from "@/components/BudgetForm";
import BudgetViewer from "@/components/BudgetViewer";
import BudgetStatus from "@/components/BudgetStatus";
import { useAuth } from "@/hooks/useAuth";

const Budgets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: budgets = [], isLoading } = useBudgets();
  const { profile } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [mechanicFilter, setMechanicFilter] = useState('all');

  // Get current mode from URL params
  const viewId = searchParams.get('view');
  const editId = searchParams.get('edit');
  const isCreating = searchParams.get('create') === 'true';
  
  const isAdmin = profile?.role === 'admin';
  const isMechanic = profile?.role === 'mechanic';

  // Filter budgets based on search, filters, and user role
  const filteredBudgets = useMemo(() => {
    let filteredData = budgets;

    // If user is mechanic, only show their own budgets
    if (isMechanic && profile?.id) {
      filteredData = budgets.filter(budget => budget.mechanic_id === profile.id);
    }

    return filteredData.filter(budget => {
      const matchesSearch = searchTerm === '' || 
        (budget.customer_name && budget.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (budget.vehicle_name && budget.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
      
      const matchesMechanic = mechanicFilter === 'all' || 
        budget.mechanic_id === mechanicFilter;

      return matchesSearch && matchesStatus && matchesMechanic;
    });
  }, [budgets, searchTerm, statusFilter, mechanicFilter, isMechanic, profile?.id]);

  // Get unique mechanics for filter (only show for admins)
  const mechanics = useMemo(() => {
    if (!isAdmin) return [];
    
    const uniqueMechanics = budgets.reduce((acc, budget) => {
      if (budget.mechanic && !acc.find(m => m.id === budget.mechanic_id)) {
        acc.push({ id: budget.mechanic_id, full_name: budget.mechanic.full_name });
      }
      return acc;
    }, [] as any[]);
    return uniqueMechanics;
  }, [budgets, isAdmin]);

  const handleView = (budgetId: string) => {
    navigate(`/budgets?view=${budgetId}`);
  };

  const handleEdit = (budgetId: string) => {
    navigate(`/budgets?edit=${budgetId}`);
  };

  const handleCreate = () => {
    navigate('/budgets?create=true');
  };

  const handleBack = () => {
    navigate('/budgets');
  };

  const handleComplete = () => {
    // Navigate back after creating/editing budget
    handleBack();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMechanicFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || mechanicFilter !== 'all';

  // Can user edit budget? (admin or mechanic who created it, and budget is pending)
  const canEditBudget = (budget: any) => {
    if (!isAdmin && profile?.id !== budget.mechanic_id) return false;
    return budget.status === 'Pendente';
  };

  // Get total count for display
  const totalBudgetsCount = isMechanic && profile?.id 
    ? budgets.filter(b => b.mechanic_id === profile.id).length 
    : budgets.length;

  // Show form when creating or editing
  if (isCreating || editId) {
    const selectedBudget = editId ? budgets.find(b => b.id === editId) : undefined;
    
    return (
      <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
        <BudgetForm 
          budget={selectedBudget}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Show viewer when viewing
  if (viewId) {
    const selectedBudget = budgets.find(b => b.id === viewId);
    
    if (!selectedBudget) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Orçamento não encontrado.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
        <BudgetViewer 
          budget={selectedBudget}
          onBack={handleBack}
          onEdit={(budget) => handleEdit(budget.id)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h1 className={`font-bold ${isAdmin ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
            {isMechanic ? 'Meus Orçamentos' : 'Orçamentos'}
          </h1>
        </div>
        <Button 
          onClick={handleCreate}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Orçamento
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
          <div className={`grid gap-3 ${isAdmin ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 ${isAdmin ? 'h-8 text-xs' : 'h-10'}`}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            {isAdmin && (
              <Select value={mechanicFilter} onValueChange={setMechanicFilter}>
                <SelectTrigger className={isAdmin ? 'h-8 text-xs' : 'h-10'}>
                  <SelectValue placeholder="Mecânico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Mecânicos</SelectItem>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
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
          Mostrando {filteredBudgets.length} de {totalBudgetsCount} orçamentos
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
                {isAdmin && <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Mecânico</TableHead>}
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Valor</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Status</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Data</TableHead>
                <TableHead className={isAdmin ? 'text-xs h-8' : 'text-sm h-10'}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className={`text-center py-8 text-muted-foreground ${isAdmin ? 'text-xs' : 'text-sm'}`}>
                    {hasActiveFilters 
                      ? 'Nenhum orçamento encontrado com os filtros aplicados.' 
                      : isMechanic 
                        ? 'Você ainda não criou nenhum orçamento.' 
                        : 'Nenhum orçamento encontrado.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredBudgets.map((budget) => (
                  <TableRow key={budget.id}>
                    {/* Show Cliente column only for admins */}
                    {isAdmin && (
                      <TableCell className={`font-medium ${isAdmin ? 'text-xs py-2' : 'text-sm py-3'}`}>
                        {budget.customer_name || 'Cliente não informado'}
                      </TableCell>
                    )}
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      {budget.vehicle_name || 'N/A'}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                        {budget.mechanic?.full_name || 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      R$ {budget.final_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                      <BudgetStatus budget={budget} />
                    </TableCell>
                    <TableCell className={isAdmin ? 'text-xs py-2' : 'text-sm py-3'}>
                      {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className={isAdmin ? 'py-2' : 'py-3'}>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView(budget.id)}
                          title="Visualizar orçamento"
                          className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                        >
                          <Eye className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
                        </Button>
                        {canEditBudget(budget) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(budget.id)}
                            title="Editar orçamento"
                            className={isAdmin ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'}
                          >
                            <Edit className={isAdmin ? 'h-3 w-3' : 'h-4 w-4'} />
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

export default Budgets;
