import * as amqplib from 'amqplib';
import {Instance} from '../types/Metadata';

const getRabbitChannel = async (instance: Instance) => {
    try {
        const connection = await amqplib.connect({
            hostname: instance.connection.host,
            port: parseInt(instance.connection.port, 10),
            vhost: instance.connection.vhost,
            username: instance.connection.username,
            password: instance.connection.password,
        } as amqplib.Options.Connect);
        console.log('Connected to rabbitmq instance: ' + instance.id);

        return connection.createChannel();
    } catch (e) {
        console.error(e);

        throw e;
    }
};

export default getRabbitChannel;
