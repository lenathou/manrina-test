import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MarketSession, MarketParticipation, Grower, MarketProduct } from '@prisma/client';

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: MarketProduct[];
  _count: {
    participations: number;
    marketProducts: number;
  };
};

interface EditForm {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

interface DetailsTabProps {
  session: MarketSessionWithDetails;
  isEditing: boolean;
  editForm: EditForm;
  setEditForm: (form: EditForm) => void;
  onSave: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PLANNED: { label: 'Planifiée', variant: 'secondary' as const },
    ACTIVE: { label: 'Active', variant: 'default' as const },
    COMPLETED: { label: 'Terminée', variant: 'outline' as const },
    CANCELLED: { label: 'Annulée', variant: 'destructive' as const },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNED;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function DetailsTab({
  session,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onDelete,
  onEdit,
  onCancel,
  isLoading
}: DetailsTabProps) {
  const confirmedParticipants = session.participations.filter(p => p.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{session.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(session.status)}
              <span className="text-sm text-gray-500">
                {confirmedParticipants} participant{confirmedParticipants > 1 ? 's' : ''} confirmé{confirmedParticipants > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onEdit}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                Modifier
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer cette session de marché ? Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Informations générales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nom de la session
                </Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={editForm.date ? new Date(editForm.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                  Heure de début
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={editForm.startTime || ''}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                  Heure de fin
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={editForm.endTime || ''}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Lieu
                </Label>
                <Input
                  id="location"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="text-base text-gray-900">
                    {new Date(session.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Horaires</p>
                  <p className="text-base text-gray-900">
                    {session.startTime ? new Date(session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Non défini'} - {session.endTime ? new Date(session.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Non défini'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Lieu</p>
                  <p className="text-base text-gray-900">{session.location || 'Non spécifié'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Statut</p>
                  <div className="mt-1">
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              </div>
              
              {session.description && (
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-base text-gray-900 mt-1">{session.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}