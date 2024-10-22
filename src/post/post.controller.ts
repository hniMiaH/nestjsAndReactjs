import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostService } from './post.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { PageOptionsDto } from 'src/common/dto/pagnition.dto';
import { CreatePost } from './dto/create-new-post.dto';
import { PostEntity } from './entities/post.entity';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helpers/config';
import { fileFilter } from 'uploads/avatar/upload.config';
import { TagUserDto } from './dto/tag-user.dto';
import { request } from 'http';


@ApiBearerAuth()
@ApiTags('post')
@Controller('post')
@UseGuards(AuthGuard) export class PostController {
    constructor(private postService: PostService) { }

    @Get('get-all-post')
    async findAll(
        @Query() params: PageOptionsDto,
    ) {
        return this.postService.getAllPost(params);
    }

    @Get('get-post/:id')
    async findById(
        @Param('id') id: number
    ) {
        return this.postService.getPostById(id);
    }

    @Post('create-post')
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: storageConfig('image'),
        fileFilter: fileFilter,
    }))
    @ApiConsumes('multipart/form-data')
    async createPost(
        @Req() req: Request,
        @Body() createPostDto: CreatePost,
    ): Promise<PostEntity> {
        if (typeof createPostDto.images === 'string') {
            createPostDto.images = [createPostDto.images];
        }
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
    @UseInterceptors(FilesInterceptor('images', 10, {
        storage: storageConfig('image'),
        fileFilter: fileFilter,
    }))
    @ApiConsumes('multipart/form-data')
    async uploadPost(
        @Param('id') postId: number,
        @Body() body: CreatePost,
        @Req() req: Request,
    ) {
        if (typeof body.images === 'string') {
            body.images = [body.images];
        }
        return this.postService.updatePost(postId, {
            ...body,
        }, req);
    }

    @Delete('delete-post/:id')
    async removePost(@Param('id') id: number, @Req() request: Request): Promise<void> {
        return this.postService.deletePost(id, request);
    }

    @Get('search')
    async searchPostsAndUsers(
        @Query('searchTerm') searchTerm: string,
        @Query() pageOptionsDto: PageOptionsDto
    ): Promise<any> {
        if (!searchTerm) {
            throw new HttpException('Search term is required', HttpStatus.BAD_REQUEST);
        }

        return await this.postService.searchPostsAndUsers(searchTerm, pageOptionsDto);
    }
}
