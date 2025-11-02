import { AssignmentUseCases } from '@/server/assignment/AssignmentUseCases';
import { IAssignmentCreateInput, IAssignmentUpdateInput, IAssignmentFilters } from '@/server/assignment/IAssignment';

export class AdminAssignmentUseCases {
  constructor(private assignmentUseCases: AssignmentUseCases) {}

  getAllAssignments = (filters?: IAssignmentFilters) => this.assignmentUseCases.getAllAssignments(filters);
  getAssignmentById = (id: string) => this.assignmentUseCases.getAssignmentById(id);
  createAssignment = (data: IAssignmentCreateInput) => this.assignmentUseCases.createAssignment(data);
  updateAssignment = (id: string, data: IAssignmentUpdateInput) => this.assignmentUseCases.updateAssignment(id, data);
  deleteAssignment = (id: string) => this.assignmentUseCases.deleteAssignment(id);
  getActiveAssignments = () => this.assignmentUseCases.getActiveAssignments();
}