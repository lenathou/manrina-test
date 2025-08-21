'use client';

import React from 'react';
import { NotificationType } from '@prisma/client';
import { NotificationConfigUtils } from '@/config/notifications/NotificationConfigUtils';
import CancelIcon from '@/icons/cancel';
import SettingsIcon from '@/icons/settings';
import InfoIcon from '@/icons/info';
import AlertIcon from '@/icons/alert';
import CheckIcon from '@/icons/check';
import BellIcon from '@/icons/bell';
import { PlaceholderIcon } from '@/components/icons/PlaceholderIcon';

interface NotificationIconProps {
    type: NotificationType;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Composant dynamique pour afficher l'icône appropriée selon le type de notification
 * Utilise la configuration centralisée pour déterminer l'icône et les couleurs
 */
const NotificationIcon: React.FC<NotificationIconProps> = ({ type, size = 'md', className = '' }) => {
    const config = NotificationConfigUtils.getUIConfig(type);

    // Mapping des tailles
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    // Mapping des icônes disponibles
    const iconMap: Record<string, any> = {
        cancel: CancelIcon,
        settings: SettingsIcon,
        info: InfoIcon,
        alert: AlertIcon,
        check: CheckIcon,
        bell: BellIcon,
        announcement: InfoIcon, // Fallback pour les annonces
        maintenance: SettingsIcon, // Fallback pour la maintenance
    };

    // Récupérer l'icône appropriée
    const getIconSvg = (): string => {
        const iconName = config.icon;
        const iconData = iconMap[iconName];

        if (iconData && iconData.path && iconData.viewBox) {
            return `<svg viewBox="${iconData.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">${iconData.path}</svg>`;
        }

        // Fallback vers PlaceholderIcon si l'icône n'est pas trouvée
        return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>`;
    };

    return (
        <div
            className={`${sizeClasses[size]} text-blue-600 ${className || ''}`}
            dangerouslySetInnerHTML={{ __html: getIconSvg() }}
            title={`Notification: ${config.defaultTitle}`}
        />
    );
};

export default NotificationIcon;
