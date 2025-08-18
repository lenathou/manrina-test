// Templates d'email utilisant Tailwind CSS
export { default as NotificationEmailTemplate } from './NotificationEmailTemplate';
export { default as MarketCancellationEmailTemplate, generateMarketCancellationEmailHTML } from './MarketCancellationEmailTemplate';
export { default as GeneralAnnouncementEmailTemplate, generateGeneralAnnouncementEmailHTML } from './GeneralAnnouncementEmailTemplate';
export { default as SystemMaintenanceEmailTemplate, generateSystemMaintenanceEmailHTML } from './SystemMaintenanceEmailTemplate';
export { default as ProductRecallEmailTemplate, generateProductRecallEmailHTML } from './ProductRecallEmailTemplate';

// Types
export interface EmailTemplateProps {
  input: {
    type: string;
    title: string;
    message: string;
    expiresAt?: Date;
  };
  recipientName?: string;
}

export interface MarketEmailTemplateProps extends EmailTemplateProps {
  marketSession?: {
    name: string;
    date: string;
  };
}

export interface ProductEmailTemplateProps extends EmailTemplateProps {
  recipient: {
    email: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
    grower: {
      name: string;
    };
  };
}