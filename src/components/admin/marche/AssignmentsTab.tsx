/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { MarketSession } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

import { useToast } from '@/components/ui/Toast';

type Assignment = {
  id: string;
  name: string;
  description?: string;
  area: string; // Zone d'affectation (ex: "A1", "B2", etc.)
  category: 'fruits-legumes' | 'viandes' | 'autre';
  isOccupied: boolean;
  occupiedBy?: string;
};

interface AssignmentsTabProps {
  session: MarketSession;
}

export function AssignmentsTab({ }: AssignmentsTabProps) {
  const { success, error } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      name: 'Stand Fruits & Légumes A',
      description: 'Emplacement pour producteurs de fruits et légumes',
      area: 'A1',
      category: 'fruits-legumes',
      isOccupied: false,
    },
    {
      id: '2',
      name: 'Stand Fruits & Légumes B',
      description: 'Emplacement pour producteurs de fruits et légumes',
      area: 'A2',
      category: 'fruits-legumes',
      isOccupied: true,
      occupiedBy: 'Ferme Martin',
    },
    {
      id: '3',
      name: 'Stand Viandes',
      description: 'Emplacement pour bouchers et producteurs de viande',
      area: 'B1',
      category: 'viandes',
      isOccupied: false,
    },
  ]);

  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [, setEditingAssignment] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState({
    name: '',
    description: '',
    area: '',
    category: 'fruits-legumes' as Assignment['category'],
  });

  const handleAddAssignment = () => {
    if (!newAssignment.name || !newAssignment.area) {
      error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const assignment: Assignment = {
      id: Date.now().toString(),
      name: newAssignment.name,
      description: newAssignment.description,
      area: newAssignment.area,
      category: newAssignment.category,
      isOccupied: false,
    };

    setAssignments([...assignments, assignment]);
    setNewAssignment({
      name: '',
      description: '',
      area: '',
      category: 'fruits-legumes',
    });
    setIsAddingAssignment(false);
    success('Affectation ajoutée avec succès');
  };

  const handleDeleteAssignment = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment?.isOccupied) {
      error('Impossible de supprimer une affectation occupée');
      return;
    }

    setAssignments(assignments.filter(a => a.id !== id));
    success('Affectation supprimée avec succès');
  };

  const getCategoryColor = (category: Assignment['category']) => {
    switch (category) {
      case 'fruits-legumes':
        return 'bg-green-100 text-green-800';
      case 'viandes':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: Assignment['category']) => {
    switch (category) {
      case 'fruits-legumes':
        return 'Fruits & Légumes';
      case 'viandes':
        return 'Viandes';
      default:
        return 'Autre';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Affectations</p>
                <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">📍</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupées</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.isOccupied).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assignments.filter(a => !a.isOccupied).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-orange-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Affectations de l'espace marché</h3>
        <Button
          onClick={() => setIsAddingAssignment(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          + Ajouter une affectation
        </Button>
      </div>

      {/* Formulaire d'ajout */}
      {isAddingAssignment && (
        <Card>
          <CardHeader>
            <CardTitle>Nouvelle affectation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="area">Zone *</Label>
                <Input
                  id="area"
                  value={newAssignment.area}
                  onChange={(e) => setNewAssignment({ ...newAssignment, area: e.target.value })}
                  placeholder="Ex: A1, B2, C3..."
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                value={newAssignment.category}
                onChange={(e) => setNewAssignment({ ...newAssignment, category: e.target.value as Assignment['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="fruits-legumes">Fruits & Légumes</option>
                <option value="viandes">Viandes</option>
                <option value="autre">Autre</option>
              </select>
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
            <div className="flex gap-2">
              <Button onClick={handleAddAssignment} className="bg-orange-600 hover:bg-orange-700">
                Ajouter
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingAssignment(false);
                  setNewAssignment({ name: '', description: '', area: '', category: 'fruits-legumes' });
                }}
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
          <Card key={assignment.id} className={`${assignment.isOccupied ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{assignment.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryColor(assignment.category)}>
                      {getCategoryLabel(assignment.category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Zone {assignment.area}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAssignment(assignment.id)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={assignment.isOccupied}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assignment.description && (
                <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    assignment.isOccupied ? 'bg-green-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {assignment.isOccupied ? 'Occupée' : 'Disponible'}
                  </span>
                </div>
                {assignment.isOccupied && assignment.occupiedBy && (
                  <span className="text-xs text-gray-500">
                    par {assignment.occupiedBy}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune affectation</h3>
            <p className="text-gray-600 mb-4">
              Commencez par ajouter des affectations pour organiser l'espace marché.
            </p>
            <Button
              onClick={() => setIsAddingAssignment(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              + Ajouter la première affectation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}