import { Form } from '@/components/Form/Form';
import { TextFormField } from '@/components/Form/Input';
import { Text } from '@/components/ui/text';
import type { IGrower } from '@/server/grower/IGrower';
import { backendFetchService } from '@/service/BackendFetchService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { withAdminLayout } from '../../components/layouts/AdminLayout';

function AdminGrowersPage() {
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [editGrower, setEditGrower] = useState<IGrower | null>(null);
    const [formError, setFormError] = useState('');
    const [showProfilePhoto, setShowProfilePhoto] = useState(false);

    // Fetch growers
    const {
        data: growers = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['growers'],
        queryFn: () => backendFetchService.listGrowers(),
    });

    // Mutations
    const createGrowerMutation = useMutation({
        mutationFn: (payload: { name: string; email: string; password: string; profilePhoto?: string }) =>
            backendFetchService.createGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
        },
    });

    const updateGrowerMutation = useMutation({
        mutationFn: (payload: { id: string; name: string; profilePhoto?: string; updatedAt: Date }) =>
            backendFetchService.updateGrower(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
        },
    });

    const deleteGrowerMutation = useMutation({
        mutationFn: (growerId: string) => backendFetchService.deleteGrower(growerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['growers'] });
        },
    });

    const formFields: TextFormField[] = [
        { type: 'text', name: 'name', placeholder: 'Name', required: true },
        { type: 'text', name: 'email', placeholder: 'Email', required: true, inputMode: 'email' },
        { type: 'password', name: 'password', placeholder: 'Password', required: !editGrower },
        ...(showProfilePhoto
            ? [{ type: 'text' as const, name: 'profilePhoto', placeholder: 'Profile Photo URL (optional)' }]
            : []),
    ];

    const openCreateModal = () => {
        setEditGrower(null);
        setFormError('');
        setShowProfilePhoto(false);
        setModalVisible(true);
    };

    const openEditModal = (grower: IGrower) => {
        setEditGrower(grower);
        setFormError('');
        setShowProfilePhoto(!!grower.profilePhoto);
        setModalVisible(true);
    };

    const handleDelete = async (growerId: string) => {
        if (!window.confirm('Are you sure you want to delete this grower?')) return;
        deleteGrowerMutation.mutate(growerId);
    };

    const handleFormSubmit = async (data: IGrower) => {
        setFormError('');
        try {
            if (editGrower) {
                await updateGrowerMutation.mutateAsync({
                    id: editGrower.id,
                    name: data.name,
                    profilePhoto: showProfilePhoto ? data.profilePhoto : undefined,
                    updatedAt: new Date(),
                });
            } else {
                await createGrowerMutation.mutateAsync({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    profilePhoto: showProfilePhoto ? data.profilePhoto : undefined,
                });
            }
            setModalVisible(false);
        } catch {
            setFormError('Failed to save grower');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold mb-8">Manage Growers</h1>
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded mb-8 hover:bg-blue-700"
                onClick={openCreateModal}
            >
                + Add Grower
            </button>
            {error && <div className="text-red-600 mb-4">{String(error)}</div>}
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="overflow-x-auto rounded shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold">Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Email</th>
                                <th className="px-4 py-2 text-left font-semibold">Profile Photo</th>
                                <th className="px-4 py-2 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {growers.map((grower: IGrower) => (
                                <tr
                                    key={grower.id}
                                    className="border-t border-gray-100"
                                >
                                    <td className="px-4 py-2">{grower.name}</td>
                                    <td className="px-4 py-2">{grower.email}</td>
                                    <td className="px-4 py-2">{grower.profilePhoto || '-'}</td>
                                    <td className="px-4 py-2 space-x-2">
                                        <button
                                            className="text-blue-600 hover:underline"
                                            onClick={() => openEditModal(grower)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-600 hover:underline"
                                            onClick={() => handleDelete(grower.id)}
                                            disabled={deleteGrowerMutation.isPending}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                        <Text
                            variant="h2"
                            className="mb-4 text-center w-full"
                        >
                            {editGrower ? 'Edit Grower' : 'Add Grower'}
                        </Text>
                        <Form
                            formFields={formFields}
                            submitLabel="Save"
                            onSubmit={handleFormSubmit}
                            isDisabled={createGrowerMutation.isPending || updateGrowerMutation.isPending}
                        />
                        {!showProfilePhoto && (
                            <button
                                className="text-blue-600 mb-3 hover:underline w-full text-left"
                                onClick={() => setShowProfilePhoto(true)}
                            >
                                + Add Profile Photo (optional)
                            </button>
                        )}
                        {formError && <div className="text-red-600 mb-3">{formError}</div>}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                                onClick={() => setModalVisible(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAdminLayout(AdminGrowersPage);