import amqp, { Channel } from 'amqplib';
import { RabbitMQException } from './exceptions/exceptions.utils';

export enum RabbitMQExchangeNames {
  Fanout = 'fanout',
  Direct = 'direct',
  Topic = 'topic',
  Headers = 'headers',
}

export class RabbitMQProducer {
  private channel: Channel;

  constructor() {
    amqp.connect(process.env.RABBITMQ_URI || '').then(async connection => {
      this.channel = await connection.createChannel();
    });
  }

  public async publish(routingKey: string, message: unknown) {
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

    await this.channel.publish(
      process.env.RABBITMQ_EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify({ type: routingKey, message, datetime: Date.now() })),
    );
  }
}

export const producer = new RabbitMQProducer();
