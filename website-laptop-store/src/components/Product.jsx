import { seeMoreAsync } from "./SeeMore";

export function Product({ title, description, price, img }) {
  return (
    <div
      onClick={() => seeMoreAsync({ title, description, price, img })}
      className="cursor-pointer card flex flex-col relative overflow-clip pb-9">
      <img
        className="img"
        src={Array.isArray(img) ? img[0] : img}
        loading="lazy"
      />
      <div className="text flex-grow">
        <h2 className="h3 leading-none my-2">{title}</h2>
        <h3
          className="font-medium font-sans text-lg absolute bottom-0 
        h-[1.5em] right-0 pr-2 pl-3 rounded-tl-full bg-indigo-600 text-white">
          $ {price}
        </h3>
      </div>
    </div>
  );
}
