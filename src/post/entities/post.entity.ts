import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class PostEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    title: string;

    @Column()
    description: string;

    @Column()
    thumbnail: string;

    @Column({ type: "int", default: 1 })
    status: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => UserEntity, (user) => user.post)
    user: UserEntity[];

    @ManyToOne(() => UserEntity)
    created_by: UserEntity;
}