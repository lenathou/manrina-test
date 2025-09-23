import { createContext, ReactNode, useContext } from 'react';
import { IAdminTokenPayload } from '@/server/admin/IAdmin';
import { ICustomerTokenPayload } from '@/server/customer/ICustomer';
import { IDelivererTokenPayload } from '@/server/deliverer/IDeliverer';
import { IGrowerTokenPayload } from '@/server/grower/IGrower';

export type UserRole = 'admin' | 'client' | 'producteur' | 'livreur' | 'public';

export interface AuthState {
    role: UserRole;
    user: IAdminTokenPayload | ICustomerTokenPayload | IGrowerTokenPayload | IDelivererTokenPayload | null;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthContextProvider = ({ value, children }: { value: AuthState; children: ReactNode }) => {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthContextProvider');
    }
    return context;
};

export const useOptionalAuthContext = () => {
    return useContext(AuthContext);
};

export { AuthContext };
