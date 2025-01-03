// ^ HTTP-запросы на сервер для работы с заказами
import { guestInstance, authInstance } from "./indexAPI_Tok";

/*
 * ЗАКАЗ для ADMIN магазина
 */

// создать новый заказ
interface OrderBody {
  productId: number;
  quantity: number;
}

export const adminCreate = async (body: OrderBody) => {
  try {
    const { data } = await authInstance.post("order/admin/create", body);

    return data;
  } catch (e: unknown) {
    /* catch (e: any) {
    const status = e?.response?.status;
    const errors = e?.response?.data?.errors;
    const message = e?.response?.data?.message;

    const data = { errors, message, status };
    return data;
  } */
    const error = e as {
      response?: {
        status: number;
        data: { errors?: Record<string, unknown>; message?: string };
      };
    };
    if (error.response) {
      const status = error.response?.status;
      const errors = error.response?.data.errors;
      const message = error.response?.data.message;

      const data = { errors, message, status };
      return data;
    }
  }
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
  // console.log("ordAPI adm_One data : ", data);
  return data;
};

// обновить заказ по id
interface UpdateOrderBody {
  productId?: number;
  quantity?: number;
  status?: string;
}

export const adminUpdate = async (id: number, body: UpdateOrderBody) => {
  const { data } = await authInstance.put(`order/admin/update/${id}`, body);
  // console.log("ordAPI adm_UPD data : ", data);
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
interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export const createItem = async (orderId: number, item: OrderItem) => {
  try {
    const { data } = await authInstance.post(
      `order/${orderId}/item/create`,
      item
    );

    return data;
  } /* catch (e: any) {
    const status = e?.response?.status;
    const errors = e?.response?.data?.errors;
    const message = e?.response?.data?.message;

    const data = { errors, message, status };
    return data;
  } */ catch (e: unknown) {
    const error = e as {
      response?: {
        status: number;
        data: { errors?: Record<string, unknown>; message?: string };
      };
    };
    if (error.response) {
      const status = error.response?.status;
      const errors = error.response?.data.errors;
      const message = error.response?.data.message;

      const data = { errors, message, status };
      return data;
    }
  }
};

export const updateItem = async (
  orderId: number,
  id: number,
  item: OrderItem
) => {
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
interface UserOrderBody {
  productId: number;
  quantity: number;
}

export const userCreate = async (body: UserOrderBody) => {
  try {
    const { data } = await authInstance.post("order/user/create", body);

    return data;
  } /* catch (e: any) {
    const status = e?.response?.status;
    const errors = e?.response?.data?.errors;
    const message = e?.response?.data?.message;

    const data = { errors, message, status };
    return data;
  } */ catch (e: unknown) {
    const error = e as {
      response?: {
        status: number;
        data: { errors?: Record<string, unknown>; message?: string };
      };
    };
    if (error.response) {
      const status = error.response?.status;
      const errors = error.response?.data.errors;
      const message = error.response?.data.message;

      const data = { errors, message, status };
      return data;
    }
  }
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
interface GuestOrderBody {
  productId: number;
  quantity: number;
}

interface ErrorResponse {
  response?: {
    status: number;
    data: { errors?: Record<string, unknown>; message?: string };
  };
}

export const guestCreate = async (body: GuestOrderBody) => {
  try {
    const { data } = await guestInstance.post("order/guest/create", body);

    return data;
  } catch (e: unknown) {
    const error = e as ErrorResponse;
    if (error.response) {
      const status = error.response?.status;
      const errors = error.response?.data.errors;
      const message = error.response?.data.message;

      const data = { errors, message, status };
      return data;
    }
  }
};
