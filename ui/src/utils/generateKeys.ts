import {generateKeyPair, RSAKeyPairOptions} from 'crypto';

export interface Keys {
    publicKey: string;
    privateKey: string;
}

export const generateKeys = async (): Promise<Keys> => {
    return new Promise((resolve, reject) => {
        generateKeyPair(
            'rsa',
            {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                },
            } as RSAKeyPairOptions<'pem', 'pem'>,
            (err, publicKey, privateKey) =>
                err ? reject(err) : resolve({publicKey, privateKey}),
        );
    });
};
