// ^ модальн.окно редактирование Заказа
import { useState, useEffect } from "react";
import uuid from "react-uuid";

import {
  adminGetOne,
  adminUpdate,
  createItem,
  updateItem,
  deleteItem,
} from "../../../http/Tok/orderAPI_Tok";
import UpdateItems from "./UpdateItems";
import Modal__eg from "../../ui/Modal/Modal__eg";
import FormField__eg from "../../ui/Form/FormField__eg";

const defaultValue = {
  name: "",
  email: "",
  phone: "",
  address: "",
  comment: "",
};
const defaultValid = {
  name: null,
  email: null,
  phone: null,
  address: null,
  comment: null,
};

const isValid = (value: any) => {
  const result: any = {};
  const pattern = /^[1-9][0-9]*$/;
  // const patternNam = /^[-а-я]{2,}( [-а-я]{2,}){1,2}*$/;
  const patternEML = /^[a-z0-9._%+-]+@[a-z0-9.-]+.{1,2}[a-z]+$/i;
  const patternPHN = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/i;
  for (let key in value) {
    if (key === "name")
      result.name =
        // patternNam.test(value.name.trim());
        value.name.trim() !== "";
    if (key === "email")
      result.email =
        // value.email.trim();
        patternEML.test(value.email.trim());
    if (key === "phone")
      result.phone =
        // value.phone.trim();
        patternPHN.test(value.phone);
    if (key === "address")
      result.address =
        // pattern.test(value.address);
        value.address.trim() !== "";
    // if (key === "comment")
    //   result.comment =
    //     // pattern.test(value.comment);
    //     value?.comment /* ?.trim() */ /* || " " */;
  }
  return result;
};

// функция updateItem, которая проходит по всему массиву Items и для каждой хар-ки выполняет подходящий http-запрос. Причем, для каждого http-запроса мы ждем ответ, так что к моменту возврата из функции все хар-ки уже обновились на сервере. И когда мы выполним еще один запрос, чтобы обновить название, цену, категорию и бренд товара — то в ответе получим уже обновленные хар-ки.
const updateItems = async (items: any, orderId: any) => {
  for (const item of items) {
    const empty =
      item.name /* .trim() */ === "" || item.value /* .trim() */ === "";
    // если вдруг старая хар-ка оказалась пустая — удалим ее на сервере
    if (empty && item.id) {
      try {
        await deleteItem(orderId, item);
      } catch (error: any) {
        alert(error.response.data.message);
      }
      continue;
    }
    /*
     * Если у объекта item свойство append равно true — это новая хар-ка, ее надо создать.
     * Если у объекта item свойство change равно true — хар-ка изменилась, ее надо обновить.
     * Если у объекта item свойство remove равно true — хар-ку удалили, ее надо удалить.
     */
    if (item.append && !empty) {
      try {
        await createItem(orderId, item);
      } catch (error: any) {
        alert(error.response.data.message);
      }
      continue;
    }
    if (item.change && !item.remove) {
      try {
        await updateItem(orderId, item.id, item);
      } catch (error: any) {
        alert(error.response.data.message);
      }
      continue;
    }
    if (item.remove) {
      try {
        await deleteItem(orderId, item.id);
      } catch (error: any) {
        alert(error.response.data.message);
      }
      continue;
    }
  }
};

