export type MergeWith<T, U> = Omit<T, keyof U> & U;
