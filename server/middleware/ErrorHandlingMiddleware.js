// middlware по обраб.ошб.

// от ошб.повтор.объяв.перем в блоке
// export {};

// подкл.обраб.ошиб.
const ApiError = require("../error/ApiError");

// экспорт fn (fn явл.middlware). приним. ошб.,запр.,отв.,след.(передача управ.след.middlware)
module.exports = function (err, req, res, next) {
  console.log("err" + err);

  // е/и ошб.явл.экземплярром из ApiError, возвращ.код, смс из ошб., масс.ошб.
  if (err instanceof ApiError) {
    console.log("????????????????????????? err 1 ", err);
    return (
      res
        .status(err.status)
        // .json({ message: err.message, errors: err.errors });
        .json(err)
    );
  }
  console.log("????????????????????????? err 2 ", err);
  // е/и ошб. НЕ из ApiError, возвращ.настр.код и смс
  return res.status(500).json({ message: `Непредвиденная ошибка! ${err}` });
};
