import {Channel, ConsumeMessage} from 'amqplib';
import deepEqual from 'deep-equal';
import NodeRSA from 'node-rsa';
import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';

import {Listener as ListenerMetadata} from '../types/Metadata';
import getRabbitChannel from '../util/getRabbitChannel';
import Instance from './Instance';

export default class Listener {
    public get id(): string {
        return this.metadata.id;
    }

    public get metadata(): ListenerMetadata {
        return this._metadata;
    }

    public get configuration(): Configuration {
        return this.instance.configuration;
    }

    private started: boolean = false;
    private channel: Channel;

    public constructor(public readonly instance: Instance, private _metadata: ListenerMetadata) {
    }

    public async start() {
        if (this.started) {
            return;
        }

        this.channel = await getRabbitChannel(this.instance.metadata);

        await this.channel.consume(this.metadata.queue, this.processMessage);
        this.started = true;
    }

    public async stop() {
        if (!this.started) {
            return;
        }

        await this.channel.close();
        this.started = false;
    }

    public update(metadata: ListenerMetadata): boolean {
        const changed = !deepEqual(this.metadata, metadata);
        this._metadata = metadata;

        return changed;
    }

    public async restart() {
        await this.stop();
        await this.start();
    }

    private processMessage = async (message: ConsumeMessage | null) => {
        if (!this.started || !message) {
            return;
        }

        const key       = new NodeRSA(this.instance.configuration.privateKey);
        const signature = key.sign(message.content.toString(), 'base64');

        const body = {
            message:    message.content.toString(),
            signature,
            fields:     message.fields,
            properties: message.properties,
        };

        try {
            const response = await fetch(this.metadata.endpoint, {
                method:  'POST',
                headers: {
                    'Content-Type':       'application/json',
                    'X-Configuration-Id': this.configuration.configurationId,
                    'X-Installation-Id':  this.configuration.installationId,
                    'X-Instance-Id':      this.id,
                },
                body:    JSON.stringify(body),
            });

            if (response.status === this.metadata.expected_status_code) {
                this.channel.ack(message, false);

                return;
            }

            throw new Error('Bad status code: ' + response.status);
        } catch (error) {
            console.error(error);

            if (this.metadata.retry_on_failure) {
                console.error('Retrying message in 5 seconds.');
                setTimeout(
                    () => this.channel.nack(message, false, true),
                    1000 * 5,
                );
            }
        }
    }
}
