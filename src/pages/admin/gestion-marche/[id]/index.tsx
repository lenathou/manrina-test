/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { MarketSession, MarketParticipation, Grower, MarketProduct, Partner } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { formatDateForInput, formatTimeForInput } from '@/utils/dateUtils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/Toast';
import { DetailsTab } from '@/components/admin/gestion-marche/DetailsTab';
import { ParticipantsTab } from '@/components/admin/gestion-marche/ParticipantsTab';
import { EquipmentTab } from '@/components/admin/gestion-marche/EquipmentTab';
import { AssignmentsTab } from '@/components/admin/gestion-marche/AssignmentsTab';

type EquipmentStatus = 'none' | 'provided' | 'required';

type MarketSessionWithDetails = MarketSession & {
    participations: (MarketParticipation & {
        grower: Grower;
    })[];
    marketProducts: MarketProduct[];
    partners?: {
        partner: Partner;
    }[];
    _count: {
        participations: number;
        marketProducts: number;
    };
    tentsStatus?: EquipmentStatus;
    tablesStatus?: EquipmentStatus;
    chairsStatus?: EquipmentStatus;
};

interface Props {
    session: MarketSessionWithDetails;
}

function MarketSessionDetailPage({ session: initialSession }: Props) {
    const router = useRouter();
    const { success, error } = useToast();
    const [session, setSession] = useState<MarketSessionWithDetails>(initialSession);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        name: session.name,
        date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
        startTime: session.startTime ? new Date(session.startTime).toTimeString().slice(0, 5) : '',
        endTime: session.endTime ? new Date(session.endTime).toTimeString().slice(0, 5) : '',
        location: session.location || '',
        description: session.description || '',
    });

    const [equipmentForm, setEquipmentForm] = useState({
        commissionRate: session.commissionRate,
        tentsStatus: session.tentsStatus || ('none' as EquipmentStatus),
        tablesStatus: session.tablesStatus || ('none' as EquipmentStatus),
        chairsStatus: session.chairsStatus || ('none' as EquipmentStatus),
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/session-marche/${session.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde');
            }

            const updatedSession = await response.json();
            setSession(updatedSession);
            setIsEditing(false);
            success('Session mise à jour avec succès');
        } catch (err) {
            console.error('Erreur:', err);
            error('Erreur lors de la sauvegarde');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        // Vérifier s'il y a des participants confirmés
        const confirmedParticipants = session.participations.filter((p) => p.status === 'CONFIRMED');

        if (confirmedParticipants.length > 0) {
            error('Impossible de supprimer une session avec des participants confirmés');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/session-marche/${session.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la suppression');
            }

            success('Session supprimée avec succès');
            router.push('/admin/gestion-marche');
        } catch (err) {
            console.error('Erreur:', err);
            error('Erreur lors de la suppression');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => setIsEditing(true);
    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            name: session.name,
            date: session.date ? formatDateForInput(session.date) : '',
            startTime: session.startTime ? formatTimeForInput(session.startTime) : '',
            endTime: session.endTime ? formatTimeForInput(session.endTime) : '',
            location: session.location || '',
            description: session.description || '',
        });
    };

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Tabs
                    defaultValue="details"
                    className="space-y-8"
                >
                    {/* Sélecteur d'onglets amélioré */}
                    <div className="bg-white rounded-lg border border-gray-200 p-1">
                        <TabsList className="grid w-full grid-cols-4 bg-transparent gap-1">
                            <TabsTrigger
                                value="details"
                                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 data-[state=active]:shadow-sm border border-transparent rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                            >
                                Détails de la session
                            </TabsTrigger>
                            <TabsTrigger
                                value="participants"
                                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 data-[state=active]:shadow-sm border border-transparent rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                            >
                                Participants
                            </TabsTrigger>
                            <TabsTrigger
                                value="equipment"
                                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 data-[state=active]:shadow-sm border border-transparent rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                            >
                                Commission & Matériel
                            </TabsTrigger>
                            <TabsTrigger
                                value="assignments"
                                className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:border-orange-200 data-[state=active]:shadow-sm border border-transparent rounded-md px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                            >
                                Affectations
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Contenu des onglets */}
                    <TabsContent
                        value="details"
                        className="space-y-6"
                    >
                        <DetailsTab
                            session={session}
                            isEditing={isEditing}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            onSave={handleSave}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    <TabsContent
                        value="participants"
                        className="space-y-6"
                    >
                        <ParticipantsTab session={session} />
                    </TabsContent>

                    <TabsContent
                        value="equipment"
                        className="space-y-6"
                    >
                        <EquipmentTab
                            session={session}
                            isEditing={isEditing}
                            editForm={equipmentForm}
                            setEditForm={setEquipmentForm}
                            onSave={handleSave}
                            onEdit={handleEdit}
                            onCancel={handleCancel}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    <TabsContent
                        value="assignments"
                        className="space-y-6"
                    >
                        <AssignmentsTab session={session} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default MarketSessionDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;

    try {
        const session = await prisma.marketSession.findUnique({
            where: { id: id as string },
            include: {
                participations: {
                    include: {
                        grower: true,
                    },
                },
                marketProducts: true,
                partners: {
                    include: {
                        partner: true,
                    },
                },
                _count: {
                    select: {
                        participations: true,
                        marketProducts: true,
                    },
                },
            },
        });

        if (!session) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                session: JSON.parse(JSON.stringify(session)),
            },
        };
    } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        return {
            notFound: true,
        };
    }
};
