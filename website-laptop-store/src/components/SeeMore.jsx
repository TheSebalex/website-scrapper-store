import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";

export async function seeMoreAsync(product) {
  return await new Promise((resolve) => {
    const div = document.createElement("div");
    const root = ReactDOM.createRoot(div);
    document.body.appendChild(div);
    root.render(
      <SeeMore
        product={product}
        resolve={() => {
          resolve();
          root.unmount();
          div.remove();
        }}
      />
    );
  });
}

function SeeMore({ product, resolve }) {
  const [curr, setCurr] = useState(0);
  const [css, setCss] = useState("opacity-0");
  const [displayImg, setDisplayImg] = useState(false);

  const moveImage = (dir) => {
    setCurr((x) => {
      if (!product.img[x + dir]) return x;
      else return x + dir;
    });
  };

  const displayFullImage = () => {
    setDisplayImg(!displayImg);
  };

  const close = () => {
    setCss("opacity-0");
    setTimeout(() => resolve(), 160);
  };

  useEffect(() => {
    setTimeout(() => setCss("opacity-100"), 1);

    document.body.onkeydown = (e) => {
      if (e.key === "ArrowLeft") moveImage(-1);
      if (e.key === "ArrowRight") moveImage(1);
      if (e.key === "Escape") close();
    };

    return () => (document.body.onkeydown = null);
  }, []);

  return (
    <div
      className={
        "w-full h-full allscreen bg-black/50 z-40 flex items-center justify-center transition-all " +
        css
      }
    >
      {displayImg && (
        <>
          <img
            onClick={displayFullImage}
            className="bg-black/80 backdrop-blur-sm allscreen cursor-pointer object-contain z-50"
            src={Array.isArray(product.img) ? product.img[curr] : product.img}
          />
        </>
      )}
      <div className="bg-white w-[90vw] border-8 border-white overflow-auto sm:w-[90%] h-[95vh] sm:h-[90vh] min-h-[20rem] rounded-lg p-5 sm:p-10 flex relative">
        <button onClick={close} className="absolute top-0 right-0">
          <box-icon name="x" color="black"></box-icon>
        </button>
        <div className="w-max sm:grid sm:grid-cols-2 sm:grid-rows-1 sm:gap-8">
          <div className="flex flex-col">
            <img
              onClick={displayFullImage}
              className="cursor-pointer w-full max-h-[35vh] sm:max-h-[90%] sm:h-full object-contain rounded-lg bg-slate-400"
              src={Array.isArray(product.img) ? product.img[curr] : product.img}
              alt=""
            />

            <div className="flex my-2 justify-around [&_button]:flex [&_button]:items-center [&_button]:text-lg leading-none items-center [&_button]:font-black [&_button]:px-4">
              <button onClick={() => moveImage(-1)}>
                <box-icon name="left-arrow-alt"></box-icon>
              </button>
              <p className="text-sm">
                {curr + 1}/{product.img.length}
              </p>
              <button onClick={() => moveImage(1)}>
                <box-icon name="right-arrow-alt"></box-icon>
              </button>
            </div>
          </div>
          <div className="pt-10 pb-5 flex flex-col">
            <h2 className="leading-none text-xl font-bold">{product.title}</h2>
            <div className="mt-6 flex justify-between items-center">
              <h3 className="font-bold text-2xl text-emerald-600 flex items-center gap-1">
                <box-icon name="dollar"></box-icon>
                {product.price}
              </h3>
              <button className="[&_div]:hover:scale-110 [&_span]:hover:translate-x-1 [&_div]:hover:rotate-[20deg] text-md bg-indigo-400 rounded-lg px-4 py-2 flex justify-center items-center gap-2 text-white font-medium">
                <div className="transition-all m-auto flex">
                  <box-icon
                    name="cart-alt"
                    type="solid"
                    color="white"
                  ></box-icon>
                </div>
                <span className="flex m-auto transition-all">Comprar</span>
              </button>
            </div>
            <hr className="my-4" />
            <p className="p leading-tight sm:max-h-max">
              {product.description ?? "Sin descripcion"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
