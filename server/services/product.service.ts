import {
  Product as ProductModel,
  ProductProp as ProductPropModel,
  Brand as BrandModel,
  Category as CategoryModel,
  Rating as RatingModel,
} from "../models/model";
import FileService from "./file.service";
import AppError from "../error/ApiError";

// Типы данных
interface Products {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId: number | null | any;
  brandId: number | null | any;
  props?: ProductProp[];
  category?: Category;
  brand?: Brand;
  // createdAt: Date;
  // updatedAt: Date;
}

interface CreateData {
  name: string | any;
  price: number | any;
  categoryId?: number | null | any;
  brandId?: number | null | any;
  props?: string | any;
}

interface UpdateData {
  name?: string;
  price?: number;
  rating?: number;
  categoryId?: number;
  brandId?: number;
  image?: string;
  props?: string;
}

interface ProductProp {
  id: number | any;
  name: string | any;
  value: string | any;
  productId: number | any;
  // createdAt: Date;
  // updatedAt: Date;
}

interface Category {
  id: number | any;
  name: string | any;
  // createdAt: Date;
  // updatedAt: Date;
}

interface Brand {
  id: number | any;
  name: string | any;
  // createdAt: Date;
  // updatedAt: Date;
}

class ProductService {
  async getAllProduct(options: any) {
    const {
      categoryId,
      categoryId_q,
      brandId,
      brandId_q,
      limit,
      page,
      sortOrd,
      sortField,
    } = options;

    // перем.для уточнения запроса к др.Табл.
    let where: any = {};

    // ^ определение/запись кол-ва значений ч/з разделитель(_) (if - мн. if else - одно)
    // Категории
    if (categoryId?.includes("_")) where.categoryId = categoryId.split("_");
    else if (categoryId && !categoryId?.includes("_"))
      where.categoryId = categoryId;
    // Бренд
    if (brandId?.includes("_")) where.brandId = brandId.split("_");
    else if (brandId && !brandId?.includes("_")) where.brandId = brandId;

    // Кол-во эл. `Найдите и посчитайте все`
    let countAll = await ProductModel.findAndCountAll({
      where,
      // для каждого товара получаем Бренд и Категорию
      include: [
        { model: BrandModel, as: "brand" },
        { model: CategoryModel, as: "category" },
      ],
    });

    // ! дораб - для сорт.по голосу(из Табл.Rating)
    let sortFieldVotes: any = {};
    // console.log("sortFieldVotes 0 : " + sortFieldVotes);
    // console.log(sortFieldVotes);
    if (sortField === "votes") {
      sortFieldVotes = `{ model: RatingModel, as: "ratings" }`;
      // console.log("sortFieldVotes : " + sortFieldVotes);
      // console.log(sortFieldVotes);
    }
    let sortFieldParam = sortField;
    if (sortField === "votes") {
      // ! не раб.сортировка по votes, userId, rate|s, rating|s
      // sortFieldParam = `RatingModel, "votes"`;
      sortFieldParam = `{ model: RatingModel, as: "ratings" }, "rates"`;
    }

    // Пропускаем n первых эл.в БД (для 1 стр.)
    let offset = 0;
    // Пропуск n(limit) эл.в БД е/и page > 1
    if (page > 1) {
      offset = (page - 1) * limit;
    }
    // е/и эл.в БД МЕНЬШЕ чем в запросе(offset)
    if (countAll.count <= offset) offset = countAll.count - limit;
    // защита от минусового результата
    if (offset < 0) offset = 0;

    const products = await ProductModel.findAndCountAll({
      where,
      limit,
      offset,
      // для каждого товара получаем бренд и категорию
      include: [
        // получаем все модели, вместе со связанными с ними моделями
        // { all: true, nested: true },
        { model: BrandModel, as: "brand" },
        { model: CategoryModel, as: "category" },
        // { model: ProductPropModel, as: "props" },
        // sortFieldVotes
        // { model: RatingModel, as: "ratings" },
      ],
      order: [[sortFieldParam || "name", sortOrd || "ASC"]],
    });

    return { ...products, limit };
  }

  async getOneProduct(id: number) {
    const product = await ProductModel.findByPk(id, {
      include: [
        { model: ProductPropModel, as: "props" },
        // получать категорию и бренд
        { model: BrandModel, as: "brand" },
        { model: CategoryModel, as: "category" },
        // { model: RatingModel, as: "ratings" },
      ],
    });
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    return product;
  }

