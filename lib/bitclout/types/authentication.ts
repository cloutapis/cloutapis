export interface AuthenticatedUserTypes {
    standard: { authenticatedUser: AuthenticatedUser, key: AuthenticatedUserEncryptionKey },
    nonStandard: { authenticatedUser: AuthenticatedUser, key: AuthenticatedUserEncryptionKey } | undefined
}

export interface SecureStoreAuthenticatedUser {
    [key: string]: AuthenticatedUser;
}

export interface SecureStoreAuthenticatedUserEncryptionKey {
    [key: string]: AuthenticatedUserEncryptionKey;
}

export interface AuthenticatedUser {
    publicKey: string;
    encryptedSeedHex: string;
}

export interface AuthenticatedUserEncryptionKey {
    key: string;
    iv: string;
}
