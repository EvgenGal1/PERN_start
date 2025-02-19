import { check } from 'express-validator';
import { NextFunction } from 'express';

export default function (req, res, next) {
  try {
    // масс. middleware для валидации. `Проверка`(чего,ошб.).валидатор(на email) | ~кастом - проверка(чего).условие.смс ошб.
    // ^ парам.: str.конкатенация пути с /api/auth, масс.валид., fn логики(асинхр,Запрос,Ответ)
    // ! врем.откл. в Postman приходят ошб. на пароль когда его даже нет в ~модели запроса
    [
      check('email', 'Некорректый email').isEmail(),
      // ^ парам.: str.конкатенация пути с /api/auth, масс.валид., fn логики(асинхр,Запрос,Ответ)
      // ! врем.откл. в Postman приходят ошб. на пароль когда его даже нет в ~модели запроса
      check('password')
        // .not()
        .isIn([
          '123',
          '12345',
          'password123',
          'god123',
          'qwerty123',
          '123qwerty',
        ])
        .withMessage('Не используйте обычные значения в качестве пароля')
        .isLength({ min: 6 })
        .withMessage('Минимальная длина пароля 6 символов')
        .matches(/\d/)
        .withMessage('Пароль должен содержать число'),
    ],
      next();
  } catch (error) {}
}
