export interface IAdmin {
    id: string;
    username: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAdminLoginPayload {
    username: string;
    password: string;
}

export interface IAdminLoginResponse {
    success: boolean;
    jwt: string;
    message?: string;
}

export interface IAdminTokenPayload {
    id: string;
    username: string;
    iat?: number;
    exp?: number;
}
