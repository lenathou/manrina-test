import { useState, useEffect } from 'react';
import { Assignment } from '@prisma/client';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/assignments');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des affectations');
      }
      const data = await response.json();
      setAssignments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const createAssignment = async (assignmentData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const newAssignment = await response.json();
      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    } catch (err) {
      throw err;
    }
  };

  const updateAssignment = async (id: string, assignmentData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    try {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      const updatedAssignment = await response.json();
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === id ? updatedAssignment : assignment
        )
      );
      return updatedAssignment;
    } catch (err) {
      throw err;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/assignments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refetch: fetchAssignments,
  };
};