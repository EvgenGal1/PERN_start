// ^ Модальное окно с формой добавления Характеристик Товара
import { useState } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";

const CreateProperties = (props: any) => {
  const { properties, setProperties } = props;

  const append = () => {
    setProperties([...properties, { name: "", value: "", number: Date.now() }]);
  };
  const remove = (number: any) => {
    setProperties(properties.filter((item: any) => item.number !== number));
  };
  const change = (key: any, value: any, number: any) => {
    setProperties(
      properties.map((item: any) =>
        item.number === number ? { ...item, [key]: value } : item
      )
    );
  };

  return (
    <>
      <h5>Характеристики</h5>
      <Button
        onClick={append}
        variant="outline-primary"
        size="sm"
        className="btn-primary__eg mb-2"
      >
        Добавить
      </Button>
      {properties.map((item: any) => (
        <Row key={item.number} className="mb-2">
          <Col>
            <Form.Control
              name={"name_" + item.number}
              value={item.name}
              onChange={(e) => change("name", e.target.value, item.number)}
              placeholder="Название..."
              size="sm"
            />
          </Col>
          <Col>
            <Form.Control
              name={"value_" + item.number}
              value={item.value}
              onChange={(e) => change("value", e.target.value, item.number)}
              placeholder="Значение..."
              size="sm"
            />
          </Col>
          <Col>
            <Button
              onClick={() => remove(item.number)}
              size="sm"
              variant="outline-danger"
              className="btn-primary__eg danger"
            >
              Удалить
            </Button>
          </Col>
        </Row>
      ))}
    </>
  );
};

export default CreateProperties;
