import AppError from "../error/ApiError";
import {
  Product as ProductMapping,
  ProductProp as ProductPropMapping,
  Brand as BrandMapping,
  Category as CategoryMapping,
} from "../models/mapping";
import FileService from "./file.service";

// Типы данных
interface Products {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId: number | null;
  brandId: number | null;
  props?: ProductProp[];
  category?: Category;
  brand?: Brand;
  // createdAt: Date;
  // updatedAt: Date;
}

interface CreateData {
  name: string;
  price: number;
  categoryId?: number | null;
  brandId?: number | null;
  props?: string;
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
  id: number;
  name: string;
  value: string;
  productId: number;
  // createdAt: Date;
  // updatedAt: Date;
}

interface Category {
  id: number;
  name: string;
  // createdAt: Date;
  // updatedAt: Date;
}

interface Brand {
  id: number;
  name: string;
  // createdAt: Date;
  // updatedAt: Date;
}

class Product {
  // async getAll(params) {
  async getAll(options: any) {
    // const { categoryId, brandId } = params;
    const { categoryId, brandId, limit, page, sortOrd, sortField } = options;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    // Кол-во эл. `Найдите и посчитайте все`
    let countAll = await ProductMapping.findAndCountAll({
      where,
      // для каждого товара получаем бренд и категорию
      include: [
        { model: BrandMapping, as: "brand" },
        { model: CategoryMapping, as: "category" },
      ],
    });
    // Пропускаем n первых эл.в BD (для 1 стр.)
    let offset = 0;
    // Пропуск n эл.в BD е/и page > 1
    if (page > 1) {
      offset = (page - 1) * limit;
      console.log("1 : " + offset);
    }
    // е/и эл.в BD МЕНЬШЕ чем в запросе(offset)
    if (countAll.count <= offset) {
      // offset =
      //   countAll.count -
      //   (countAll.count - limit * Math.floor(countAll.count / limit));
      offset = countAll.count - limit;
      console.log("2 : " + offset);
    }
    if (offset < 0) offset = 0;
    console.log("offset : " + offset);
    const products = await ProductMapping.findAndCountAll({
      where,
      limit,
      offset,
      // для каждого товара получаем бренд и категорию
      include: [
        { model: BrandMapping, as: "brand" },
        { model: CategoryMapping, as: "category" },
      ],
      order: [[sortField || "name", sortOrd || "ASC"]],
    });
    console.log("prod.count", products.count);
    console.log("prod.rows", products.rows.length);
    // return products;
    return { ...products, limit };
  }

  async getOne(id: number) {
    // const product = await ProductMapping.findByPk(id);
    // const product = await ProductMapping.findOne({
    //   where: { id: id },
    const product = await ProductMapping.findByPk(id, {
      include: [
        { model: ProductPropMapping, as: "props" },
        // получать категорию и бренд
        { model: BrandMapping, as: "brand" },
        { model: CategoryMapping, as: "category" },
      ],
    });
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    return product;
  }

  async create(
    data: CreateData,
    img: any /* : Express.Multer.File */
  ): Promise<Products> {
    // поскольку image не допускает null, задаем пустую строку
    const image = FileService.save(img) ?? "";
    const { name, price, categoryId = null, brandId = null } = data;
    const product = await ProductMapping.create({
      name,
      price,
      image,
      categoryId,
      brandId,
    });
    // свойства товара
    if (data.props) {
      // ! ошб. Unexpected token o in JSON at position 1 - коммит parse от не нужного преобразованя JSON в объ.
      const props: ProductProp[] = JSON.parse(data.props);
      for (let prop of props) {
        await ProductPropMapping.create({
          name: prop.name,
          value: prop.value,
          productId: product.id,
        });
      }
    }
    // возвращать будем товар со свойствами
    const created = await ProductMapping.findByPk(product.id, {
      include: [{ model: ProductPropMapping, as: "props" }],
    });
    return created;
  }

  async update(
    id: number | string,
    data: UpdateData,
    img: any /* : Express.Multer.File */
  ) {
    const product = await ProductMapping.findByPk(id, {
      include: [{ model: ProductPropMapping, as: "props" }],
    });
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    // пробуем сохранить изображение, если оно было загружено
    const file = FileService.save(img);
    // если загружено новое изображение — надо удалить старое
    if (file && product.image) {
      FileService.delete(product.image);
    }
    // подготавливаем данные, которые надо обновить в базе данных
    const {
      name = product.name,
      price = product.price,
      categoryId = product.categoryId,
      brandId = product.brandId,
      image = file ? file : product.image,
      rating = product.rating,
    } = data;
    await product.update({ name, price, rating, image, categoryId, brandId });
    if (data.props) {
      // свойства товара
      // удаляем старые и добавляем новые
      await ProductPropMapping.destroy({ where: { productId: id } });
      const props = JSON.parse(data.props);
      for (let prop of props) {
        await ProductPropMapping.create({
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

  async delete(id: number | string) {
    const product = await ProductMapping.findByPk(id);
    if (!product) {
      throw new Error("Товар не найден в БД");
    }
    if (product.image) {
      // удаляем изображение товара
      FileService.delete(product.image);
    }
    await product.destroy();
    return product;
  }

  // TODO: это вообще используется?
  async isExist(id: number) {
    const basket = await ProductMapping.findByPk(id);
    return basket;
  }
}

export default new Product();
