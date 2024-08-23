import { useState } from "react";
import { Product } from "./product";

export function ProductGrid({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);

  const search = query => {
    let fil = products.filter(product => {
      return query.split(" ").every(itm => {
        return product.title
          .toLowerCase()
          .includes(
            (itm !== "" ? " " : "") +
              itm.toLowerCase() +
              (itm !== "" ? " " : "")
          );
      });
    });

    if (fil.length === 0)
      fil = products.filter(product => {
        return query.split(" ").every(itm => {
          return product.title.toLowerCase().includes(itm.toLowerCase());
        });
      });

    setFilteredProducts(fil);
  };

  return (
    <div>
      <div className="w-[98%] mx-auto mb-10">
        <label>
          <span className="text-xs relative left-4 text-gray-400">Buscar:</span>
          <input
            onChange={e => search(e.target.value)}
            type="text"
            placeholder="Escriba aqui los terminos de busqueda"
            className="rounded-lg border-gray-300 border min-w-0 w-full outline-none px-4 h-[2.2rem]"
          />
        </label>
      </div>
      <div className="grid">
        <h2 className="text-sm ml-2 mb-2 text-gray-400">
          Mostrando: {filteredProducts.length}
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-14 mb-10">
          {filteredProducts.flat().map((product, i) => (
            <Product key={i} {...product} />
          ))}
        </ul>
      </div>
    </div>
  );
}
