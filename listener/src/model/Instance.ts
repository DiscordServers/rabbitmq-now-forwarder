import {EventEmitter} from 'events';
import {Logger} from 'winston';

import Configuration from '../types/Collection/Configuration';
import DBInstance from '../types/Collection/Instance';
import Metadata, {Instance as InstanceMetadata, Listener as ListenerMetadata} from '../types/Metadata';
import getCollection from '../util/getCollection';
import getConfiguration from '../util/getConfiguration';
import getLogger from '../util/getLogger';
import getMetadata from '../util/getMetadata';
import Listener from './Listener';

export default class Instance extends EventEmitter {
    public get configuration() {
        return this._configuration;
    }

    private readonly logger: Logger;

    private refreshing: boolean = false;
    private queueListeners: Listener[] = [];
    private interval: NodeJS.Timeout;

    public constructor(
        private _configuration: Configuration,
        public readonly metadata: Metadata,
        public readonly instanceMetadata: InstanceMetadata,
    ) {
        super();
        this.logger = getLogger('instance', 'model/Instance.ts', this.instanceMetadata);
        this.logger.info('New Instance');

        this.interval = setInterval(this.refreshMetadata, 60000);
        this.refreshMetadata();

        setInterval(() => this.heartbeat(), 5000);
        this.heartbeat()
    }

    public get id() {
        return this.instanceMetadata.id;
    }

    private async heartbeat() {
        const collection = await getCollection<DBInstance>('instances');
        await collection.updateOne(
            {instanceId: this.id},
            {$set: {configurationId: this.configuration.configurationId, lastHeartbeat: Date.now()}},
            {upsert: true},
        );

        this.logger.debug('Heartbeat for: %s - %j', this.id, {listeners: this.queueListeners.length});
    };

    private refreshMetadata = async () => {
        if (this.refreshing) {
            return;
        }
        this.refreshing = true;
        this.logger.debug('Refreshing metadata');

        this._configuration = await getConfiguration(this.configuration);
        const metadata = await getMetadata(this.configuration);
        const instance = (metadata.instances || []).find((i) => i.id === this.id);

        // If this instance is no longer in the metadata, close it out.
        if (!instance) {
            this.logger.warn('Instance has been removed. Removing all listeners, closing instance.');
            clearInterval(this.interval);
            this.interval = undefined;
            this.queueListeners.forEach((listener) => listener.stop);
            this.emit('closed');

            return;
        }

        const listeners = instance.listeners.filter((x) => x.enabled);

        this.updateGoodListeners(listeners);
        this.removeBadListeners(listeners);

        this.refreshing = false;
    };

    private updateGoodListeners(goodListeners: ListenerMetadata[]): void {
        this.logger.debug('Updating good listeners.');

        goodListeners.forEach((goodListener) => {
            let listener = this.queueListeners.find((x) => x.id === goodListener.id);
            let changed = true;
            if (!listener) {
                listener = new Listener(this, goodListener);
                this.queueListeners.push(listener);
            } else {
                changed = listener.update(goodListener);
            }

            if (changed) {
                this.logger.info('Listener changed. Restarting: ' + listener.id);
                listener.restart();
            }
        })
    }

    private removeBadListeners(goodListeners: ListenerMetadata[]): void {
        this.logger.debug('Removing bad listeners.');

        this.queueListeners.forEach((listener, index) => {
            const isGood = goodListeners.findIndex((goodListener) => goodListener.id === listener.id) >= 0;
            if (!isGood) {
                this.queueListeners.splice(index, 1);
                listener.stop();
                listener = undefined;
            }
        });
    }
}
