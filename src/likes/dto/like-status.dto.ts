import { LikeStatus } from '../../common/enums';
import { IsEnum } from 'class-validator';

export class LikeStatusDto {
  @IsEnum(LikeStatus)
  readonly likeStatus: LikeStatus;
}
