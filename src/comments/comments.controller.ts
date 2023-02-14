import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { FullCommentOutputModel } from './dto/comments-output-models.dto';
import {
  getFullCommentOutputModel,
  mapDbCommentToCommentOutputModel,
} from './mappers/comments-mapper';
import { LikesService } from '../likes/likes.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { LikeStatusDto } from '../likes/dto/like-status.dto';
import { User } from '../common/decorators/user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { DeleteCommentGuard } from '../common/guards/delete-comment.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentsService: CommentsService,
    protected likesService: LikesService,
  ) {}

  @Get(':id')
  async findCommentById(
    @Param('id') commentId: string,
  ): Promise<FullCommentOutputModel> {
    const targetComment = await this.commentsService.findCommentById(commentId);
    const commentOutputModel = mapDbCommentToCommentOutputModel(targetComment);
    return getFullCommentOutputModel(commentOutputModel, this.likesService);
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, DeleteCommentGuard)
  async deleteComment(
    @Param('commentId', ParseObjectIdPipe) commentId: string,
  ): Promise<void> {
    return await this.commentsService.deleteComment(commentId);
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, DeleteCommentGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<void> {
    await this.commentsService.updateComment(commentId, updateCommentDto);
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  async updateCommentLikeStatus(
    @Param('commentId', ParseObjectIdPipe) commentId: string,
    @Body() likeStatusDto: LikeStatusDto,
    @User() user: UserDocument,
  ): Promise<void> {
    await this.commentsService.updateCommentLikeStatus(
      user,
      commentId,
      likeStatusDto.likeStatus,
    );
  }
}