  async createProduct(
    data: CreateData,
    img: any /* : Express.Multer.File */
  ): Promise<Products> {
    // поскольку image не допускает null, задаем пустую строку
    const image = FileService.saveFile(img) ?? "";
    const { name, price, categoryId = null, brandId = null } = data;

    // перем.для уточнения записи запроса к др.Табл.
    // let where: any = {};
    // перем.для вызова метода возврата Товара с Неск-им/Одним знач.
    let returned: any = {};

    // ^ для записи 1го знач.
    if ((categoryId.length || brandId.length) < 2) {
      // созд.1го Товара
      const product = await ProductModel.create({
        name,
        price,
        image,
        categoryId,
        brandId,
      });
      // созд.свойства 1го Товара
      if (data.props) {
        const propsParse = JSON.parse(data.props);
        // получ.всегда первого массива
        let props = propsParse[0];
        // перебор масс. по эл.
        for (let prop of props) {
          // данн.из кажд.эл.сохр.по отдельности
          await ProductPropModel.create({
            name: prop.name,
            value: prop.value,
            productId: product.id,
          });
        }
      }

      // возврат 1го Товар со свойствами
      returned = await ProductModel.findByPk(product.id, {
        include: [{ model: ProductPropModel, as: "props" }],
      });
    }

    // ^ для запись Неск-им знач.
    if (categoryId?.length > 1 || brandId?.length > 1) {
      // перем.всех разбитых парам.
      const resultAll = [];

      // ^ для render|state|загрузки на ОБЪЕКТЕ
      // // разбивка вход стр./объ. на масс. по запятой
      // let nameAll = name.split(",");
      // let priceAll = price.split(",");
      // let brandIdAll = brandId.split(",");
      // let categoryIdAll = categoryId.split(",");

      // для image отдельный split т.к. FileService возвращ.стр.имена ч/з запятую
      let imageAll = image.split(",");

      // цикл по длине какого-либо парам.
      // ^ для render|state|загрузки на ОБЪЕКТЕ
      // for (var i = 0; i < nameAll.length; i++) {
      // ^ для render|state|загрузки на МАССИВЕ
      for (var i = 0; i < name.length; i++) {
        // один Товар в переборе
        const allParam = {
          // ^ для render|state|загрузки на ОБЪЕКТЕ
          // name: nameAll[i],
          // price: priceAll[i],
          // brandId: brandIdAll[i],
          // categoryId: categoryIdAll[i],
          // image: imageAll[i] || "",

          // ^ для render|state|загрузки на МАССИВЕ
          name: name[i],
          price: price[i],
          brandId: brandId[i],
          categoryId: categoryId[i],
          image: imageAll[i] || "",
        };

        // запись одного Товара в общ.перем.
        resultAll.push(allParam);
      }

      // массовое созд.
      const productBulk = await ProductModel.bulkCreate(resultAll);

      // е/и есть Хар-ки Товара
      if (data.props) {
        // преобразуем вход.строку в объ/масс. с масс.объ.
        const propsParse = JSON.parse(data.props);
        // [
        //   0: [ { name: '1212', value: 'qw' }, { name: '121212', value: 'qwqw' } ],
        //   1: [ { name: '9898', value: 'as' } ]
        // ]

        // перебор всех key в Хар-ах
        for (let key of Object.keys(propsParse)) {
          // Object.keys(propsParse) - ['0', '1'] | key - 0 затем 1

          // получ.позиц.id нов.Товаров по key имеющихся Хар-ик (каждому Товару свои Хар-ки)
          let productBulkId = productBulk[key].id;
          // 304 затем 305

          // перем. масс.значений определённого key
          let value = propsParse[key];
          // [ { name: '1212', value: 'qw' }, { name: '121212', value: 'qwqw' } ]

          // перебор объ.в опред.масс.значений
          for (let prop of value) {
            // prop - { name: '1212', value: 'qw' } затем { name: '121212', value: 'qwqw' }
            // запись данн.каждого объ.по отдельности
            await ProductPropModel.create({
              name: prop.name,
              value: prop.value,
              productId: productBulkId,
            });
          }
        }
      }

      // возврат неск. Товаров со свойствами и кол-ом
      returned = await ProductModel.findAndCountAll({
        // where, // ? не нужно
        include: [{ model: ProductPropModel, as: "props" }],
      });
    }

    // возвращ.результ.созд.
    return returned;
  }

  async updateProduct(
    id: number | string,
    data: UpdateData,
    img: any /* : Express.Multer.File */
  ) {
    const product = await ProductModel.findByPk(id, {
      include: [{ model: ProductPropModel, as: "props" }],
    });
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    // пробуем сохранить изображение, если оно было загружено
    const file = FileService.saveFile(img);
    // если загружено новое изображение — надо удалить старое
    if (file && product.image) {
      FileService.deleteFile(product.image);
    }
    // подготовка вход.данн. для обнов. в БД
    const {
      name = product.name,
      price = product.price,
      rating = product.rating,
      categoryId = product.categoryId,
      brandId = product.brandId,
      image = file ? file : product.image,
    } = data;

    await product.update({ name, price, rating, image, categoryId, brandId });

    // свойства товара
    if (data.props) {
      // удаляем старые и добавляем новые
      await ProductPropModel.destroy({ where: { productId: id } });
      const props = JSON.parse(data.props);
      for (let prop of props) {
        await ProductPropModel.create({
          name: prop.name,
          value: prop.value,
          productId: product.id,
        });
      }
    }

    // обновим объект товара, чтобы вернуть свежие данные
    await product.reload();
    return product;
  }

  async deleteProduct(id: number | string) {
    const product = await ProductModel.findByPk(id);
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    // удаляем ИЗО Товара
    if (product.image) {
      FileService.deleteFile(product.image);
    }
    // удаляем Хар-ки Товара
    if (product.prop) {
      ProductPropModel.destroy({ where: { productId: id } });
    }
    await product.destroy();
    return product;
  }

  // TODO: это вообще используется?
  async isExistProduct(id: number) {
    const basket = await ProductModel.findByPk(id);
    return basket;
  }
}

export default new ProductService();
