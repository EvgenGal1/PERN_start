// ^ настройки подключения к серверу БД (sequelize | db)

import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// загр.перем.окруж.из ф..env
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// проверка наличия перем.окруж.
if (!process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error('DB_USER и DB_NAME не определены');
}

const sequelize = new Sequelize(
  process.env.DB_NAME!, // база данных
  process.env.DB_USER!, // пользователь
  process.env.DB_PSW!, // пароль
  {
    dialect: process.env.DB_USER! as Dialect,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT) || 5432,
    define: {
      underscored: true, // вкл. snake_case вместо camelCase > назв.полей БД
      timestamps: true, // вкл.поля created_at и updated_at
      freezeTableName: true, // откл.авто.добав.множ-го числа
    },
    logging: false, // false - без лог.записей
    timezone: 'Europe/Moscow',
  },
);

// асинхр.проверка подкл.к БД
export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    // console.log('Подключение к БД успешно.');
  } catch (error) {
    console.error('Не удалось подключиться к БД:', error);
    throw new Error(`Ошибка подключения к БД: ${(error as Error).message}`);
  }
};

export default sequelize;
