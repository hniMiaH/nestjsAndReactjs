import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { PageDto, PageMetaDto, PageOptionsDto } from 'src/common/dto/pagnition.dto';
import * as moment from 'moment';
import { reactionType } from 'src/const';
import { CommentEntity } from 'src/comment/entities/comment.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(NotificationEntity)
        private notificationRepository: Repository<NotificationEntity>,
        @InjectRepository(CommentEntity)
        private commentRepository: Repository<CommentEntity>,
    ) { }

    async getUserNotifications(userId: string, params: PageOptionsDto): Promise<any> {
        const notifQueryBuilder = await this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoinAndSelect('notification.receiver', 'receiver')
            .leftJoinAndSelect('notification.sender', 'sender')
            .where(' notification.receiverId = :userId', { userId })
            .orderBy('notification.createdAt', 'DESC')
            .skip(params.skip)
            .take(params.pageSize);

        const [notif, totalNotifCount] = await notifQueryBuilder.getManyAndCount();

        const transformedNotif = await Promise.all(
            notif.map((noti) => this.transformEntity(noti)),
        );
        return new PageDto(
            transformedNotif,
            new PageMetaDto({ itemCount: totalNotifCount, pageOptionsDto: params }),
        );
    }
    async transformEntity(entity: NotificationEntity): Promise<any> {
        const notification = await this.notificationRepository.findOne({ where: { id: entity.id }, relations: ['comment', 'comment.parent'] });
        const createdAgo = moment(entity.createdAt).add(7, 'hours');
        const now = moment();

        const diffMinutes = now.diff(createdAgo, 'minutes');
        const diffHours = now.diff(createdAgo, 'hours');
        const diffDays = now.diff(createdAgo, 'days');
        const diffMonths = now.diff(createdAgo, 'months');

        let createdAgoText: string;

        if (diffMinutes === 0) {
            createdAgoText = "Just now";
        } else if (diffMinutes < 60) {
            createdAgoText = `${diffMinutes}m`;
        } else if (diffHours < 24) {
            createdAgoText = `${diffHours}h`;
        } else if (diffMonths < 1) {
            createdAgoText = `${diffDays}d`;
        } else {
            createdAgoText = createdAgo.format('MMM D');
        }

        const createdAtFormatted = moment(entity.createdAt)
            .add(7, 'hours')
            .format('HH:mm DD-MM-YYYY');

        const updatedFormatted = moment(entity.createdAt)
            .add(7, 'hours')
            .format('HH:mm DD-MM-YYYY');

        let parentComment = null
        if (notification.comment) {
            if (notification.comment?.parent?.id) {
                parentComment = await this.commentRepository.findOne({
                    where: { id: notification.comment.parent.id },
                    relations: ["created_by", "post"]
                }
                )
            };
        }
        return {
            id: entity.id,
            type: notification.type,
            content: entity.content,
            comment: notification.comment ? notification.comment.id : undefined,
            comment_content: notification.comment ? notification.comment.content : undefined,
            parent: parentComment
                ? {
                    id: parentComment.id,
                    content: parentComment.content,
                    postId: parentComment.post.id,
                    created_by: {
                        id: parentComment.created_by.id,
                        username: parentComment.created_by.username,
                        fullName: `${parentComment.created_by.firstName} ${parentComment.created_by.lastName}`,
                        avatar: parentComment.created_by.avatar,
                    },
                }
                : undefined,

            post: notification.post ? notification.post.id : undefined,
            reaction_type: notification.reactionType ? notification.reactionType : undefined,
            created_ago: createdAgoText,
            created_at: createdAtFormatted,
            updated_at: updatedFormatted,
            receiver: {
                id: entity.receiver.id,
                username: entity.receiver.username,
                fullName: `${entity.receiver.firstName} ${entity.receiver.lastName}`,
                avatar: entity.receiver.avatar
            },
            sender: entity.sender ? {
                id: entity.sender.id,
                username: entity.sender.username,
                fullName: `${entity.sender.firstName} ${entity.sender.lastName}`,
                avatar: entity.sender.avatar
            } : null
        };
    }
}