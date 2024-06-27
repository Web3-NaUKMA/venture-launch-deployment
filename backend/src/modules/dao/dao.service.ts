import { producer } from '../../utils/rabbitmq.utils';

export class DAOService {
  async findOne() {
    producer.publish('ImportantNotification', 'Aboba');
  }
}

export default new DAOService();
