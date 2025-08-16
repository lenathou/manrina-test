export interface IAddress {
  id: string;
  postalCode: string;
  address: string;
  city: string;
  country: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  type: string; // customer, relay, other
  customerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddressCreateParams {
  customerId: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  type: string;
}

export interface IAddressUpdateParams {
  id: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
}