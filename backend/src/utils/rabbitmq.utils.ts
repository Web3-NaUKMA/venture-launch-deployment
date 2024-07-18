import amqp, { Channel } from 'amqplib';
import { RabbitMQException } from './exceptions/exceptions.utils';

export enum RabbitMQExchangeNames {
  Fanout = 'fanout',
  Direct = 'direct',
  Topic = 'topic',
  Headers = 'headers',
}

export class RabbitMQ {
  private channel: Channel;

  constructor() {
    if (!process.env.RABBITMQ_URI) {
      throw new RabbitMQException('Cannot connect to the RabbitMQ due to invalid RabbitMQ url');
    }

    amqp.connect(process.env.RABBITMQ_URI).then(async connection => {
      this.channel = await connection.createChannel();
    });
  }

  public async publish(routingKey: string, message: unknown, commandType: string) {
    if (!this.channel) {
      throw new RabbitMQException('Cannot publish the message due to the channel is not connected');
    }

    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot publish the message due to the exchange name was not provided',
      );
    }

    await this.channel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );

    await this.channel.assertQueue('request_exchange');

    await this.channel.bindQueue('request_exchange', 'request_exchange', 'request_exchange');
    await this.channel.publish(
      process.env.RABBITMQ_EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true, headers: { command: commandType } },
    );
  }

  public async receive(
    queueName: string,
    bindingKey: string,
    callback?: (message: unknown, error?: any) => any,
  ) {
    if (!this.channel) {
      throw new RabbitMQException('Cannot receive the message due to the channel is not connected');
    }

    if (!process.env.RABBITMQ_EXCHANGE_NAME) {
      throw new RabbitMQException(
        'Cannot receive the message due to the exchange name was not provided',
      );
    }

    await this.channel.assertExchange(
      process.env.RABBITMQ_EXCHANGE_NAME,
      RabbitMQExchangeNames.Direct,
    );

    const queue = await this.channel.assertQueue(queueName);

    await this.channel.bindQueue(queue.queue, process.env.RABBITMQ_EXCHANGE_NAME, bindingKey);

    this.channel.consume(queue.queue, message => {
      if (message) {
        const data = JSON.parse(message.content.toString());
        this.channel.ack(message);
        callback?.(data);
      } else {
        callback?.(null, 'The message is empty');
      }
    });
  }
}

export const rabbitMQ = new RabbitMQ();
