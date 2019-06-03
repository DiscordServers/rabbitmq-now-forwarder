import {Channel, ConsumeMessage} from 'amqplib';
import Brakes from 'brakes';
import deepEqual from 'deep-equal';
import fetch from 'node-fetch';
import NodeRSA from 'node-rsa';
import ses from 'node-ses';
import Configuration from '../types/Collection/Configuration';
import {Listener as ListenerMetadata} from '../types/Metadata';
import getRabbitChannel from '../util/getRabbitChannel';
import getTeam, {Team} from '../util/getTeam';
import getTeamMembers, {TeamMember} from '../util/getTeamMembers';
import getUser, {User} from '../util/getUser';
import setMetadata from '../util/setMetadata';
import Instance from './Instance';

const client = ses.createClient({key: process.env.SES_ACCESS_KEY, secret: process.env.SES_ACCESS_SECRET});

export default class Listener {
    private started: boolean = false;

    private channel: Channel;

    public constructor(public readonly instance: Instance, private _metadata: ListenerMetadata) {
    }

    public get id(): string {
        return this.metadata.id;
    }

    public get metadata(): ListenerMetadata {
        return this._metadata;
    }

    public get configuration(): Configuration {
        return this.instance.configuration;
    }

    public async start() {
        if (this.started) {
            return;
        }

        this.channel = await getRabbitChannel(this.instance.instanceMetadata);

        const brake = new Brakes(this.processMessage, {
            statInterval:    2500,
            bucketSpan:      1000 * 60 * 30,
            circuitDuration: 1000 * 60 * 5,
            waitThreshold:   10,
            threshold:       0.8,
            timeout:         6000,
        });
        brake.on('circuitOpen', () => {
            console.log('Circuit tripped: ' + this.id);
            this.disableListener().then(brake.destroy.bind(brake));
        });

        await this.channel.consume(this.metadata.queue, (msg) =>
            brake.exec(msg).catch((e) => console.error('Hook Error: ', e.message)),
        );
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
        const changed  = !deepEqual(this.metadata, metadata);
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
            message:     message.content.toString(),
            signature,
            fields:      message.fields,
            properties:  message.properties,
            modifyError: false,
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
            if (this.metadata.retry_on_failure) {
                setTimeout(() => {
                    try {
                        this.channel.nack(message, false, true);
                    } catch (e) {
                        // console.error('Can\'t requeue. Channel closed');
                    }
                }, 1000 * 5);
            }

            throw error;
        }
    };

    private async disableListener(): Promise<void> {
        await this.stop();

        const newMetadata = {...this.instance.metadata};
        const instance    = newMetadata.instances.find((i) => i.id === this.instance.instanceMetadata.id);
        const listener    = instance.listeners.find((l) => l.id === this.id);

        listener.enabled = false;

        await setMetadata(this.configuration, newMetadata);
        this.sendDisabledEmail().catch(() => {
            /* Ignoring errors from this for now, until we are un-sandboxed */
        });
    }

    private async sendDisabledEmail(): Promise<void> {
        if (!this.instance.metadata.preferences.email_notifications) {
            return;
        }

        const users: (User | TeamMember)[] = [];
        let team: Team;
        if (this.configuration.teamId) {
            users.push(...(await getTeamMembers(this.configuration)));
            team = await getTeam(this.configuration);
        } else {
            users.push(await getUser(this.configuration));
        }

        return new Promise((resolve, reject) => {
            const options = {
                to:      users.map((user) => user.email),
                from:    process.env.FROM_EMAIL,
                subject: 'RabbitMQ Forwarder - Listener Disabled',
                message: `We regret to inform you that one of your configured listeners has been disabled.
<br />
<br />
It has been failing at over 20%, so we've shut it off until you re-enable it. 
<br />
<br />
<b>Team Name: </b>${team ? team.name : 'Personal Account'}
<br />
<b>Instance Name: </b>${this.instance.instanceMetadata.name}
<br />     
<b>Listener Information:</b> 
<br />
<code><pre>${JSON.stringify(this.metadata, null, 4)}</pre></code>`,
            };

            client.sendEmail(options, (err) => err ? reject(err) : resolve());
        });
    }
}
