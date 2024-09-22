export function Product({ title, description, price, img }) {
  console.log(img)
  return (
    <div className="md:h-[27rem] h-20rem card flex flex-col relative overflow-clip pb-9">
      <img className="img" src={Array.isArray(img) ? img[0] : img} alt="" />
      <div className="text flex-grow">
        <h2 className="h3 leading-none mb-2">{title}</h2>
        <p className="p leading-tight flex-1">
          {description.slice(0, 200).replace(/(<([^>]+)>)/gi, "")}
          {description.length > 200 ? "..." : ""}
        </p>
        <h3
          className="font-medium font-sans text-lg absolute bottom-0 
        h-[1.5em] right-0 pr-2 pl-3 rounded-tl-full bg-indigo-600 text-white">
          $ {price}
        </h3>
      </div>
    </div>
  );
}
