// табл.
import { Basket as BasketModel } from "../models/model";
import { Product as ProductModel } from "../models/model";
import { BasketProduct as BasketProductModel } from "../models/model";
// утилиты/helpы/ошб.
import DatabaseUtils from "../utils/database.utils";
import AppError from "../error/ApiError";

const pretty = (basket) => {
  const data: any = {};
  data.id = basket.id;
  data.products = [];
  if (basket.products) {
    data.products = basket.products.map((item) => {
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.basket_product.quantity,
      };
    });
  }
  return data;
};

class BasketService {
  async getOneBasket(basketId: number | null, userId?: number) {
    try {
      // получ.basket_id
      if (basketId == null && userId) {
        const idBasket = await BasketModel.findOne({
          where: { userId: userId },
        });
        return idBasket.id;
      }

      // получ. basket с product
      const basketProd = await BasketModel.findByPk(basketId, {
        attributes: ["id"],
        include: [{ model: ProductModel, attributes: ["id", "name", "price"] }],
      });

      return pretty(basketProd);
    } catch (error) {
      return AppError.badRequest(`Корзина не получена`, error.message);
    }
  }

  async createBasket(userId?: any) {
    try {
      // `получить наименьший доступный идентификатор` из табл.БД
      const smallestFreeId = await DatabaseUtils.getSmallestIDAvailable(
        "basket"
      );
      let returned: any = {};
      // при передаче userId созд. Корзину с привязкой к User (Регистр User)
      if (userId) {
        returned = await BasketModel.create({
          id: smallestFreeId,
          userId: userId,
        });
      } else {
        return AppError.badRequest(
          `для Корзины не передан userId`,
          "НЕТ userId"
        );
        // ! прописать для всех createBasket передачу/подтягивание user_id убрав лишн.код с if/else
        returned = await BasketModel.create({
          id: smallestFreeId,
          userId: userId,
        });
      }

      return pretty(returned);
    } catch (error) {
      return AppError.badRequest(`Корзина не создана`, error.message);
    }
  }

  async appendBasket(basketId: number, productId: number, quantity: number) {
    try {
      let basket = await BasketModel.findByPk(basketId, {
        attributes: ["id"],
        include: [{ model: ProductModel, attributes: ["id", "name", "price"] }],
      });

      if (!basket) basket = await BasketModel.create();

      // проверяем, есть ли уже этот товар в корзине
      const basket_product = await BasketProductModel.findOne({
        where: { basketId, productId },
      });

      // есть в корзине
      if (basket_product)
        await basket_product.increment("quantity", { by: quantity });
      // нет в корзине
      else await BasketProductModel.create({ basketId, productId, quantity });

      // обновим объект корзины, чтобы вернуть свежие данные
      await basket.reload();

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(`В Корзину не добавлено`, error.message);
    }
  }

  async incrementBasket(basketId: number, productId: number, quantity: number) {
    try {
      let basket = await BasketModel.findByPk(basketId, {
        include: [{ model: ProductModel, as: "products" }],
      });

      if (!basket) basket = await BasketModel.create();

      // проверяем, есть ли этот товар в корзине
      const basket_product = await BasketProductModel.findOne({
        where: { basketId, productId },
      });

      if (basket_product) {
        await basket_product.increment("quantity", { by: quantity });
        // обновим объект корзины, чтобы вернуть свежие данные
        await basket.reload();
      }

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(`В Коризину не прибавлено`, error.message);
    }
  }

  async decrementBasket(basketId: number, productId: number, quantity: number) {
    try {
      let basket = await BasketModel.findByPk(basketId, {
        include: [{ model: ProductModel, as: "products" }],
      });

      if (!basket) {
        basket = await BasketModel.create();
      }

      // проверяем, есть ли этот товар в корзине
      const basket_product = await BasketProductModel.findOne({
        where: { basketId, productId },
      });

      if (basket_product) {
        if (basket_product.quantity > quantity) {
          await basket_product.decrement("quantity", { by: quantity });
        } else {
          await basket_product.destroy();
        }

        // обновим объект корзины, чтобы вернуть свежие данные
        await basket.reload();
      }

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(`Из Коризины не убавлено`, error.message);
    }
  }

  async clearBasket(basketId: number) {
    try {
      let basket = await BasketModel.findByPk(basketId, {
        include: [{ model: ProductModel, as: "products" }],
      });

      if (basket) {
        await BasketProductModel.destroy({ where: { basketId } });
        await basket.reload();
      } else {
        basket = await BasketModel.create();
      }

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(`Коризина не jxbotyf`, error.message);
    }
  }

  // удаление Корзины
  async deleteBasket(basketId: number) {
    try {
      const basket = await BasketModel.findByPk(basketId, {
        include: [{ model: ProductModel, as: "products" }],
      });
      if (!basket) throw new Error("Корзина не найдена в БД");

      if (basketId == basket.userId) {
        BasketModel.destroy({ where: { userId: basketId } });
      } else {
        await basket.destroy();
      }

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(`Коризина не удалена`, error.message);
    }
  }

  // удаление Корзины с Товарами
  async removeBasket(basketId: number, productId: number) {
    try {
      let basket = await BasketModel.findByPk(basketId, {
        include: [{ model: ProductModel, as: "products" }],
      });
      if (!basket) throw new Error("Корзина не найдена в БД");

      if (!basket) basket = await BasketModel.create();

      // проверяем, есть ли этот товар в корзине
      const basket_product = await BasketProductModel.findOne({
        where: { basketId, productId },
      });

      if (basket_product) {
        await basket_product.destroy();
        await basket.reload();
      }

      return pretty(basket);
    } catch (error) {
      return AppError.badRequest(
        `Коризина с Товарами не удалена`,
        error.message
      );
    }
  }
}

export default new BasketService();
