
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Shield, Wrench, Edit, Key, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles, useUpdateProfile, useUpdatePassword, useUpdateUserData } from "@/hooks/useProfiles";

const UserManagement = () => {
  const { signUp, profile } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();
  const updateUserDataMutation = useUpdateUserData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isUserDataDialogOpen, setIsUserDataDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'mechanic'
  });
  const [editUser, setEditUser] = useState({
    username: '',
    role: 'mechanic'
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [userDataForm, setUserDataForm] = useState({
    fullName: '',
    username: ''
  });

  const { data: users = [] } = useProfiles();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(
        newUser.username,
        newUser.password,
        newUser.fullName,
        newUser.role
      );

      if (error) {
        toast.error('Erro ao criar usuário: ' + error.message);
      } else {
        toast.success('Usuário criado com sucesso!');
        setNewUser({ username: '', password: '', fullName: '', role: 'mechanic' });
        setIsDialogOpen(false);
      }
    } catch (err) {
      toast.error('Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username || '',
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await updateProfileMutation.mutateAsync({
        id: selectedUser.id,
        username: editUser.username,
        role: editUser.role
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      // Error handled by the mutation
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (user: any) => {
    setSelectedUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setIsPasswordDialogOpen(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await updatePasswordMutation.mutateAsync({
        userId: selectedUser.id,
        newPassword: passwordData.newPassword
      });
      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      // Error handled by the mutation
    } finally {
      setLoading(false);
    }
  };

  const handleUserDataChange = (user: any) => {
    setSelectedUser(user);
    setUserDataForm({
      fullName: user.full_name || '',
      username: user.username || ''
    });
    setIsUserDataDialogOpen(true);
  };

  const handleUpdateUserData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      await updateUserDataMutation.mutateAsync({
        userId: selectedUser.id,
        fullName: userDataForm.fullName || undefined,
        username: userDataForm.username || undefined
      });
      setIsUserDataDialogOpen(false);
      setSelectedUser(null);
      setUserDataForm({
        fullName: '',
        username: ''
      });
    } catch (err) {
      // Error handled by the mutation
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'admin') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome completo do usuário"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser(prev => ({...prev, fullName: e.target.value}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nome de usuário"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({...prev, username: e.target.value}))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Select value={newUser.role} onValueChange={(value) => 
                    setNewUser(prev => ({...prev, role: value}))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="mechanic">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Mecânico
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha do usuário"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({...prev, password: e.target.value}))}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {user.role === 'admin' ? <Shield className="h-4 w-4 text-primary" /> : <Wrench className="h-4 w-4 text-primary" />}
                  {user.full_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Usuário:</strong> {user.username} | <strong>Perfil:</strong> {user.role === 'admin' ? 'Administrador' : 'Mecânico'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditUser(user)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUserDataChange(user)}
                  className="flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  Dados
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePasswordChange(user)}
                  className="flex items-center gap-1"
                >
                  <Key className="h-3 w-3" />
                  Senha
                </Button>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editUsername">Nome de Usuário</Label>
              <Input
                id="editUsername"
                type="text"
                placeholder="Nome de usuário"
                value={editUser.username}
                onChange={(e) => setEditUser(prev => ({...prev, username: e.target.value}))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRole">Perfil</Label>
              <Select value={editUser.role} onValueChange={(value) => 
                setEditUser(prev => ({...prev, role: value}))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administrador
                    </div>
                  </SelectItem>
                  <SelectItem value="mechanic">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Mecânico
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDataDialogOpen} onOpenChange={setIsUserDataDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Dados do Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUserData} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updateFullName">Nome Completo</Label>
              <Input
                id="updateFullName"
                type="text"
                placeholder="Digite o novo nome completo"
                value={userDataForm.fullName}
                onChange={(e) => setUserDataForm(prev => ({...prev, fullName: e.target.value}))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="updateUsername">Nome de Usuário</Label>
              <Input
                id="updateUsername"
                type="text"
                placeholder="Digite o novo nome de usuário"
                value={userDataForm.username}
                onChange={(e) => setUserDataForm(prev => ({...prev, username: e.target.value}))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUserDataDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Alterando..." : "Alterar Dados"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Digite a nova senha"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme a nova senha"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
