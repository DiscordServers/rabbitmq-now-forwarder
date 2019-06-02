import * as keypair from 'keypair';

export interface Keys {
    publicKey: string;
    privateKey: string;
}

export const generateKeys = async (): Promise<Keys> => {
    return new Promise((resolve) => {
        const keys = keypair();

        resolve({publicKey: keys.public, privateKey: keys.private});
    });
};
