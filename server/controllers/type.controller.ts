// от ошб.повтор.объяв.перем в блоке
export {};

const ApiError = require("../error/ApiError");
const { Type } = require("../models/modelsTS.ts");
const TypeService = require("../services/type.service.ts");

// всё в упрощ.вар.
class TypeController {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      const type = await TypeService.create(name);
      return res.json(type);
    } catch (error) {
      next(`НЕ удалось добавить Тип - ${error}.`);
    }
  }

  async getAll(req, res, next) {
    // `найти все`
    // const types = await Type.findAll();
    // return res.json(types);
    try {
      const types = await TypeService.getAll();
      return res.json(types);
    } catch (error) {
      next(`НЕ удалось получить Типы - ${error}.`);
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const typeId = await TypeService.getOne(id);
      return res.json(typeId);
    } catch (error) {
      next(`НЕ удалось по ID - ${error}.`);
    }
  }

  // ! не раб
  async update(req, res, next) {
    // try {
    //   // const { id, name } = req.body;
    //   const { id, name } = req.params;
    //   const types = await Type.update(
    //     // { where: { id, name } }
    //     { id, name }
    //   );
    //   return res.json(types);
    // } catch (error) {}

    try {
      const { id, name } = req.body;
      if (!id) {
        return next(ApiError.internal(`ID не передан`));
      }
      const typeUpd = await TypeService.update(id, name);
      return res.json(typeUpd);
    } catch (error) {
      next(`НЕ обновлён - ${error}.`);
    }
  }

  // ! не раб
  async delAll(req, res, next) {
    // const id = req.query.id;
    // const types = await Type.destroy();
    // return res.json(types);
  }

  async delOne(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        return next(ApiError.internal(`ID не передан`));
      }
      const delType = await TypeService.delOne(id);
      return res.json(delType);
    } catch (error) {
      next(`НЕ удалён - ${error}.`);
    }
  }
}

module.exports = new TypeController();
