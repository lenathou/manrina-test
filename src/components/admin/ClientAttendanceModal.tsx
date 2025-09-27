import React, { useState, useEffect, useCallback } from 'react';
import SearchBarNext from '@/components/ui/SearchBarNext';
import { formatDateTimeShort, formatDateLong } from '@/utils/dateUtils';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';

interface ClientAttendance {
    id: string;
    status: 'PLANNED' | 'CANCELLED';
    createdAt: string;
    updatedAt: string;
    cancelledAt?: string;
    customer: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
}

interface ClientAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    marketSessionId: string;
    marketSessionDate: string;
}

export const ClientAttendanceModal: React.FC<ClientAttendanceModalProps> = ({
    isOpen,
    onClose,
    marketSessionId,
    marketSessionDate
}) => {
    const [attendances, setAttendances] = useState<ClientAttendance[]>([]);
    const [filteredAttendances, setFilteredAttendances] = useState<ClientAttendance[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    const loadAttendances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                ...(searchTerm && { search: searchTerm })
            });
            
            const response = await fetch(
                `/api/admin/market-sessions/${marketSessionId}/client-attendances?${params}`,
                {
                    credentials: 'include'
                }
            );
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des données');
            }
            
            const data = await response.json();
            setAttendances(data.attendances || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    }, [marketSessionId, currentPage, searchTerm, itemsPerPage]);

    // Charger les données quand le modal s'ouvre
    useEffect(() => {
        if (isOpen && marketSessionId) {
            loadAttendances();
        }
    }, [isOpen, marketSessionId, currentPage, searchTerm, loadAttendances]);

    // Filtrer les résultats localement
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAttendances(attendances);
        } else {
            const filtered = attendances.filter(attendance =>
                attendance.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                attendance.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (attendance.customer.phone && attendance.customer.phone.includes(searchTerm))
            );
            setFilteredAttendances(filtered);
        }
    }, [attendances, searchTerm]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Réinitialiser à la première page lors d'une recherche
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background">
                {/* En-tête du modal */}
                <CardHeader className="bg-secondary text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold text-white">
                                Clients prévoyant de venir
                            </CardTitle>
                            <p className="text-sm text-white mt-1 opacity-90">
                                Session du {formatDateLong(marketSessionDate)}
                            </p>
                        </div>
                        <button
                                onClick={onClose}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {/* Barre de recherche */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="relative">
                            <SearchBarNext
                                placeholder="Rechercher un client (nom, email, téléphone)..."
                                value={searchTerm}
                                onSearch={handleSearchChange}
                            />
                        </div>
                    </div>

                    {/* Contenu du modal */}
                    <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {error && (
                        <div className="p-6 text-center text-red-600">
                            <p>{error}</p>
                            <button
                                onClick={loadAttendances}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                                Réessayer
                            </button>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Chargement...</p>
                        </div>
                    ) : filteredAttendances.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <p>
                                {searchTerm 
                                    ? 'Aucun client trouvé pour cette recherche' 
                                    : 'Aucun client n\'a encore signalé sa présence pour cette session'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {/* Statistiques */}
                            <div className="mb-4 text-sm text-gray-600">
                                {filteredAttendances.length} client{filteredAttendances.length > 1 ? 's' : ''} trouvé{filteredAttendances.length > 1 ? 's' : ''}
                            </div>

                            {/* Tableau des clients */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead className="text-sm text-gray-600">
                                        <tr>
                                            <th className="py-2 px-4">Nom</th>
                                            <th className="py-2 px-4">Email</th>
                                            <th className="py-2 px-4">Téléphone</th>
                                            <th className="py-2 px-4">Statut</th>
                                            <th className="py-2 px-4">Date de signalement</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {filteredAttendances.map((attendance) => (
                                            <tr key={attendance.id} className="bg-gray-50 rounded-lg">
                                                <td className="py-3 px-4 rounded-l-lg font-medium">
                                                    {attendance.customer.name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {attendance.customer.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {attendance.customer.phone || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        attendance.status === 'PLANNED' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {attendance.status === 'PLANNED' ? 'Confirmé' : 'Annulé'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 rounded-r-lg">
                                                    {formatDateTimeShort(attendance.createdAt)}
                                                    {attendance.status === 'CANCELLED' && attendance.cancelledAt && (
                                                        <div className="text-xs text-red-600 mt-1">
                                                            Annulé le {formatDateTimeShort(attendance.cancelledAt)}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600">
                                        Page {currentPage} sur {totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};