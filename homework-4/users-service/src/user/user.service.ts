import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserCreateDto } from './dto/user-create.dto';
import { User } from './dto/user.dto';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  get(userId: string): Promise<User> {
    return this.userModel.findById(userId).exec();
  }

  delete(userId: string): Promise<User> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }

  create(user: UserCreateDto): Promise<User> {
    return this.userModel.create(user);
  }

  update(user: User): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(user._id, user, { new: true })
      .exec();
  }
}
