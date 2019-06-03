import amqplib, {Connection} from 'amqplib';
import {Instance} from '../types/Metadata';

const connections: { [key: string]: Connection } = {};

const getRabbitConnection = async (instance: Instance): Promise<Connection> => {
    if (!connections[instance.id]) {
        connections[instance.id] = await amqplib.connect({
            hostname: instance.connection.host.trim(),
            port:     parseInt(instance.connection.port.trim(), 10),
            vhost:    instance.connection.vhost.trim(),
            username: instance.connection.username.trim(),
            password: instance.connection.password.trim(),
        } as amqplib.Options.Connect);
    }

    return connections[instance.id];
};

const getRabbitChannel = async (instance: Instance) => {
    try {
        const connection = await getRabbitConnection(instance);
        console.log('Connected to rabbitmq instance: ' + instance.id);

        return connection.createChannel();
    } catch (e) {
        console.error(e);

        throw e;
    }
};

export default getRabbitChannel;
