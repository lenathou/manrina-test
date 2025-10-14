/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { MarketSession } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/Toast';
import { useAssignments } from '@/hooks/useAssignments';
import { Assignment } from '@prisma/client';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface AssignmentsTabProps {
  session: MarketSession;
}

export function AssignmentsTab({ }: AssignmentsTabProps) {
  const { success, error } = useToast();
  const { assignments, loading, error: hookError, createAssignment, updateAssignment, deleteAssignment } = useAssignments();

  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [editingAssignmentData, setEditingAssignmentData] = useState<Assignment | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    name: '',
    description: '',
    color: '#10b981',
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    assignmentId: string | null;
    assignmentName: string;
  }>({
    isOpen: false,
    assignmentId: null,
    assignmentName: '',
  });

  const handleAddAssignment = async () => {
    if (!newAssignment.name.trim()) {
      error('Veuillez saisir un nom pour l\'affectation');
      return;
    }

    try {
      await createAssignment({
        name: newAssignment.name.trim(),
        description: newAssignment.description.trim() || undefined,
        color: newAssignment.color
      });
      
      setNewAssignment({
        name: '',
        description: '',
        color: '#10b981',
      });
      setIsAddingAssignment(false);
      success('Affectation ajoutée avec succès');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
    }
  };

  const handleDeleteAssignment = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      assignmentId: id,
      assignmentName: name,
    });
  };

  const confirmDeleteAssignment = async () => {
    if (!deleteConfirmation.assignmentId) return;
    
    try {
      await deleteAssignment(deleteConfirmation.assignmentId);
      success('Affectation supprimée avec succès');
      setDeleteConfirmation({
        isOpen: false,
        assignmentId: null,
        assignmentName: '',
      });
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const cancelDeleteAssignment = () => {
    setDeleteConfirmation({
      isOpen: false,
      assignmentId: null,
      assignmentName: '',
    });
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignmentData({ ...assignment });
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignmentData?.name.trim()) {
      error('Veuillez saisir un nom pour l\'affectation');
      return;
    }

    try {
      await updateAssignment(editingAssignmentData.id, {
        name: editingAssignmentData.name.trim(),
        description: editingAssignmentData.description?.trim() || undefined,
        color: editingAssignmentData.color
      });
      
      setEditingAssignmentData(null);
      success('Affectation modifiée avec succès');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erreur lors de la modification');
    }
  };

  const handleCancelEdit = () => {
    setEditingAssignmentData(null);
  };

  const predefinedColors = [
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#ef4444', // red
    '#3b82f6', // blue
    '#f97316', // orange
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#ec4899', // pink
    '#6366f1', // indigo
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="ml-2">Chargement des affectations...</span>
      </div>
    );
  }

  if (hookError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{hookError}</p>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">T</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{assignments.length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">D</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-orange-600">{assignments.filter(a => a.isActive).length}</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-sm font-bold">A</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => setIsAddingAssignment(true)}
        className="bg-orange-600 hover:bg-orange-700 text-white mb-6"
      >
        + Ajouter une affectation
      </Button>

      {/* Formulaire d'ajout */}
      {isAddingAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle affectation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'affectation *</Label>
              <Input
                id="name"
                value={newAssignment.name}
                onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                placeholder="Ex: Stand Fruits & Légumes A"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Description de l'affectation..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="color">Couleur de l'affectation</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  id="color"
                  value={newAssignment.color}
                  onChange={(e) => setNewAssignment({ ...newAssignment, color: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewAssignment({ ...newAssignment, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        newAssignment.color === color ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Couleur ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAssignment} className="bg-orange-600 hover:bg-orange-700">
                Ajouter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingAssignment(false);
                  setNewAssignment({ name: '', description: '', color: '#10b981' });
                }}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire de modification */}
      {editingAssignmentData && (
        <Card>
          <CardHeader>
            <CardTitle>Modifier l'affectation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de l'affectation *</Label>
              <Input
                id="edit-name"
                value={editingAssignmentData.name}
                onChange={(e) => setEditingAssignmentData({ ...editingAssignmentData, name: e.target.value })}
                placeholder="Ex: Stand Fruits & Légumes A"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingAssignmentData.description || ''}
                onChange={(e) => setEditingAssignmentData({ ...editingAssignmentData, description: e.target.value })}
                placeholder="Description de l'affectation..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Couleur de l'affectation</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  id="edit-color"
                  value={editingAssignmentData.color}
                  onChange={(e) => setEditingAssignmentData({ ...editingAssignmentData, color: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditingAssignmentData({ ...editingAssignmentData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        editingAssignmentData.color === color ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Couleur ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateAssignment} className="bg-orange-600 hover:bg-orange-700">
                Modifier
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des affectations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: assignment.color }}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{assignment.name}</h4>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: `${assignment.color}20`, color: assignment.color }}>
                    Disponible
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditAssignment(assignment)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                    title="Modifier l'affectation"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id, assignment.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                  >
                    ×
                  </Button>
                </div>
              </div>
              {assignment.description && (
                <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignment.color }}></span>
                  <span>Actif</span>
                </div>
                <div className="text-xs text-gray-500">
                  ID: {assignment.id}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-xl font-bold">A</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune affectation</h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter votre première affectation de stand.
            </p>
            <Button
              onClick={() => setIsAddingAssignment(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Ajouter une affectation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={cancelDeleteAssignment}
        onConfirm={confirmDeleteAssignment}
        title="Supprimer l'affectation"
        message={`Êtes-vous sûr de vouloir supprimer l'affectation "${deleteConfirmation.assignmentName}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}