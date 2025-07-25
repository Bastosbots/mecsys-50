import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [userData, setUserData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    document.title = 'Registro - MecSys';
  }, []);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setTokenValid(false);
      setValidatingToken(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invite_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error || !data) {
        setTokenValid(false);
      } else {
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        
        if (data.used_at || expiresAt < now) {
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      }
    } catch (err) {
      setTokenValid(false);
    } finally {
      setValidatingToken(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (userData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Verificar se username já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', userData.username)
        .maybeSingle();

      if (existingUser) {
        toast.error('Nome de usuário já existe');
        setLoading(false);
        return;
      }

      // Criar usuário
      const { error: signUpError } = await signUp(
        userData.username,
        userData.password,
        userData.username,
        'mechanic'
      );

      if (signUpError) {
        toast.error('Erro ao criar usuário: ' + signUpError.message);
        setLoading(false);
        return;
      }

      // Marcar token como usado
      await supabase
        .from('invite_tokens')
        .update({
          used_at: new Date().toISOString(),
          used_by: null // Será preenchido quando o usuário fizer login
        })
        .eq('token', token);

      toast.success('Usuário criado com sucesso! Faça login para continuar.');
      navigate('/auth');
      
    } catch (err) {
      toast.error('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card className="shadow-2xl border-border bg-card backdrop-blur-sm w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Validando token de convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card className="shadow-2xl border-border bg-card backdrop-blur-sm w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Token Inválido
            </CardTitle>
            <CardDescription>
              O link de convite é inválido, expirado ou já foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
            >
              Voltar para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-border bg-card backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-full">
                <Car className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              MECSYS
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Cadastro de Novo Mecânico
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Seu nome de usuário"
                  value={userData.username}
                  onChange={(e) => setUserData(prev => ({...prev, username: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={userData.password}
                  onChange={(e) => setUserData(prev => ({...prev, password: e.target.value}))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={userData.confirmPassword}
                  onChange={(e) => setUserData(prev => ({...prev, confirmPassword: e.target.value}))}
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

export default Register;
