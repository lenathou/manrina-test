import React from 'react';
import { Assignment } from '@prisma/client';
import { Label } from '@/components/ui/Label';
import type { IGrower } from '@/server/grower/IGrower';

interface GrowerWithAssignment extends IGrower {
  assignmentId?: string | null;
  assignment?: Assignment | null;
}

interface GrowerAssignmentCardProps {
  grower: {
    assignmentId?: string | null;
    assignment?: Assignment | null;
  };
  assignments: Assignment[];
  isEditing: boolean;
  onFieldChange: (field: keyof GrowerWithAssignment, value: string | boolean | number | null) => void;
}

const GrowerAssignmentCard: React.FC<GrowerAssignmentCardProps> = ({ 
  grower, 
  assignments, 
  isEditing, 
  onFieldChange 
}) => {
  const selectedAssignment = assignments.find(a => a.id === grower.assignmentId);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Affectation de marché</h2>
      </div>
      
      <div className="px-6 py-6 flex-1">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="assignment"
                className="text-gray-700 font-medium"
              >
                Rayon de marché
              </Label>
              <select
                id="assignment"
                value={grower.assignmentId || ''}
                onChange={(e) => onFieldChange('assignmentId', e.target.value || null)}
                className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Aucune affectation</option>
                {assignments
                  .filter((a) => a.isActive)
                  .map((assignment) => (
                    <option
                      key={assignment.id}
                      value={assignment.id}
                    >
                      {assignment.name}
                    </option>
                  ))}
              </select>
            </div>

            {selectedAssignment && (
              <div
                className="p-4 border-l-4 border-gray-100"
                style={{ borderLeftColor: selectedAssignment.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedAssignment.color }}
                  ></span>
                  <h4 className="font-semibold text-gray-900">{selectedAssignment.name}</h4>
                </div>
                {selectedAssignment.description && (
                  <p className="text-sm text-gray-700">{selectedAssignment.description}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            {grower.assignment ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-gray-600">Marché assigné:</span>
                  <span className="text-sm text-gray-900 font-medium">{grower.assignment.name}</span>
                </div>
                <div
                  className="p-4 border-l-4 border-gray-100"
                  style={{ borderLeftColor: grower.assignment.color }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: grower.assignment.color }}
                    ></span>
                    <h4 className="font-semibold text-gray-900">{grower.assignment.name}</h4>
                  </div>
                  {grower.assignment.description && (
                    <p className="text-sm text-gray-700">{grower.assignment.description}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100">
                  <span className="text-2xl">🏪</span>
                </div>
                <p className="text-gray-500 italic text-sm">
                  Aucun marché assigné
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowerAssignmentCard;