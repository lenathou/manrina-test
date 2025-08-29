import { IAssignment, IAssignmentCreateInput, IAssignmentUpdateInput, IAssignmentFilters } from './IAssignment';
import { IAssignmentRepository } from './IAssignmentRepository';

export class AssignmentUseCases {
    constructor(private assignmentRepository: IAssignmentRepository) {}

    async getAllAssignments(filters?: IAssignmentFilters): Promise<IAssignment[]> {
        return this.assignmentRepository.findAll(filters);
    }

    async getAssignmentById(id: string): Promise<IAssignment | null> {
        return this.assignmentRepository.findById(id);
    }

    async createAssignment(data: IAssignmentCreateInput): Promise<IAssignment> {
        // Vérifier si une affectation avec ce nom existe déjà
        const existingAssignment = await this.assignmentRepository.findByName(data.name);
        if (existingAssignment) {
            throw new Error('Une affectation avec ce nom existe déjà');
        }

        return this.assignmentRepository.create(data);
    }

    async updateAssignment(id: string, data: IAssignmentUpdateInput): Promise<IAssignment> {
        // Vérifier si l'affectation existe
        const existingAssignment = await this.assignmentRepository.findById(id);
        if (!existingAssignment) {
            throw new Error('Affectation non trouvée');
        }

        // Si le nom est modifié, vérifier qu'il n'existe pas déjà
        if (data.name && data.name !== existingAssignment.name) {
            const duplicateAssignment = await this.assignmentRepository.findByName(data.name);
            if (duplicateAssignment) {
                throw new Error('Une affectation avec ce nom existe déjà');
            }
        }

        return this.assignmentRepository.update(id, data);
    }

    async deleteAssignment(id: string): Promise<void> {
        // Vérifier si l'affectation existe
        const existingAssignment = await this.assignmentRepository.findById(id);
        if (!existingAssignment) {
            throw new Error('Affectation non trouvée');
        }

        return this.assignmentRepository.delete(id);
    }

    async getActiveAssignments(): Promise<IAssignment[]> {
        return this.assignmentRepository.findAll({ isActive: true });
    }
}