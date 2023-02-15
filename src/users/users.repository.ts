import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from './schemas/user.schema';
import { countSkipValue, getFilterByDbId, setSortValue } from '../common/utils';
import { UsersQueryParamsDto } from './dto/users-query-params.dto';
import { mapDbUserToUserOutputModel } from './mappers/users-mappers';
import { AllUsersOutputModel } from './dto/users-output-models.dto';
import { SortDirection, UserSortByField } from '../common/enums';
import { UpdateOrFilterModel } from '../common/types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) protected UserModel: UserModelType) {}

  async findAllUsers(
    queryParams: UsersQueryParamsDto,
  ): Promise<AllUsersOutputModel> {
    const {
      sortBy = UserSortByField.createdAt,
      sortDirection = SortDirection.desc,
      pageNumber = 1,
      pageSize = 10,
      searchEmailTerm = '',
      searchLoginTerm = '',
    } = queryParams;
    const skip = countSkipValue(pageNumber, pageSize);
    const sortSetting = setSortValue(sortBy, sortDirection);
    const filterItems = [];

    if (searchLoginTerm) {
      filterItems.push({ login: new RegExp(searchLoginTerm, 'i') });
    }
    if (searchEmailTerm) {
      filterItems.push({ email: new RegExp(searchEmailTerm, 'i') });
    }

    const filter = { $or: filterItems };
    const totalCount = await this.UserModel.find(filter).countDocuments();
    const users = await this.UserModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sortSetting);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: Number(pageNumber),
      pageSize: Number(pageSize),
      totalCount,
      items: users.map(mapDbUserToUserOutputModel),
    };
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.UserModel.findById(userId);
  }

  async findUserByFilter(
    userFilter: UpdateOrFilterModel,
  ): Promise<UserDocument | null> {
    const filter = Object.keys(userFilter).map((field) => ({
      [field]: userFilter[field as keyof UserDocument],
    }));

    return this.UserModel.findOne({ $or: filter });
  }

  async saveUser(user: UserDocument): Promise<UserDocument> {
    return user.save();
  }

  async deleteUser(userId: string): Promise<void> {
    const { deletedCount } = await this.UserModel.deleteOne(
      getFilterByDbId(userId),
    );

    if (!deletedCount) throw new NotFoundException();
  }
}
