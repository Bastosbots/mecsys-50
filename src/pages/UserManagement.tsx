
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCog } from "lucide-react";
import UserManagement from "@/components/UserManagement";
import { useAuth } from "@/hooks/useAuth";

const UserManagementPage = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    document.title = 'Gerenciamento de Usuários - MecSys';
  }, []);

  return (
    <div className={`space-y-4 ${isAdmin ? 'lg:zoom-90' : ''}`}>
      <div className="flex items-center gap-2">
        <UserCog className="h-5 w-5 text-primary" />
        <h1 className={`font-bold ${isAdmin ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
          Gerenciamento de Usuários
        </h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <UserManagement />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
