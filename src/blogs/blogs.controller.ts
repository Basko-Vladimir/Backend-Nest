import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsQueryParamsDto } from './dto/blogs-query-params.dto';
import {
  AllBlogsOutputModel,
  BlogAllFullPostsOutputModel,
  IBlogOutputModel,
} from './dto/blogs-output-models.dto';
import { mapDbBlogToBlogOutputModel } from './mappers/blogs-mappers';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePostDto } from '../posts/dto/create-post.dto';
import { IFullPostOutputModel } from '../posts/dto/posts-output-models.dto';
import { PostsService } from '../posts/posts.service';
import {
  getFullPostOutputModel,
  mapDbPostToPostOutputModel,
} from '../posts/mappers/posts-mapper';
import { LikesService } from '../likes/likes.service';
import { PostsQueryParamsDto } from '../posts/dto/posts-query-params.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected likesService: LikesService,
  ) {}

  @Get()
  async findAllBlogs(
    @Query() query: BlogsQueryParamsDto,
  ): Promise<AllBlogsOutputModel> {
    return this.blogsService.findAllBlogs(query);
  }

  @Get(':id')
  async findBlogById(
    @Param('id', ParseObjectIdPipe) blogId: string,
  ): Promise<IBlogOutputModel> {
    const targetBlog = await this.blogsService.findBlogById(blogId);
    return mapDbBlogToBlogOutputModel(targetBlog);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createBlog(
    @Body() creatingData: CreateBlogDto,
  ): Promise<IBlogOutputModel> {
    const createdBlog = await this.blogsService.createBlog(creatingData);

    return mapDbBlogToBlogOutputModel(createdBlog);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async deleteBlog(
    @Param('id', ParseObjectIdPipe) blogId: string,
  ): Promise<void> {
    return this.blogsService.deleteBlog(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async updateBlog(
    @Param('id', ParseObjectIdPipe) blogId: string,
    @Body() updatingData: UpdateBlogDto,
  ): Promise<void> {
    return this.blogsService.updateBlog(blogId, updatingData);
  }

  @Get(':id/posts')
  async findAllPostsByBlogId(
    @Query() queryParams: PostsQueryParamsDto,
    @Param('id', ParseObjectIdPipe) blogId: string,
  ): Promise<BlogAllFullPostsOutputModel> {
    const targetBlog = await this.findBlogById(blogId);

    if (!targetBlog) throw new NotFoundException();

    const postsOutputModel = await this.postsService.findPosts(
      queryParams,
      blogId,
    );
    const posts = postsOutputModel.items;
    const fullPosts = [];

    for (let i = 0; i < posts.length; i++) {
      fullPosts.push(await getFullPostOutputModel(posts[i], this.likesService));
    }

    return {
      ...postsOutputModel,
      items: fullPosts,
    };
  }

  @Post(':id/posts')
  @UseGuards(AuthGuard)
  async createPostForBlog(
    @Param('id', ParseObjectIdPipe) blogId: string,
    @Body() creatingData: Omit<CreatePostDto, 'blogId'>,
  ): Promise<IFullPostOutputModel> {
    const createdPost = await this.postsService.createPost({
      ...creatingData,
      blogId,
    });
    const postOutputModel = mapDbPostToPostOutputModel(createdPost);
    return await getFullPostOutputModel(postOutputModel, this.likesService);
  }
}
