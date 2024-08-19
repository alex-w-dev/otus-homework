import { OmitType } from '@nestjs/swagger';
import { User } from './user.dto';

export class UserCreateDto extends OmitType(User, ['_id']) {}
