
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, XCircle } from "lucide-react";

interface ChecklistItemsProps {
  items: any[];
}

const ChecklistItems = ({ items }: ChecklistItemsProps) => {
  const groupedItems = items.reduce((acc: any, item: any) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedItems);

  return (
    <Card>
      <CardHeader className="mobile-card-padding lg:p-6">
        <CardTitle className="flex items-center gap-1 lg:gap-2 mobile-text-sm lg:text-lg">
          <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
          Itens Verificados
        </CardTitle>
      </CardHeader>
      <CardContent className="mobile-card-padding lg:p-6">
        <div className="space-y-4 lg:space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-2 lg:mb-3 flex items-center gap-1 lg:gap-2">
                <Badge variant="outline" className="mobile-text-xs lg:text-sm">{category}</Badge>
                <span className="mobile-text-xs lg:text-sm text-muted-foreground">
                  ({groupedItems[category].filter((item: any) => item.checked).length}/
                  {groupedItems[category].length})
                </span>
              </h3>
              
              <div className="space-y-2 lg:space-y-3">
                {groupedItems[category].map((item: any) => (
                  <div key={item.id} className="border rounded-lg mobile-card-padding lg:p-4 bg-card">
                    <div className="flex items-start gap-2 lg:gap-3">
                      <div className="mt-1 flex-shrink-0">
                        {item.checked ? (
                          <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 lg:h-5 lg:w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 lg:gap-2 mb-1">
                          <span className={`mobile-text-xs lg:text-sm font-medium ${item.checked ? 'text-green-600' : 'text-red-500'}`}>
                            {item.item_name}
                          </span>
                          <Badge variant={item.checked ? "default" : "destructive"} className="mobile-text-xs lg:text-xs px-1 lg:px-2 py-0.5 flex-shrink-0">
                            {item.checked ? 'OK' : 'Não Verificado'}
                          </Badge>
                        </div>
                        {item.observation && (
                          <div className="mt-1 lg:mt-2 p-1 lg:p-2 bg-muted rounded mobile-text-xs lg:text-sm break-words overflow-hidden">
                            <strong>Observação:</strong> {item.observation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {category !== categories[categories.length - 1] && categories.length > 1 && (
                <div className="mt-4 lg:mt-6 border-t border-border" />
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 lg:py-8 text-muted-foreground">
              <FileText className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 opacity-50" />
              <p className="mobile-text-xs lg:text-base">Nenhum item encontrado neste checklist.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChecklistItems;
