import { v4 as uuidv4 } from 'uuid';

export class IdGenerator {
    public static generateIdWithPrefix = (prefix: string) => {
        return `${prefix}_${uuidv4()}`;
    };
}
