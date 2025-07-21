import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Download, Share2 } from "lucide-react";
import { useBudgetItems } from "@/hooks/useBudgets";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBudgetPublicLink } from "@/hooks/usePublicLinks";
import BudgetStatus from "./BudgetStatus";
import { generateBudgetPDF } from "@/utils/pdfGenerator";

interface BudgetViewerProps {
  budget: any;
  onBack: () => void;
  onEdit: (budget: any) => void;
}

const BudgetViewer = ({ budget, onBack, onEdit }: BudgetViewerProps) => {
  const { data: items = [] } = useBudgetItems(budget.id);
  const { profile } = useAuth();

  const canEdit = profile?.role === 'admin' || profile?.id === budget.mechanic_id;
  const canDownloadPdf = true; // TODO: check permissions

  const { mutate: createPublicLink, isPending: isCreatingLink } = useCreateBudgetPublicLink();

  const handleSharePublicLink = () => {
    createPublicLink(budget.id);
  };

  const handleDownloadPdf = async () => {
    try {
      await generateBudgetPDF(budget, items);
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    }
  };

  if (!budget) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Orçamento não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Orçamento {budget.budget_number}</h1>
          <BudgetStatus budget={budget} />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSharePublicLink}
            disabled={isCreatingLink}
            title="Compartilhar link público"
          >
            {isCreatingLink ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {isCreatingLink ? 'Gerando...' : 'Compartilhar'}
          </Button>
          {canEdit && (
            <Button onClick={() => onEdit(budget)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {canDownloadPdf && (
            <Button variant="outline" onClick={handleDownloadPdf}>
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium">Cliente</p>
            <p className="text-muted-foreground">{budget.customer_name || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Veículo</p>
            <p className="text-muted-foreground">{budget.vehicle_name || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Placa</p>
            <p className="text-muted-foreground">{budget.vehicle_plate || 'Não informada'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Ano</p>
            <p className="text-muted-foreground">{budget.vehicle_year || 'Não informado'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Número do Orçamento</p>
            <p className="text-muted-foreground">{budget.budget_number}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
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
              {items.map((item: any) => (
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
        </CardContent>
      </Card>

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
          {budget.discount_amount && (
            <div className="flex justify-between text-red-600">
              <span>Desconto:</span>
              <span className="font-medium">
                - R$ {Number(budget.discount_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span className="text-primary">
              R$ {Number(budget.final_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {budget.observations && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{budget.observations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetViewer;
