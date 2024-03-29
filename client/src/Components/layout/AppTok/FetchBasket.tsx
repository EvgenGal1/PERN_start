// ^ HOC-компонент (Компонент высшего порядка).
// Когда пользователь только зашел на сайт — надо запросить с сервера его корзину, если она существует. И показывать в главном меню ссылку на корзину + количество позиций в ней. Для этого создадим HOC-компонент FetchBasket.js и обернем в него ссылку на корзину.
import { useContext, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";

import { AppContext } from "./AppContext";
import { fetchBasket } from "../../../http/Tok/basketAPI_Tok";

const FetchBasket = (props: any) => {
  const { basket }: any = useContext(AppContext);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchBasket()
      .then((data) => (basket.products = data.products))
      .finally(() => setFetching(false));
  }, []);

  if (fetching) {
    return <Spinner animation="border" variant="light" />;
  }

  return props.children;
};

export default FetchBasket;
