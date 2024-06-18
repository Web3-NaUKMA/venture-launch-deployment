import { EntityNotFoundError, FindManyOptions, FindOneOptions } from 'typeorm';
import { ChatUserDto, CreateChatDto, UpdateChatDto } from '../../DTO/chat.dto';
import { ChatEntity } from '../../typeorm/entities/chat.entity';
import { DatabaseException, NotFoundException } from '../../utils/exceptions/exceptions.utils';
import AppDataSource from '../../typeorm/index.typeorm';
import _ from 'lodash';
import { UserEntity } from '../../typeorm/entities/user.entity';
import { UserToChatEntity } from '../../typeorm/entities/user-to-chat.entity';

export class ChatService {
  async findMany(options?: FindManyOptions<ChatEntity>): Promise<ChatEntity[]> {
    try {
      return await AppDataSource.getRepository(ChatEntity).find(
        _.merge(options, {
          relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        }),
      );
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async findOne(options?: FindOneOptions<ChatEntity>): Promise<ChatEntity> {
    try {
      return await AppDataSource.getRepository(ChatEntity).findOneOrFail(
        _.merge(options, {
          relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        }),
      );
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('The chat with provided params does not exist');
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async create(data: CreateChatDto) {
    try {
      const chat = await AppDataSource.getRepository(ChatEntity).save(data);

      if (data.usersToAdd) {
        await this.addUsersToChat(chat.id, data.usersToAdd);
      }

      return await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        where: { id: chat.id },
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
      });
    } catch (error: any) {
      throw new DatabaseException('Internal server error', error);
    }
  }

  async update(id: string, data: UpdateChatDto): Promise<ChatEntity> {
    try {
      const { usersToAdd, usersToUpdate, usersToRemove, ...rest } = data;
      rest.isGroup = Boolean(rest.isGroup);

      await AppDataSource.getRepository(ChatEntity).update(
        { id },
        { updatedAt: new Date(), ...rest },
      );

      if (usersToAdd) {
        await this.addUsersToChat(id, usersToAdd);
      }

      if (usersToUpdate) {
        await this.updateUsersInChat(id, usersToUpdate);
      }

      if (usersToRemove) {
        await this.removeUsersFromChat(id, usersToRemove);
      }

      return await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot update the chat. The chat with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  async remove(id: string): Promise<ChatEntity> {
    try {
      const chat = await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        where: { id },
      });

      await AppDataSource.getRepository(ChatEntity).remove(structuredClone(chat));

      return chat;
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove the chat. The chat with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async addUsersToChat(id: string, users: ChatUserDto[]): Promise<ChatEntity> {
    try {
      await AppDataSource.getRepository(ChatEntity).findOneOrFail({ where: { id } });
      const existingUsers = (
        (
          await Promise.allSettled(
            users.map(user =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: user.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => users.find(user => user.id === result.value.id)!);

      await AppDataSource.getRepository(UserToChatEntity).save(
        existingUsers.map(user => ({
          userId: user.id,
          chatId: id,
          user: { id: user.id },
          chat: { id },
        })),
      );

      return await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot add users to the chat. The chat or some of the users with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async updateUsersInChat(id: string, users: ChatUserDto[]): Promise<ChatEntity> {
    try {
      await AppDataSource.getRepository(ChatEntity).findOneOrFail({ where: { id } });
      const existingUsers = (
        (
          await Promise.allSettled(
            users.map(user =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: user.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => users.find(user => user.id === result.value.id)!);

      await Promise.allSettled(
        existingUsers.map((user: any) => {
          delete user.id;
          return AppDataSource.getRepository(UserToChatEntity).update(
            { userId: user.id, chatId: id },
            user,
          );
        }),
      );

      return await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot add users to the chat. The chat or some of the users with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }

  private async removeUsersFromChat(id: string, users: ChatUserDto[]): Promise<ChatEntity> {
    try {
      await AppDataSource.getRepository(ChatEntity).findOneOrFail({ where: { id } });
      const existingUsers = (
        (
          await Promise.allSettled(
            users.map(user =>
              AppDataSource.getRepository(UserEntity).findOneOrFail({ where: { id: user.id } }),
            ),
          )
        ).filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<UserEntity>[]
      ).map(result => users.find(user => user.id === result.value.id)!);

      await Promise.all(
        existingUsers.map(user =>
          AppDataSource.getRepository(UserToChatEntity).delete({
            userId: user.id,
            chatId: id,
          }),
        ),
      );

      return await AppDataSource.getRepository(ChatEntity).findOneOrFail({
        relations: { usersToChat: { user: true }, messages: { author: true, replyTo: true } },
        where: { id },
      });
    } catch (error: any) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          'Cannot remove users from the chat. The chat with provided id does not exist',
        );
      }

      throw new DatabaseException('Internal server error', error);
    }
  }
}

export default new ChatService();
