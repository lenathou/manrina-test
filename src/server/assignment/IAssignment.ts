import { Assignment } from '@prisma/client';

export type IAssignment = Assignment;

export interface IAssignmentCreateInput {
    name: string;
    description?: string;
    color?: string;
    isActive?: boolean;
}

export interface IAssignmentUpdateInput {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
}

export interface IAssignmentFilters {
    isActive?: boolean;
    search?: string;
}