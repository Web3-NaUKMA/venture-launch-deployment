import { rabbitMQ } from '../../utils/rabbitmq.utils';

export class DAOService {
  async findOne() {
    rabbitMQ.publish('ImportantNotification', 'Aboba');
    rabbitMQ.receive(
      'NotificationQueue',
      'ImportantNotification',
      (message: unknown, error: any) => {
        console.log(message);
        console.log(error);
      },
    );
  }
}

export default new DAOService();
