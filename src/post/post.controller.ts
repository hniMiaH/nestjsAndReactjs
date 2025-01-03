import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PageOptionsDto } from 'src/common/dto/pagnition.dto';
import { CreatePost } from './dto/create-new-post.dto';
import { PostEntity } from './entities/post.entity';
import { TagUserDto } from './dto/tag-user.dto';


@ApiBearerAuth()
@ApiTags('post')
@Controller('post')
@UseGuards(AuthGuard) export class PostController {
    constructor(private postService: PostService) { }

    @Get('get-all-post')
    @ApiQuery({ name: 'postId', required: false, type: Number })
    @ApiQuery({ name: 'userid', required: false, type: String })

    async findAll(
        @Query() params: PageOptionsDto,
        @Req() req: Request,
        @Query('postId') postId?: number,
        @Query('userid') userid?: string

    ) {
        return this.postService.getAllPost(params, req, postId, userid);
    }

    @Get('get-post/:id')
    async findById(
        @Param('id') id: number,
        @Req() req: Request
    ) {
        return this.postService.getPostById(id, req);
    }

    @Post('create-post')
    async createPost(
        @Req() req: Request,
        @Body() createPostDto: CreatePost,
    ): Promise<PostEntity> {
        return this.postService.createPost({
            ...createPostDto,
        }, req);
    }

    @Post('tag-user/:postId')
    async tagUsers(
        @Body() tagUserDto: TagUserDto,
        @Req() request: Request
    ) {
        return this.postService.tagUser({ postId: tagUserDto.postId, userIds: tagUserDto.userIds }, request);
    }

    @Delete('untag-user')
    async untagUser(
        @Body() tagUserDto: TagUserDto,
        @Req() req: Request,
    ): Promise<any> {
        return await this.postService.unTagUser(tagUserDto, req);
    }

    @Post('update-post/:id')
    async uploadPost(
        @Param('id') postId: number,
        @Body() body: CreatePost,
        @Req() req: Request,
    ) {
        return this.postService.updatePost(postId, {
            ...body,
        }, req);
    }

    @Delete('delete-post/:id')
    async removePost(@Param('id') id: number, @Req() request: Request): Promise<void> {
        return this.postService.deletePost(id, request);
    }
    @ApiQuery({ name: 'searchTerm', required: false })
    @Get('search')
    async searchPostsAndUsers(
        @Query() pageOptionsDto: PageOptionsDto,
        @Req() req: Request,
        @Query('searchTerm') searchTerm?: string,

    ): Promise<any> {
        return await this.postService.searchPostsAndUsers(searchTerm, pageOptionsDto, req);
    }
}
