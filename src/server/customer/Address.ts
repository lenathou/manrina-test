import { IdGenerator } from '../../service/IdGenerator';
import { IAddress, IAddressCreateParams } from './IAddress';

export class Address implements IAddress {
    readonly id: string;
    readonly postalCode: string;
    readonly address: string;
    readonly city: string;
    readonly country: string;
    readonly name?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly type: string;
    readonly customerId?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    constructor(address: IAddress) {
        this.id = address.id;
        this.postalCode = address.postalCode;
        this.address = address.address;
        this.city = address.city;
        this.country = address.country;
        this.name = address.name;
        this.firstName = address.firstName;
        this.lastName = address.lastName;
        this.type = address.type;
        this.customerId = address.customerId;
        this.createdAt = address.createdAt;
        this.updatedAt = address.updatedAt;
    }

    static createNew(params: IAddressCreateParams): Address {
        return new Address({
            id: IdGenerator.generateIdWithPrefix('addr'),
            ...params,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}