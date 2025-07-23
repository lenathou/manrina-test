export interface ICustomer {
  id: string;
  email: string;
  name: string;
  phone: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerLoginPayload {
  email: string;
  password: string;
}

export interface ICustomerLoginResponse {
  success: boolean;
  jwt: string;
  message?: string;
}

export interface ICustomerTokenPayload {
  id: string;
  email: string;
  name: string;
  phone: string;
}

export interface ICustomerCreateParams {
  email: string;
  name: string;
  phone: string;
  password: string; 
}
export interface ICustomerUpdateParams {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
}