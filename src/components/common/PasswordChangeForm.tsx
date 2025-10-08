'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EyeIcon, EyeOffIcon } from '@/components/icons/eyes-open';
import { PasswordStrength, PasswordConfirmation, isPasswordValid } from '@/components/Form/PasswordStrength';
import usePasswordChange from '@/hooks/usePasswordChange';

interface PasswordChangeFormProps {
  userType: 'client' | 'grower' | 'deliverer' | 'admin';
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

// Constants moved to the hook

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
        autoComplete={id === 'currentPassword' ? 'current-password' : 'new-password'}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        disabled={isLoading}
        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
    {showStrength && <PasswordStrength password={value} />}
    {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
  </div>
));

PasswordInput.displayName = 'PasswordInput';

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  userType,
  title = "Modifier le mot de passe",
  description = "Changez votre mot de passe pour sécuriser votre compte"
}) => {
  const {
    changePassword,
    isLoading,
    error,
    success  } = usePasswordChange({ userType });

  const [formData, setFormData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<PasswordChangeData>>({});
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Référence pour nettoyer les données sensibles
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  // Nettoyer les données sensibles lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer les données sensibles de la mémoire
      if (formDataRef.current) {
        formDataRef.current.currentPassword = '';
        formDataRef.current.newPassword = '';
        formDataRef.current.confirmPassword = '';
      }
    };
  }, []);

  const handleInputChange = useCallback((field: keyof PasswordChangeData, value: string) => {
    setFormData((prev: PasswordChangeData) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<PasswordChangeData> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (!isPasswordValid(formData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe ne respecte pas les critères de sécurité';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await changePassword(formData);
      // Clear form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      // Error is handled by the hook
    }
  }, [formData, validateForm, changePassword]);


  const togglePasswordVisibility = useCallback((field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const isFormDisabled = isLoading;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
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
            isLoading={isFormDisabled}
          />

          <PasswordInput
            id="newPassword"
            label="Nouveau mot de passe"
            value={formData.newPassword}
            onChange={(value) => handleInputChange('newPassword', value)}
            error={errors.newPassword}
            showPassword={showPasswords.new}
            onToggleVisibility={() => togglePasswordVisibility('new')}
            isLoading={isFormDisabled}
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
              isLoading={isFormDisabled}
            />
            <PasswordConfirmation 
              password={formData.newPassword} 
              confirmPassword={formData.confirmPassword} 
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isFormDisabled}
          >
            {isLoading ? 'Modification en cours...' : 'Modifier le mot de passe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;