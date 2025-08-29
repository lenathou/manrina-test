import { IAssignment, IAssignmentCreateInput, IAssignmentUpdateInput, IAssignmentFilters } from './IAssignment';

export interface IAssignmentRepository {
    findAll(filters?: IAssignmentFilters): Promise<IAssignment[]>;
    findById(id: string): Promise<IAssignment | null>;
    create(data: IAssignmentCreateInput): Promise<IAssignment>;
    update(id: string, data: IAssignmentUpdateInput): Promise<IAssignment>;
    delete(id: string): Promise<void>;
    findByName(name: string): Promise<IAssignment | null>;
}