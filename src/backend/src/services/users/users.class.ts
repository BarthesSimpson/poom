import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

export default class Users extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }
};
