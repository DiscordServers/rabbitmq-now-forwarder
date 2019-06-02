import {Channel, ConsumeMessage} from 'amqplib';
import * as crypto from 'crypto';
import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import {Instance, Listener} from '../types/Metadata';

const processMessage = (configuration: Configuration, instance: Instance, channel: Channel, listener: Listener) => (
    msg: ConsumeMessage | null,
): any => {
    const signerObject = crypto.createSign('RSA-SHA512');
    const message = msg.content;
    signerObject.update(msg.content);
    const signature = signerObject.sign(configuration.privateKey, 'base64');

    const body = {
        message,
        signature,
        fields: msg.fields,
        properties: msg.properties,
    };
    console.log('Sending body to: ' + listener.endpoint, body);

    fetch(listener.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Configuration-Id': configuration.configurationId,
            'X-Installation-Id': configuration.installationId,
            'X-Instance-Id': instance.id,
        },
        body: JSON.stringify(body),
    })
        .catch((error) => {
            console.error(error);

            channel.nack(msg, false, true);
        })
        .then(() => channel.ack(msg, false));
};

export default processMessage;
