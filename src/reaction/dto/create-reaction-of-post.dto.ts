import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsUUID } from "class-validator";
import { reactionType } from "src/const";

export class CreateReactionOfPostDto{
    @ApiProperty()
    reactionType: reactionType;
  
    @ApiProperty()
    postId: number;
}