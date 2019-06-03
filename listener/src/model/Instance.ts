import {EventEmitter} from 'events';
import Configuration from '../types/Collection/Configuration';
import Metadata, {Instance as InstanceMetadata, Listener as ListenerMetadata} from '../types/Metadata';
import getConfiguration from '../util/getConfiguration';
import getMetadata from '../util/getMetadata';
import heartbeat from '../util/heartbeat';
import Listener from './Listener';

export default class Instance extends EventEmitter {
    public get configuration() {
        return this._configuration;
    }

    private refreshing: boolean = false;
    private queueListeners: Listener[] = [];
    private interval: NodeJS.Timeout;

    public constructor(
        private _configuration: Configuration,
        public readonly metadata: Metadata,
        public readonly instanceMetadata: InstanceMetadata,
    ) {
        super();
        this.interval = setInterval(this.refreshMetadata, 60000);
        this.refreshMetadata();

        setInterval(() => heartbeat(this.configuration, this.instanceMetadata), 5000);
        heartbeat(this.configuration, this.instanceMetadata)
    }

    public get id() {
        return this.instanceMetadata.id;
    }

    private refreshMetadata = async () => {
        if (this.refreshing) {
            return;
        }
        this.refreshing = true;

        this._configuration = await getConfiguration(this.configuration);
        const metadata = await getMetadata(this.configuration);
        const instance = (metadata.instances || []).find((i) => i.id === this.id);

        // If this instance is no longer in the metadata, close it out.
        if (!instance) {
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
                console.log('Listener changed. Restarting: ' + listener.id);
                listener.restart();
            }
        })
    }

    private removeBadListeners(goodListeners: ListenerMetadata[]): void {
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
