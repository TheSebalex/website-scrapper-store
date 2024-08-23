import { data } from "../json.js";
import { Navigation } from "./Navigation.jsx";
import { ProductGrid } from "./ProductGrid.jsx";

function App() {
  return (
    <>
      <Navigation/>
      <div className="grid md:grid-cols-[30%_70%] grid-cols-1 w-[90%] mx-auto">
        <div></div>
        <ProductGrid products={data.flat()} />
      </div>
    </>
  );
}

export default App;
