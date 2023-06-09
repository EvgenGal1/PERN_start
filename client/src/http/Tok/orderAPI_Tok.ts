// ^ HTTP-запросы на сервер для работы с заказами
import { guestInstance, authInstance } from "./index_Tok";

/*
 * ЗАКАЗ для ADMIN магазина
 */

// создать новый заказ
export const adminCreate = async (body: any) => {
  const { data } = await authInstance.post("order/admin/create", body);
  return data;
};
// получить список всех заказов магазина
export const adminGetAll = async () => {
  const { data } = await authInstance.get("order/admin/getall");
  return data;
};
// получить список заказов пользователя
export const adminGetUser = async (id: number) => {
  const { data } = await authInstance.get(`order/admin/getall/user/${id}`);
  return data;
};
// получить заказ по id
export const adminGetOne = async (id: number | string | undefined) => {
  const { data } = await authInstance.get(`order/admin/getone/${id}`);
  return data;
};
// обновить заказ по id
export const adminUpdate = async (id: number, body: any) => {
  const { data } = await authInstance.put(`order/admin/update/${id}`, body);
  return data;
};
// удалить заказ по id
export const adminDelete = async (id: number) => {
  const { data } = await authInstance.delete(`order/admin/delete/${id}`);
  return data;
};

/*
 * ПОЗИЦИИ Заказа для cоздание, обновление и удаление
 */
export const createItem = async (orderId: number, item: any) => {
  const { data } = await authInstance.post(
    `order/${orderId}/item/create`,
    item
  );
  return data;
};

export const updateItem = async (orderId: number, id: number, item: any) => {
  const { data } = await authInstance.put(
    `order/${orderId}/item/update/${id}`,
    item
  );
  return data;
};

export const deleteItem = async (orderId: number, id: number) => {
  const { data } = await authInstance.delete(
    `order/${orderId}/item/delete/${id}`
  );
  return data;
};

/*
 * для авторизованного пользователя
 */

// создать новый заказ
export const userCreate = async (body: any) => {
  const { data } = await authInstance.post("order/user/create", body);
  return data;
};
// получить список всех заказов пользователя
export const userGetAll = async () => {
  const { data } = await authInstance.get("order/user/getall");
  return data;
};
// получить один заказ пользователя
export const userGetOne = async (id: number | string | undefined) => {
  const { data } = await authInstance.get(`order/user/getone/${id}`);
  return data;
};

/*
 * для неавторизованного пользователя
 */

// создать новый заказ
export const guestCreate = async (body: any) => {
  const { data } = await guestInstance.post("order/guest/create", body);
  return data;
};
