import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Assignment } from '@prisma/client';
import { useGrowers } from '@/hooks/useGrowers';
import { useToast } from '@/components/ui/Toast';
import GrowerDetailHeader from '@/components/admin/producteurs/GrowerDetailHeader';
import GrowerStatusCard from '@/components/admin/producteurs/GrowerStatusCard';
import GrowerInfoCard from '@/components/admin/producteurs/GrowerInfoCard';
import GrowerBioCard from '@/components/admin/producteurs/GrowerBioCard';
import GrowerAssignmentCard from '@/components/admin/producteurs/GrowerAssignmentCard';
import LoadingSpinner from '@/components/admin/stock/validation-stock/LoadingSpinner';
import ErrorDisplay from '@/components/admin/stock/validation-stock/ErrorDisplay';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerWithAssignment extends IGrower {
  assignmentId?: string | null;
  assignment?: Assignment | null;
}

const GrowerDetailPage: React.FC = () => {
  const router = useRouter();
  const { growerId } = router.query;
  const { growers, isLoading } = useGrowers({ page: 1, limit: 1000 });
  const { success, error } = useToast();
  const [grower, setGrower] = useState<GrowerWithAssignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGrower, setEditedGrower] = useState<GrowerWithAssignment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/admin/assignments');
        if (response.ok) {
          const assignmentsData = await response.json();
          setAssignments(assignmentsData);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des affectations:', err);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (growerId && growers.length > 0) {
      const foundGrower = growers.find(g => g.id === growerId);
      if (foundGrower) {
        // Trouver l'affectation correspondante
        const assignment = assignments.find(a => a.id === foundGrower.assignmentId);
        setGrower({
          ...foundGrower,
          assignment: assignment || null
        });
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } else if (!isLoading && growers.length === 0) {
      setNotFound(true);
    }
  }, [growerId, growers, isLoading, assignments]);

  const handleBackClick = () => {
    router.push('/admin/producteurs');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedGrower(grower);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedGrower(null);
  };

  const handleSaveChanges = async () => {
    if (!editedGrower) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/growers/${editedGrower.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedGrower.name,
          email: editedGrower.email,
          phone: editedGrower.phone,
          siret: editedGrower.siret,
          bio: editedGrower.bio,
          approved: editedGrower.approved,
          commissionRate: editedGrower.commissionRate,
          assignmentId: editedGrower.assignmentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const updatedGrower = await response.json();
      // Trouver l'affectation correspondante pour le grower mis à jour
      const assignment = assignments.find(a => a.id === updatedGrower.assignmentId);
      setGrower({
        ...updatedGrower,
        assignment: assignment || null
      });
      setIsEditing(false);
      setEditedGrower(null);
      success('Informations du producteur mises à jour avec succès');
    } catch (err) {
      error('Erreur lors de la sauvegarde des modifications');
      console.error('Erreur:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof GrowerWithAssignment, value: string | boolean | number | null) => {
    if (!editedGrower) return;
    setEditedGrower({
      ...editedGrower,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner 
        message="Chargement des informations du producteur..."
      />
    );
  }

  if (notFound || !grower) {
    return (
      <ErrorDisplay
        title="Producteur non trouvé"
        message="Le producteur demandé n'existe pas ou a été supprimé."
        onBackClick={handleBackClick}
        backButtonText="Retour à la liste"
      />
    );
  }

  return (
    <div className="">
      <GrowerDetailHeader 
        grower={grower} 
        onBackClick={handleBackClick}
        isEditing={isEditing}
        onEditClick={handleEditClick}
        onCancelEdit={handleCancelEdit}
        onSaveChanges={handleSaveChanges}
        isSaving={isSaving}
      />
      
      <div className="max-w-6xl mx-auto mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GrowerStatusCard 
              grower={isEditing ? editedGrower! : grower}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
            <GrowerInfoCard 
              grower={isEditing ? editedGrower! : grower}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
          </div>
          
          <div className="space-y-6">
            <GrowerBioCard 
              grower={isEditing ? editedGrower! : grower}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
            <GrowerAssignmentCard 
              grower={isEditing ? editedGrower! : grower}
              assignments={assignments}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowerDetailPage;