const Router = require("express");
const router = new Router();
const authControllers = require("../controllers/auth.controllers");
// подкл. валидацию
const { check } = require("express-validator");
// const exprsValid = require("../middleware/exprsValid");
// подкл.декодер.токен,проверка валидности
const authMiddleware = require("../middleware/authMiddleware");

// ^ ++++ UlbiTV.PERNstore
// опред.марщрутов|мтд. для отраб. Ригистр.,Авториз.,проверка на Авториз. по jwt токену(2ой парам.)
// РЕГИСТРАЦИЯ
router.post(
  "/registration",
  // exprsValid
  [
    // валидация. normalize не пропускает RU email е/и записаны в ВерБлюд стиле.
    check("email", "Некорректый email").isEmail().normalizeEmail(),
    check("password")
      .not()
      .isIn([
        "123qwe",
        "123qwerty",
        "qwe123",
        "qwerty123",
        "123456",
        "password123",
        "god123",
      ])
      .withMessage("Не используйте обычные значения в качестве пароля")
      .isLength({ min: 6 })
      .withMessage("Минимальная длина пароля 6 символов")
      .isLength({ max: 20 })
      .withMessage("Максимальная длина пароля 6 символов")
      .matches(/\d/)
      .withMessage("Пароль должен содержать число"),
  ],
  authControllers.registration
);

// АВТОРИЗАЦИЯ
router.post(
  "/login",
  // exprsValid
  [check("email", "Некорректый email").isEmail().normalizeEmail()],
  authControllers.login
);

// ПРОВЕРКА | auth
router.get("/", authMiddleware, authControllers.check);

module.exports = router;
