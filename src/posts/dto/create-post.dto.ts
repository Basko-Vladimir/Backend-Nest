import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { MIN_STRINGS_LENGTH, postsConstants } from '../../common/constants';
import { IsNotEmptyContent } from '../../common/validators/is-not-empty-content.validator';
import { IsExistEntity } from '../../common/validators/is-exist-entity.validator';

const { MAX_TITLE_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH, MAX_CONTENT_LENGTH } =
  postsConstants;

export class CreatePostDto {
  @IsString()
  @IsNotEmptyContent()
  @Length(MIN_STRINGS_LENGTH, MAX_TITLE_LENGTH)
  readonly title: string;

  @IsString()
  @IsNotEmptyContent()
  @Length(MIN_STRINGS_LENGTH, MAX_SHORT_DESCRIPTION_LENGTH)
  shortDescription: string;

  @IsString()
  @IsNotEmptyContent()
  @Length(MIN_STRINGS_LENGTH, MAX_CONTENT_LENGTH)
  content: string;

  @IsNotEmpty()
  @IsNotEmptyContent()
  @IsMongoId()
  @IsExistEntity()
  blogId: string;
}
