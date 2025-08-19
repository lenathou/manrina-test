import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { withAdminLayout } from '@/components/layouts/AdminLayout';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ImageUpload } from '@/components/ui/ImageUpload';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Prisma } from '@prisma/client';

type Partner = Prisma.PartnerGetPayload<object>;

interface PartnerFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
}

function PartnersPageContent() {
  const { success, error } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    description: '',
    imageUrl: '',
    website: '',
    email: '',
    phone: ''
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: '', name: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger les partenaires
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      } else {
        error('Erreur lors du chargement des partenaires');
      }
    } catch (err) {
      error('Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      website: '',
      email: '',
      phone: ''
    });
    setEditingPartner(null);
    setShowForm(false);
  };

  // Ouvrir le formulaire pour créer un nouveau partenaire
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // Ouvrir le formulaire pour éditer un partenaire
  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      description: partner.description || '',
      imageUrl: partner.imageUrl || '',
      website: partner.website || '',
      email: partner.email || '',
      phone: partner.phone || ''
    });
    setEditingPartner(partner);
    setShowForm(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      error('Le nom du partenaire est requis');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingPartner 
        ? `/api/admin/partners/${editingPartner.id}`
        : '/api/admin/partners';
      const method = editingPartner ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        success(editingPartner ? 'Partenaire modifié avec succès' : 'Partenaire créé avec succès');
        resetForm();
        fetchPartners();
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      error('Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmer la suppression
  const handleDeleteConfirm = (partner: Partner) => {
    setConfirmDialog({
      isOpen: true,
      id: partner.id,
      name: partner.name
    });
  };

  // Supprimer un partenaire
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/partners/${confirmDialog.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        success('Partenaire supprimé avec succès');
        fetchPartners();
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Erreur lors de la suppression');
      }
    } catch (err) {
      error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      setConfirmDialog({ isOpen: false, id: '', name: '' });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Text variant="h1" className="text-2xl font-bold text-gray-900">
          Gestion des Partenaires
        </Text>
        <Button
          onClick={handleCreate}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Ajouter un partenaire
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <Text variant="h2" className="text-lg font-semibold">
              {editingPartner ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </Text>
            <Button
              onClick={resetForm}
              variant="outline"
              className="text-gray-600"
            >
              Annuler
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image du partenaire
              </label>
              <ImageUpload
                value={formData.imageUrl || ''}
                onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
                placeholder="URL de l'image ou uploadez un fichier"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="text-gray-600"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? 'Sauvegarde...' : (editingPartner ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des partenaires */}
      <div className="bg-white rounded-lg shadow-md">
        {partners.length === 0 ? (
          <div className="p-8 text-center">
            <Text variant="body" className="text-gray-500">
              Aucun partenaire enregistré
            </Text>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partenaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {partner.imageUrl && (
                          <Image
                            src={partner.imageUrl}
                            alt={partner.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {partner.name}
                          </div>
                          {partner.description && (
                            <div className="text-sm text-gray-500">
                              {partner.description.length > 50 
                                ? `${partner.description.substring(0, 50)}...` 
                                : partner.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {partner.email && (
                          <div>{partner.email}</div>
                        )}
                        {partner.phone && (
                          <div>{partner.phone}</div>
                        )}
                        {partner.website && (
                          <a 
                            href={partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Site web
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        partner.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {partner.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(partner)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleDeleteConfirm(partner)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onCancel={() => setConfirmDialog({ isOpen: false, id: '', name: '' })}
        onConfirm={handleDelete}
        title="Supprimer le partenaire"
        message={`Êtes-vous sûr de vouloir supprimer le partenaire "${confirmDialog.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleting}
        type="danger"
      />
    </div>
  );
}

function PartnersPage() {
  return <PartnersPageContent />;
}

export default withAdminLayout(PartnersPage);