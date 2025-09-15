import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Assignment } from '@prisma/client';
import { useGrowerById } from '@/hooks/useGrowerById';
import { useGrowerAssignmentById, useGrowerStats } from '@/hooks/admin/useGrowerAssignments';
import { useUpdateGrower } from '@/hooks/admin/useGrowerMutations';
import { success, error } from '@/utils/notifications';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedGrower, setEditedGrower] = useState<GrowerWithAssignment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const growerIdStr = typeof growerId === 'string' ? growerId : '';
  
  // Utilisation des hooks optimisés pour les requêtes parallèles
  const { data: growerData, isLoading: growerLoading, error: growerError } = useGrowerById(growerIdStr);
  const { data: assignment, isLoading: assignmentLoading } = useGrowerAssignmentById(growerIdStr);
  const { isLoading: statsLoading } = useGrowerStats(growerIdStr);
  
  const isLoading = growerLoading || assignmentLoading || statsLoading;
  const hasError = !!growerError;

  // Créer l'objet grower avec assignment
  const grower: GrowerWithAssignment | null = useMemo(() => {
    return growerData ? {
      ...growerData,
      assignmentId: assignment?.id || null,
      assignment: assignment || null,
    } : null;
  }, [growerData, assignment]);
  
  useEffect(() => {
    if (grower) {
      setEditedGrower(grower);
    }
  }, [grower]);

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

  const updateGrowerMutation = useUpdateGrower();
  
  const handleSaveChanges = async () => {
    if (!editedGrower || !grower) return;

    try {
      setIsSaving(true);
      await updateGrowerMutation.mutateAsync({
        growerId: editedGrower.id,
        updateData: {
          name: editedGrower.name,
          email: editedGrower.email,
          phone: editedGrower.phone ?? undefined,
          bio: editedGrower.bio ?? undefined,
        },
      });
      
      setIsEditing(false);
      success('Producteur mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
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

  if (hasError || !grower) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch lg:min-h-[600px]">
          <div className="flex flex-col space-y-6 lg:h-full">
            <div className="flex-1">
              <GrowerStatusCard 
                grower={isEditing ? editedGrower! : grower}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </div>
            <div className="flex-1">
              <GrowerInfoCard 
                grower={isEditing ? editedGrower! : grower}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>
          
          <div className="flex flex-col space-y-6 lg:h-full">
            <div className="flex-1">
              <GrowerBioCard 
                grower={isEditing ? editedGrower! : grower}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </div>
            <div className="flex-1">
              <GrowerAssignmentCard 
                grower={isEditing ? editedGrower! : grower}
                assignments={assignment ? [assignment] : []}
                isEditing={isEditing}
                onFieldChange={handleFieldChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowerDetailPage;