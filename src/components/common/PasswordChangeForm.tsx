'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon } from '@/components/icons/eyes-open';
import { PasswordStrength, PasswordConfirmation, isPasswordValid } from '@/components/Form/PasswordStrength';

interface PasswordChangeFormProps {
  onSubmit: (data: PasswordChangeData) => Promise<void>;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showPassword: boolean;
  onToggleVisibility: () => void;
  isLoading?: boolean;
  showStrength?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = React.memo(({ 
  id, 
  label, 
  value, 
  onChange, 
  error, 
  showPassword, 
  onToggleVisibility, 
  isLoading,
  showStrength = false
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'border-red-500' : ''}
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        disabled={isLoading}
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
    {showStrength && <PasswordStrength password={value} />}
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
));

PasswordInput.displayName = 'PasswordInput';

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSubmit,
  isLoading = false,
  title = "Modifier le mot de passe",
  description = "Changez votre mot de passe pour sécuriser votre compte"
}) => {
  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<Partial<PasswordChangeData>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<PasswordChangeData> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (!isPasswordValid(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères, 1 chiffre, 1 majuscule et 1 symbole (!@#$%^&*).';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      setSuccessMessage('Mot de passe modifié avec succès');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    }
  };

  const handleInputChange = useCallback((field: keyof PasswordChangeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const togglePasswordVisibility = useCallback((field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);



  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && (
            <Alert className="border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <PasswordInput
            id="currentPassword"
            label="Mot de passe actuel"
            value={formData.currentPassword}
            onChange={(value) => handleInputChange('currentPassword', value)}
            error={errors.currentPassword}
            showPassword={showPasswords.current}
            onToggleVisibility={() => togglePasswordVisibility('current')}
            isLoading={isLoading}
          />

          <PasswordInput
            id="newPassword"
            label="Nouveau mot de passe"
            value={formData.newPassword}
            onChange={(value) => handleInputChange('newPassword', value)}
            error={errors.newPassword}
            showPassword={showPasswords.new}
            onToggleVisibility={() => togglePasswordVisibility('new')}
            isLoading={isLoading}
            showStrength={true}
          />

          <div className="space-y-2">
            <PasswordInput
              id="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              showPassword={showPasswords.confirm}
              onToggleVisibility={() => togglePasswordVisibility('confirm')}
              isLoading={isLoading}
            />
            <PasswordConfirmation 
              password={formData.newPassword} 
              confirmPassword={formData.confirmPassword} 
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Modification en cours...' : 'Modifier le mot de passe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;