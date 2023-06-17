// ^ Многраз.Комп.Заказа
import { useState, useEffect } from "react";
import { Table, Button, Spinner, Row, Col, Pagination } from "react-bootstrap";

import {
  adminGetAll,
  adminGetOne,
  adminUpdate,
  adminDelete,
} from "../../../http/Tok/orderAPI_Tok";
import EditOrder from "../../layout/AppTok/EditOrder";
// import CreateOrder from "../../layout/AppTok/CreateOrder";
import UpdateOrder from "../../layout/AppTok/UpdateOrder";

// количество Заказов на страницу
const ADMIN_PER_PAGE = 8;

const Order = (props: any) => {
  const id = props.data;

  // список загруженных заказов
  const [orders, setOrders]: any = useState([]);
  // загрузка списка категорий с сервера
  const [fetching, setFetching] = useState(true);
  // модальное окно создания-редактирования
  const [show, setShow] /* : any */ = useState(false);
  // для обновления списка после добавления, редактирования, удаления — изменяем состояние
  const [change, setChange] = useState(false);
  // id заказа, которую будем редактировать — для передачи в <UpdateOrder id={…} />
  const [orderId, setOrderId]: any = useState(null);

  // текущая страница списка Заказов
  const [currentPage, setCurrentPage] = useState(1);
  // сколько всего страниц списка Заказов
  const [totalPages, setTotalPages] = useState(1);

  // обработчик клика по номеру страницы
  const handlePageClick = (page: any) => {
    setCurrentPage(page);
    setFetching(true);
  };

  // содержимое компонента <Pagination>
  const pages: any = [];
  for (let page = 1; page <= totalPages; page++) {
    pages.push(
      <Pagination.Item
        key={page}
        active={page === currentPage}
        activeLabel=""
        onClick={() => handlePageClick(page)}
      >
        {page}
      </Pagination.Item>
    );
  }

  const handleUpdateClick = (id: any) => {
    setOrderId(id);
    setShow(true);
  };

  const handleDeleteClick = (id: any) => {
    adminDelete(id)
      .then((data: any) => {
        setChange(!change);
        alert(`Заказ «${data.id}» удален`);
      })
      .catch((error: any) => alert(error.response.data.message));
  };

  useEffect(() => {
    adminGetOne(id)
      .then((data: any) => {
        setOrders(data);
      })
      .finally(() => setFetching(false));
  }, [change, id]);

  if (fetching) {
    return <Spinner animation="border" />;
  }

  return (
    <>
      ORD
      <ul>
        <li>
          Дата заказа: {orders.prettyCreatedAt}
          {orders.prettyCreatedAt !== orders.prettyUpdatedAt
            ? ` | Обновлён: ` + orders.prettyUpdatedAt
            : ""}
        </li>
        <li>
          Статус заказа:
          {orders.status === 0 && <span> Новый</span>}
          {orders.status === 1 && <span> В работе</span>}
          {orders.status === 2 && <span> Завершен</span>}
        </li>
      </ul>
      <ul>
        <li>Имя, Фамилия: {orders.name}</li>
        <li>Адрес почты: {orders.email}</li>
        <li>Номер телефона: {orders.phone}</li>
        <li>Адрес доставки: {orders.address}</li>
        <li>Комментарий: {orders.comment}</li>
      </ul>
      {/* Модалка ред.Заказа */}
      <UpdateOrder
        id={orderId}
        show={show}
        setShow={setShow}
        setChange={setChange}
      />
      {/* КНП Редакт./Удалить */}
      <Row className="mb-3">
        <Col>
          <Button
            variant="success"
            size="sm"
            onClick={() => handleUpdateClick(orders.id)}
            style={{ marginRight: "15px" }}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(orders.id)}
          >
            Удалить
          </Button>
        </Col>
      </Row>
      {/*  */}
      <Table bordered hover size="sm" className="mt-3 table__eg">
        <thead>
          <tr>
            <th>Название</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {orders.items.map((item: any) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.price * item.quantity}</td>
            </tr>
          ))}
          <tr id="th__eg">
            <td colSpan={3} style={{ fontWeight: "bold" }}>
              Итого
            </td>
            <td style={{ fontWeight: "bold" }}>{orders.amount}</td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default Order;
