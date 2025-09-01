import React, { useState, useEffect } from 'react';
import { Assignment } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface GrowerWithAssignment {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    siret?: string | null;
    bio?: string | null;
    profilePhoto?: string | null;
    assignmentId?: string | null;
    assignment?: Assignment | null;
}

export default function MonProfil() {
    const [grower, setGrower] = useState<GrowerWithAssignment | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { success, error } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [growerResponse, assignmentsResponse] = await Promise.all([
                    fetch('/api/grower/profile'),
                    fetch('/api/admin/assignments'),
                ]);

                if (growerResponse.ok && assignmentsResponse.ok) {
                    const growerData = await growerResponse.json();
                    const assignmentsData = await assignmentsResponse.json();
                    setGrower(growerData);
                    setAssignments(assignmentsData);
                } else {
                    error('Erreur lors du chargement des données');
                }
            } catch (err) {
                error('Erreur lors du chargement des données');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [error]);

    const [formData, setFormData] = useState({
        bio: '',
        profilePhoto: '',
        assignmentId: '',
    });

    useEffect(() => {
        if (grower) {
            setFormData({
                bio: grower.bio || '',
                profilePhoto: grower.profilePhoto || '',
                assignmentId: grower.assignmentId || '',
            });
        }
    }, [grower]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (!grower) {
        return <div>Erreur lors du chargement du profil</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch('/api/grower/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bio: formData.bio.trim() || null,
                    profilePhoto: formData.profilePhoto.trim() || null,
                    assignmentId: formData.assignmentId || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du profil');
            }

            const updatedGrower = await response.json();
            setGrower(updatedGrower);
            success('Profil mis à jour avec succès');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
        } finally {
            setSubmitting(false);
        }
    };

    const selectedAssignment = assignments.find((a) => a.id === formData.assignmentId);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Informations de base */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label className="text-gray-700 font-medium">Nom</Label>
                            <Input
                                value={grower.name}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700 font-medium">Email</Label>
                            <Input
                                value={grower.email}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700 font-medium">Téléphone</Label>
                            <Input
                                value={grower.phone || 'Non renseigné'}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-700 font-medium">SIRET</Label>
                            <Input
                                value={grower.siret || 'Non renseigné'}
                                disabled
                                className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Photo de profil */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Photo de profil</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Ajoutez une photo de profil qui sera visible sur votre page exposant.
                    </p>
                    <ImageUpload
                        value={formData.profilePhoto}
                        onChange={(imageUrl) => setFormData({ ...formData, profilePhoto: imageUrl })}
                        placeholder="URL de votre photo de profil"
                        className="max-w-md"
                    />
                </div>

                {/* Bio */}
                <div className="border-b border-gray-100 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Bio</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Présentez-vous à vos clients. Cette bio sera visible sur votre profil public.
                    </p>
                    <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Parlez de votre exploitation, vos méthodes de production, votre passion pour l'agriculture..."
                        rows={6}
                        className="resize-none bg-white border-gray-200 focus:border-primary focus:ring-primary"
                    />
                    <p className="text-xs text-gray-500 mt-2">{formData.bio.length}/1000 caractères</p>
                </div>

                {/* Affectation de marché */}
                <div className="pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Affectation de marché</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Choisissez votre rayon de prédilection sur le marché physique.
                    </p>
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
                                value={formData.assignmentId}
                                onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
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
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setFormData({
                                bio: grower.bio || '',
                                profilePhoto: grower.profilePhoto || '',
                                assignmentId: grower.assignmentId || '',
                            });
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary hover:bg-primary-dark"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full inline-block" />
                                Enregistrement...
                            </>
                        ) : (
                            'Enregistrer'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
