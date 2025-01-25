import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
} from 'sequelize';

import { Models } from '../types/models.interfaсe';

class UserRoleModel extends Model<
  InferAttributes<UserRoleModel>,
  InferCreationAttributes<UserRoleModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare roleId: number;
  declare level: number;

  static associate(models: Models) {
    UserRoleModel.belongsTo(models.UserModel, {
      foreignKey: 'userId',
      as: 'user',
    });
    UserRoleModel.belongsTo(models.RoleModel, {
      foreignKey: 'roleId',
      as: 'role',
    });
  }

  static initModel(sequelize: Sequelize) {
    UserRoleModel.init(
      {
        id: { type: DataTypes.INTEGER, allowNull: false },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          // валид.внешн.ключа по существ.roleId
          references: {
            model: 'users',
            key: 'id',
          },
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'roles',
            key: 'id',
          },
        },
        level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          validate: {
            min: 1,
            max: 10,
          },
        },
      },
      {
        sequelize,
        tableName: 'user_roles',
        // запрет дублей связок user+role, ускор.поиск/контроль уник.ind
        indexes: [{ unique: true, fields: ['userId', 'roleId'] }],
        // валид.значения уровня роли перед сохр.
        hooks: {
          beforeSave: (instance: UserRoleModel) => {
            if (instance.level < 1 || instance.level > 10) {
              throw new Error('Уровень должен быть от 1 до 10');
            }
          },
        },
      },
    );
  }
}

export default UserRoleModel;
