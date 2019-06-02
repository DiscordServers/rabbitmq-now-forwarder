import {EventEmitter} from 'events';
import Configuration from '../types/Collection/Configuration';
import {Instance as InstanceMetadata, Listener as ListenerMetadata} from '../types/Metadata';
import getMetadata from '../util/getMetadata';
import heartbeat from '../util/heartbeat';
import Listener from './Listener';

export default class Instance extends EventEmitter {
    private refreshing: boolean = false;
    private queueListeners: Listener[] = [];
    private interval: NodeJS.Timeout;

    public constructor(
        public readonly configuration: Configuration,
        public readonly metadata: InstanceMetadata,
    ) {
        super();
        this.interval = setInterval(this.refreshMetadata, 5000);
        this.refreshMetadata();
    }

    private refreshMetadata = async () => {
        if (this.refreshing) {
            return;
        }
        this.refreshing = true;

        await heartbeat(this.configuration, this.metadata);

        const metadata = await getMetadata(this.configuration);
        const instance = metadata.instances.find((i) => i.id === this.metadata.id);

        // If this instance is no longer in the metadata, close it out.
        if (!instance) {
            clearInterval(this.interval);
            this.interval = undefined;
            this.queueListeners.forEach((listener) => listener.stop);
            this.emit('closed');

            return;
        }

        this.updateGoodListeners(instance.listeners);
        this.removeBadListeners(instance.listeners);

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