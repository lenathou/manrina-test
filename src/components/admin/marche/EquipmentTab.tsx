/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Text } from '@/components/ui/Text';
import { MarketSession, MarketParticipation, Grower, MarketProduct, Prisma } from '@prisma/client';

type MarketSessionWithDetails = MarketSession & {
  participations: (MarketParticipation & {
    grower: Grower;
  })[];
  marketProducts: MarketProduct[];
  _count: {
    participations: number;
    marketProducts: number;
  };
  tentsStatus?: EquipmentStatus;
  tablesStatus?: EquipmentStatus;
};

type EquipmentStatus = 'none' | 'provided' | 'required';

interface EquipmentForm {
  commissionRate: Prisma.Decimal;
  tentsStatus: EquipmentStatus;
  tablesStatus: EquipmentStatus;
}

interface EquipmentTabProps {
  session: MarketSessionWithDetails;
  isEditing: boolean;
  editForm: EquipmentForm;
  setEditForm: (form: EquipmentForm) => void;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

interface EquipmentItemProps {
  title: string;
  icon: React.ReactNode;
  status: EquipmentStatus;
  isEditing: boolean;
  onStatusChange: (status: EquipmentStatus) => void;
}

function EquipmentItem({
  title,
  icon,
  status,
  isEditing,
  onStatusChange,
}: EquipmentItemProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'provided':
        return {
          text: 'Fourni par l\'organisation',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          dotColor: 'bg-green-500'
        };
      case 'required':
        return {
          text: 'Requis des producteurs',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-700',
          dotColor: 'bg-orange-500'
        };
      default:
        return {
          text: 'Aucun matériel',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          dotColor: 'bg-gray-400'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Text variant="body" className="font-medium text-gray-700 mb-3">Configuration :</Text>
            
            {/* Option: Aucun */}
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name={`${title}-status`}
                value="none"
                checked={status === 'none'}
                onChange={() => onStatusChange('none')}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <Text variant="body" className="text-gray-700">Aucun matériel</Text>
              </div>
            </label>

            {/* Option: Fourni */}
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-green-50 transition-colors">
              <input
                type="radio"
                name={`${title}-status`}
                value="provided"
                checked={status === 'provided'}
                onChange={() => onStatusChange('provided')}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Text variant="body" className="text-gray-700">Fourni par l'organisation</Text>
              </div>
            </label>

            {/* Option: Requis */}
            <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-orange-50 transition-colors">
              <input
                type="radio"
                name={`${title}-status`}
                value="required"
                checked={status === 'required'}
                onChange={() => onStatusChange('required')}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <Text variant="body" className="text-gray-700">Requis des producteurs</Text>
              </div>
            </label>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusDisplay.dotColor}`}></div>
              <Text variant="body" className={`font-medium ${statusDisplay.textColor}`}>
                {statusDisplay.text}
              </Text>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function EquipmentTab({
  session,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onEdit,
  onCancel,
  isLoading
}: EquipmentTabProps) {
  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
        <div>
          <Text variant="h2" className="text-gray-900">Configuration du matériel</Text>
          <Text variant="body" className="text-gray-600 mt-1">
            Gérez le matériel fourni par l'organisation et celui requis des producteurs
          </Text>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                onClick={onSave}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onEdit}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Commission */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Taux de commission</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <Label htmlFor="commissionRate" className="text-sm font-medium text-gray-700">
                Taux de commission (%)
              </Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={editForm.commissionRate ? Number(editForm.commissionRate) : 0}
                onChange={(e) => setEditForm({ ...editForm, commissionRate: new Prisma.Decimal(parseFloat(e.target.value) || 0) })}
                className="w-24 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Text variant="body" className="font-medium text-blue-700">Taux de commission appliqué</Text>
              <Text variant="h3" className="font-bold text-blue-700">{session.commissionRate ? Number(session.commissionRate) : 0}%</Text>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matériel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chapiteaux */}
        <EquipmentItem
          title="Chapiteaux"
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l18-18M3 21h18M3 21V9l9-6 9 6v12" />
            </svg>
          }
          status={editForm.tentsStatus || 'none'}
          isEditing={isEditing}
          onStatusChange={(status) => setEditForm({ ...editForm, tentsStatus: status })}
        />

        {/* Tables */}
        <EquipmentItem
          title="Tables"
          icon={
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V8a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          }
          status={editForm.tablesStatus || 'none'}
          isEditing={isEditing}
          onStatusChange={(status) => setEditForm({ ...editForm, tablesStatus: status })}
        />
      </div>

      {/* Résumé */}
      {!isEditing && (
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Résumé de la configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Text variant="body" className="font-medium text-gray-700">Configuration des chapiteaux</Text>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    session.tentsStatus === 'provided' ? 'bg-green-500' :
                    session.tentsStatus === 'required' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  <Text variant="body" className="text-gray-600">
                    {session.tentsStatus === 'provided' ? 'Fournis par l\'organisation' :
                     session.tentsStatus === 'required' ? 'Requis des producteurs' : 'Aucun matériel'}
                  </Text>
                </div>
              </div>
              
              <div className="space-y-3">
                <Text variant="body" className="font-medium text-gray-700">Configuration des tables</Text>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    session.tablesStatus === 'provided' ? 'bg-green-500' :
                    session.tablesStatus === 'required' ? 'bg-orange-500' : 'bg-gray-400'
                  }`}></div>
                  <Text variant="body" className="text-gray-600">
                    {session.tablesStatus === 'provided' ? 'Fournis par l\'organisation' :
                     session.tablesStatus === 'required' ? 'Requis des producteurs' : 'Aucun matériel'}
                  </Text>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}