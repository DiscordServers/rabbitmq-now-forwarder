import {Channel, ConsumeMessage} from 'amqplib';
import * as NodeRSA from 'node-rsa';
import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import {Instance, Listener} from '../types/Metadata';

const processMessage = (configuration: Configuration, instance: Instance, channel: Channel, listener: Listener) => (
    msg: ConsumeMessage | null,
): any => {
    const key = new NodeRSA(configuration.privateKey);
    const signature = key.sign(msg.content.toString(), 'base64');

    const body = {
        message:    msg.content.toString(),
        signature,
        fields:     msg.fields,
        properties: msg.properties,
    };
    console.log('Sending body to: ' + listener.endpoint, body);

    fetch(listener.endpoint, {
        method:  'POST',
        headers: {
            'Content-Type':       'application/json',
            'X-Configuration-Id': configuration.configurationId,
            'X-Installation-Id':  configuration.installationId,
            'X-Instance-Id':      instance.id,
        },
        body:    JSON.stringify(body),
    })
        .then((response) => {
            if (response.status <= 300) {
                channel.ack(msg, false);

                return;
            }

            throw new Error('Bad status code: ' + response.status);
        })
        .catch((error) => {
            console.error(error);

            setTimeout(
                () => channel.nack(msg, false, true),
                1000 * 30,
            );
        });
};

export default processMessage;
