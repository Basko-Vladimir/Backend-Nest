import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { blogsConstants, MIN_STRINGS_LENGTH } from '../../common/constants';
import {
  generateLengthErrorMessage,
  generateRegExpError,
} from '../../common/error-messages';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../api/dto/create-blog.dto';
import { UpdateBlogDto } from '../api/dto/update-blog.dto';
import { UserDocument } from '../../users/schemas/user.schema';
import { BlogOwnerInfo, BlogOwnerInfoSchema } from './blog-owner-info.schema';

const {
  MAX_NAME_LENGTH,
  MAX_WEBSITE_URL_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  WEBSITE_URL_REG_EXP,
} = blogsConstants;

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [
      MIN_STRINGS_LENGTH,
      generateLengthErrorMessage('name', MIN_STRINGS_LENGTH, 'min'),
    ],
    maxlength: [
      MAX_NAME_LENGTH,
      generateLengthErrorMessage('name', MAX_NAME_LENGTH, 'max'),
    ],
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    maxlength: [
      MAX_WEBSITE_URL_LENGTH,
      generateLengthErrorMessage('websiteUrl', MAX_WEBSITE_URL_LENGTH, 'max'),
    ],
    validate: [
      WEBSITE_URL_REG_EXP,
      generateRegExpError('websiteUrl', WEBSITE_URL_REG_EXP),
    ],
  })
  websiteUrl: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: [
      MIN_STRINGS_LENGTH,
      generateLengthErrorMessage('description', MIN_STRINGS_LENGTH, 'min'),
    ],
    maxlength: [
      MAX_DESCRIPTION_LENGTH,
      generateLengthErrorMessage('description', MAX_DESCRIPTION_LENGTH, 'max'),
    ],
  })
  description: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  isMembership: boolean;

  @Prop({
    type: BlogOwnerInfoSchema,
  })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  updateBlog(
    updatingData: UpdateBlogDto,
    currentBlog: BlogDocument,
  ): BlogDocument {
    const { name, websiteUrl, description } = updatingData;

    currentBlog.name = name;
    currentBlog.websiteUrl = websiteUrl;
    currentBlog.description = description;

    return currentBlog;
  }

  bindBlogWithUser(blog: BlogDocument, user: UserDocument): BlogDocument {
    blog.blogOwnerInfo = {
      ownerId: String(user._id),
      ownerLogin: user.login,
    };

    return blog;
  }

  static createBlogEntity(
    blogData: CreateBlogDto,
    user: UserDocument,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel({
      ...blogData,
      blogOwnerInfo: {
        ownerId: user._id,
        ownerLogin: user.login,
      },
    });
  }
}

export type BlogDocument = HydratedDocument<Blog>;

export interface IBlogsStaticMethods {
  createBlogEntity(
    blogData: CreateBlogDto,
    user: UserDocument,
    BlogModel: BlogModelType,
  ): BlogDocument;
}

export type BlogModelType = Model<Blog> & IBlogsStaticMethods;

export const blogSchema = SchemaFactory.createForClass(Blog);

blogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
  bindBlogWithUser: Blog.prototype.bindBlogWithUser,
};
blogSchema.static('createBlogEntity', Blog.createBlogEntity);