const UpdateOrder = (props: any) => {
  const { id, show, setShow, setChange, auth } = props;

  const [value, setValue] = useState(defaultValue);
  const [valid, setValid] = useState(defaultValid);

  // список характеристик товара
  const [items, setItems] = useState([]);

  const itemsId = items;
  const amount: any = itemsId.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0
  );

  useEffect(
    () => {
      if (id) {
        // получ.данн.Товара с БД
        adminGetOne(id)
          .then((data) => {
            console.log("UpdOrd usEf data ", data);
            const order = {
              name: data.name.toString(),
              email: data.email.toString(),
              phone: data.phone.toString(),
              address: data.address.toString(),
              comment: data?.comment == null ? "" : data?.comment.toString(),
            };
            setValue(order);
            setValid(isValid(order));
            setValid(order);
            // для удобства работы с хар-ми зададим для каждой уникальный идентификатор и доп.свойства, которые подскажут нам, какой http-запрос на сервер нужно выполнить — добавления, обновления или удаления характеристики
            setItems(
              data.items.map((item: any) => {
                // при добавлении новой хар-ки свойство append принимает значение true
                // при изменении старой хар-ки свойство change принимает значение true
                // при удалении старой хар-ки свойство remove принимает значение true
                return {
                  ...item,
                  unique: uuid(),
                  append: false,
                  remove: false,
                  change: false,
                };
              })
            );
          })
          .catch((error) => alert(error.response.data.message));
        // нужно получить с сервера список категорий и список брендов
        // fetchCategories().then((data) => setCategories(data));
        // fetchBrands().then((data) => setBrands(data));
      }
    },
    // ! не раб. - загрузка аж 4 раза !!!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id]
  );

  const handleInputChange = (event: any) => {
    const data = { ...value, [event.target.name]: event.target.value };
    setValue(data);
    setValid(isValid(data));
  };

  const handleSubmit = async (event: any) => {
    // event.preventDefault();
    console.log("UpdateOrder handleSubmit event ", event);
    /*
     * На первый взгляд кажется, что переменная correct не нужна, можно обойтись valid, но это не так. Нельзя использовать значение valid сразу после изменения этого значения — ф-ция setValid не изменяет значение состояния мгновенно. Вызов функции лишь означает — React «принял к сведению» наше сообщение, что состояние нужно изменить.
     */
    const correct = isValid(value);
    setValid(correct);

    console.log("UpdateOrder handleSubmit value ", value);

    // если введенные данные прошли проверку — можно отправлять их на сервер
    if (correct.name && correct.email && correct.phone && correct.address) {
      console.log("UpdOrd Sbmt IF correct ", 123);
      const data = new FormData();
      data.append("name", value.name.trim());
      data.append("email", value.email.trim());
      data.append("phone", value.phone.trim());
      data.append("address", value.address.trim());
      data.append("comment", value.comment.trim());

      // нужно обновить, добавить или удалить характеристики и обязательно дождаться ответа сервера — поэтому функция updateItem() объявлена как async, а в теле функции для выполнения действия с каждой хар-кой используется await
      if (items.length) {
        await updateItems(items, id);
      }

      console.log("UpdateOrder handleSubmit items ", items);

      // adminUpdate(id, data)
      //   .then((data) => {
      //     const order = {
      //       name: data.name,
      //       email: data.email.toString(),
      //       phone: data.phone.toString(),
      //       address: data.address.toString(),
      //       comment: data.comment.toString(),
      //     };
      //     setValue(order);
      //     setValid(isValid(order));
      //     // мы получим актуальные значения хар-тик с сервера, потому что обновление хар-тик завершилось еще до момента отправки этого http-запроса на сервер
      //     setItems(
      //       data.items.map((item: any) => {
      //         return {
      //           ...item,
      //           unique: uuid(),
      //           append: false,
      //           remove: false,
      //           change: false,
      //         };
      //       })
      //     );
      //     // закрываем модальное окно редактирования заказов
      //     setShow(false);
      //     // изменяем состояние компонента списка заказов
      //     setChange((state: any) => !state);
      //   })
      //   .catch((error) => alert(error.response.data.message));
    }
  };

  // ^ рендр.эл. вне корн.эл.React
  // return show ? ReactDOM.createPortal(<div></div>, document.body) : null;

  const header = <>Редактирование Заказа №</>;

  return (
    //eslint-disable-next-line react/jsx-pascal-case
    <Modal__eg
      closureBoundary={true}
      isOpen={show}
      onClose={setShow}
      header={header}
      body={
        <>
          {/*  eslint-disable-next-line react/jsx-pascal-case */}
          <FormField__eg
            handleSubmit={handleSubmit}
            handleChange={handleInputChange}
            value={{
              name: value.name,
              address: value.address,
              comment: value.comment,
              phone: value.phone,
              email: value.email,
            }}
            valid={valid}
            union={["phone", "email"]}
            amount={amount}
            legend={"Пользователь"}
            // nonField={true}
            // cl={"mt-2"}
          />
          {/*  eslint-disable-next-line react/jsx-pascal-case */}
          <FormField__eg
            handleChange={handleInputChange}
            value={{
              phone: value.phone,
              email: value.email,
              comment: value.comment,
            }}
            valid={valid}
            union={["phone", "email"]}
            amount={amount}
            // legend={"Котакты"}
            cl={"mt-4"}
            // nonField={true}
          />
          {/*  eslint-disable-next-line react/jsx-pascal-case */}
          <FormField__eg
            handleSubmit={handleSubmit}
            handleChange={handleInputChange}
            value={{
              name: value.name,
              address: value.address,
              comment: value.comment,
              phone: value.phone,
              email: value.email,
            }}
            valid={valid}
            union={["phone", "email"]}
            amount={amount}
            // legend={"Пользователь2"}
            cl={"mt-4"}
            nonField={true}
          />
          {/*  eslint-disable-next-line react/jsx-pascal-case */}
          <FormField__eg
            handleChange={handleInputChange}
            value={{
              phone: value.phone,
              email: value.email,
              comment: value.comment,
            }}
            valid={valid}
            union={["phone", "email"]}
            amount={amount}
            legend={"Котакты2"}
            cl={"mt-2"}
            nonField={true}
          />
          {/* Позиции  */}
          {/*  eslint-disable-next-line react/jsx-pascal-case */}
          <FormField__eg
            body={
              <>
                <UpdateItems items={items} setItems={setItems} />
              </>
            }
            legend={"Позиции"}
            cl={"mt-3"}
            // nonField={true}
          />
          <div className="df df-row df-jcsb mt-4">
            <button type="submit" className="btn--eg btn-success--eg">
              Сохранить
            </button>
          </div>
        </>
      }
    />
  );
};

export default UpdateOrder;
