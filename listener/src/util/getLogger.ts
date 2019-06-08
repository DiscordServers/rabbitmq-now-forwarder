import winston, {Logger} from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';
import {JSONObject} from '../types/global';

interface LogObject {
    streamName?: string;
    file?: string;
    message: string;
    level: string;
    ms: string;
}

const formats = [
    winston.format.ms(),
    winston.format.splat(),
];
const logger  = winston.createLogger({
    level:      process.env.LOG_LEVEL || 'debug',
    format:     winston.format.combine(...formats),
    transports: [
        new CloudWatchTransport({
            logGroupName:     'rabbitnowforwarder',
            logStreamName:    (process.env.NODE_ENV || 'production') + '.listener',
            level:            'debug',
            awsRegion:        'us-east-1',
            awsAccessKeyId:   process.env.ACCESS_KEY,
            awsSecretKey:     process.env.ACCESS_SECRET,
            awsOptions:       {
                accessKeyId:     process.env.ACCESS_KEY,
                secretAccessKey: process.env.ACCESS_SECRET,
            },
            jsonMessage: true,
            // @ts-ignore
            retentionInDays:  30,
            errorHandler:     (err) => console.error('Critical Logging Error: ', err),
        }),
    ],
});
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.simple(),
            winston.format.padLevels(),
            winston.format.timestamp(),
            winston.format.colorize(),
            ...formats,
        ),
    }));
}

logger.on('error', (err) => console.error('Critical Logging Error: ', err));

const getLogger = (streamName: string, file: string, meta?: JSONObject): Logger =>
    logger.child({streamName, file, ...meta});

export default getLogger;
