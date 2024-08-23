export function Product({ title, description, price, img }) {
  return (
    <div class="md:h-[27rem] h-20rem card flex flex-col relative overflow-clip pb-9">
      <div class="img" style={{ backgroundImage: `url(${Array.isArray(img) ? img[0] : img})` }}></div>
      <div class="text flex-grow">
        <h2 class="h3 leading-none mb-2">{title}</h2>
        <p class="p leading-tight flex-1">
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
