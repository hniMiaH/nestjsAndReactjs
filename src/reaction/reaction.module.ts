import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from 'src/post/entities/post.entity';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { UserEntity } from 'src/user/entities/user.entity';
import { ReactionEntity } from './entities/reaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ReactionEntity, PostEntity, UserEntity]),
        ConfigModule
    ],
    providers: [ReactionService],
    controllers: [ReactionController],
    exports: [ReactionService],
})
export class ReactionModule { }