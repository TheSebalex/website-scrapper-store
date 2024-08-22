import {data} from '../json.js'
import { Product } from './product.jsx'

function App() {

  return (
    <>
    <h1>Laptop Store</h1>  
    <ul className='grid grid-cols-4 gap-y-14'>
      {data.flat().map(product => <Product key={product.id} {...product} />)}
    </ul>
    </>
  )
}

export default App
