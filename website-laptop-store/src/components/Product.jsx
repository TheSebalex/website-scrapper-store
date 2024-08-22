export function Product({ title, description, price, img }) {
  return (
    <div class="card">
      <div class="img" style={{ backgroundImage: `url(${img})` }}></div>
      <div class="text">
        <h2 class="h3">{title}</h2>
        <p class="p max-h-[8em] text-pretty truncate">{description}...</p>
        <h3 className="font-medium font-sans w-[90%] text-lg mx-auto text-right">$ {price}</h3>
      </div>
    </div>
  );
}
