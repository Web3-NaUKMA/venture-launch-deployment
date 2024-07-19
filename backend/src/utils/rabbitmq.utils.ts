import amqp, { Channel } from 'amqplib';
import { RabbitMQException } from './exceptions/exceptions.utils';

export enum RabbitMQExchangeNames {
  Fanout = 'fanout',
  Direct = 'direct',
  Topic = 'topic',
  Headers = 'headers',
}

export class RabbitMQ {
  private requestChannel: Channel;
  private responseChannel: Channel;

  constructor() {
    if (!process.env.RABBITMQ_URI) {
      throw new RabbitMQException('Cannot connect to the RabbitMQ due to invalid RabbitMQ url');
    }

    amqp.connect(process.env.RABBITMQ_URI).then(async connection => {
      this.requestChannel = await connection.createChannel();
    });

    amqp.connect(process.env.RABBITMQ_URI).then(async connection => {
      this.responseChannel = await connection.createChannel();
    });
  }

  public async publish(routingKey: string, message: unknown, commandType: string) {
    if (!this.requestChannel) {
      throw new RabbitMQException('Cannot publish the message due to the channel is not connected');
    }

    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot publish the message due to the exchange name was not provided',
      );
    }

    await this.requestChannel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );

    await this.requestChannel.assertQueue('request_exchange', { durable: true });
    await this.requestChannel.bindQueue('request_exchange', 'request_exchange', 'request_exchange');

    await this.requestChannel.publish(
      process.env.RABBITMQ_EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true, headers: { command: commandType } },
    );
  }

  public async receive(
    queueName: string,
    bindingKey: string,
    callback?: (message: any, error?: any) => any,
  ) {
    if (!this.responseChannel) {
      throw new RabbitMQException('Cannot receive the message due to the channel is not connected');
    }

    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot receive the message due to the exchange name was not provided',
      );
    }

    await this.responseChannel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );

    const queue = await this.responseChannel.assertQueue(queueName, { durable: true });

    await this.responseChannel.bindQueue(
      queue.queue,
      process.env.RABBITMQ_EXCHANGE_NAME,
      bindingKey,
    );

    this.responseChannel.consume(queue.queue, message => {
      if (message) {
        const data = JSON.parse(message.content.toString());
        this.responseChannel.ack(message);
        callback?.(data);
      } else {
        callback?.(null, 'The message is empty');
      }
    });
  }
}

export const rabbitMQ = new RabbitMQ();
