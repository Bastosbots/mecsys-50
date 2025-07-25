import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signupData, setSignupData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'mechanic'
  });

  useEffect(() => {
    document.title = 'Cadastro - MecSys';
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!signupData.username.trim()) {
      toast.error('Nome de usuário é obrigatório');
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      signupData.username,
      signupData.password,
      signupData.username,
      signupData.role
    );

    if (error) {
      toast.error('Erro ao criar conta: ' + error.message);
    } else {
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      navigate('/auth');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-border bg-card backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/auth')}
                className="absolute"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex justify-center w-full">
                <div className="bg-primary p-3 rounded-full">
                  <Car className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              MECSYS
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Criar Nova Conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={signupData.username}
                  onChange={(e) => setSignupData(prev => ({...prev, username: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil</Label>
                <Select value={signupData.role} onValueChange={(value) => 
                  setSignupData(prev => ({...prev, role: value}))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="mechanic">Mecânico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({...prev, confirmPassword: e.target.value}))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-primary">MecSys</p>
                <p className="text-xs text-muted-foreground">Desenvolvido por Aliffer</p>
                <p className="text-xs text-muted-foreground">© 2025 - Todos os direitos reservados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
