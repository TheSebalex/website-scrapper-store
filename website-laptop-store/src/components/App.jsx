import { useEffect, useState } from "react";
import { Navigation } from "./Navigation.jsx";
import { ProductGrid } from "./ProductGrid.jsx";
import conf from "../config.js";

function App() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      let data = await fetch(conf.endpointUrl + "/products").then((res) =>
        res.json()
      );
      data = data.map((product) => {
        return {
          ...product,
          img: product.img.map((item) => conf.endpointUrl + "/image/" + item),
        };
      });
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <Navigation />
      {loading ? (
        <div className="mt-5 flex justify-center gap-4">
          <box-icon name="loader-alt" animation="spin" rotate="180"></box-icon>
          Cargando productos...
        </div>
      ) : (
        <div className="grid grid-cols-1 w-[90%] mx-auto">
          <ProductGrid products={products} />
        </div>
      )}
    </>
  );
}

export default App;
