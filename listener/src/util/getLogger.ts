import winston, {Logger} from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const getLogger = (streamName: string, file: string, meta?: { [key: string]: any }): Logger => {
    const logStreamName = (process.env.NODE_ENV || 'production') + '.' + streamName;

    const transport  = new CloudWatchTransport({
        logGroupName:     'rabbitnowforwarder',
        logStreamName,
        level:            'debug',
        awsRegion:        'us-east-1',
        awsAccessKeyId:   process.env.ACCESS_KEY,
        awsSecretKey:     process.env.ACCESS_SECRET,
        awsOptions:       {
            accessKeyId:     process.env.ACCESS_KEY,
            secretAccessKey: process.env.ACCESS_SECRET,
        },
        messageFormatter: (logObject => {
            return `[${logObject.level}][${file}]: ${logObject.msg}\n${JSON.stringify(logObject.meta, null, 4)}`;
        }),
        // @ts-ignore
        retentionInDays:  30,
        errorHandler:     (err) => console.error('Critical Logging Error: ', err),
    });
    const transports = [transport];
    const formats    = [
        winston.format.padLevels(),
        winston.format.simple(),
        winston.format.ms(),
        winston.format.splat(),
    ];
    if (process.env.NODE_ENV === 'development') {
        transports.push(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                ...formats,
            ),
        }));
    }
    const logger = winston.createLogger({
        level:       process.env.LOG_LEVEL || 'debug',
        transports,
        defaultMeta: meta,
        format:      winston.format.combine(...formats),
    });
    logger.on('error', (err) => console.error('Critical Logging Error: ', err));

    return logger;
};

export default getLogger;
