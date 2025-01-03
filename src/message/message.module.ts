import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageEntity } from './entities/message.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { MessageGateway } from './message.gateway';
import { UserConnectionService } from 'src/shared/user-connection.service';

@Module({
    imports: [TypeOrmModule.forFeature([MessageEntity, UserEntity])],
    controllers: [MessageController],
    providers: [MessageService, MessageGateway, UserConnectionService],
})
export class MessageModule { }
