import amqp, { Channel } from 'amqplib';
import { DatabaseException, RabbitMQException } from './exceptions/exceptions.utils';
import { COMMAND_TYPE } from './command_type.enum';
import AppDataSource from '../typeorm/index.typeorm';
import { DaoEntity } from '../typeorm/entities/dao.entity';

import * as dotenv from 'dotenv';
import { User } from '../../../frontend/src/types/user.types';
import { ProjectLaunchEntity } from '../typeorm/entities/project-launch.entity';
import { programId } from '../../../frontend/src/utils/venture-launch.utils';
import { UserEntity } from '../typeorm/entities/user.entity';
export enum RabbitMQExchangeNames {
  Fanout = 'fanout',
  Direct = 'direct',
  Topic = 'topic',
  Headers = 'headers',
}

dotenv.config();

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

    this.channel.consume(queue.queue, async message => {
      if (message) {
        const data = JSON.parse(message.content.toString());
        this.channel.ack(message);

        try{
        switch (data.command_type) {
          case COMMAND_TYPE.CREATE_DAO : {
            console.log(data.command_type);

            const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
              where: {
                projectLaunch: {id: data.project_id}
              }
            });

            console.log(dao.multisigPda);

            await AppDataSource.getRepository(DaoEntity).update(
              { projectLaunch: { id: data.project_id } },
              {
                multisigPda: data.multisig_pda,
                vaultPda: data.vault_pda,
                threshold: data.threshold
              }
            );
            break;
          }
          case COMMAND_TYPE.ADD_MEMBER : {
            console.log(data.command_type);

            const dao = await AppDataSource.getRepository(DaoEntity).findOneOrFail({
              where: {projectLaunch: { id: data.project_id }}
            });

            const new_member =  await AppDataSource.getRepository(UserEntity).findOneOrFail({
              where: {walletId: data.member}
            });

            const members = dao.members.push(new_member);

            // await AppDataSource.getRepository(DaoEntity).update(
            //   { projectLaunch: { id: data.project_id } },
            //   {
            //     members: members
            //   }
            // );

            break;
          }
          case COMMAND_TYPE.REMOVE_MEMBER : {
            console.log(data.command_type);

            break;
          }
          case COMMAND_TYPE.CHANGE_THRESHOLD : {
            console.log(data.command_type);

            await AppDataSource.getRepository(DaoEntity).update(
              { projectLaunch: { id: data.project_id } },
              {
                threshold: data.threshold
              }
            );

            break;
          }
          case COMMAND_TYPE.VOTE : {
            console.log(data.command_type);

            break;
          }
          case COMMAND_TYPE.PROPOSAL_EXECUTE : {
            console.log(data.command_type);

            break;
          }
          case COMMAND_TYPE.WITHDRAW : {
            console.log(data.command_type);

            break;
          }
          case COMMAND_TYPE.WITHDRAW_EXECUTE : {
            console.log(data.command_type);

            break;
          }
          default : {
            console.log("incorrect command type");

            break;
          }
        }
      } catch (error: any) {
        throw new DatabaseException('Internal server error', error);
      }
        callback?.(data);
      } else {
        callback?.(null, 'The message is empty');
      }
    });
  }
}

export const rabbitMQ = new RabbitMQ();
