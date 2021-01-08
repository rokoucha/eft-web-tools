import type { NextPage } from 'next'
import { MAPS } from '../constants/maps'

const HomePage: NextPage = () => {
  return (
    <div>
      <h1>
        <a href="/">EFT</a>
      </h1>
      <h2>Maps</h2>
      <ul>
        {MAPS.map(({ name }) => (
          <li key={name}>
            <a href={`/maps/${encodeURIComponent(name)}`}>{name}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomePage
