import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import $ from 'transform-ts'
import { MapViewer } from '../../components/mapViewer'
import { MAPS } from '../../constants/maps'

const Map: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  name,
  url,
}) => {
  return (
    <div>
      <h1>
        <a href="/">EFT</a>
      </h1>
      <h2>{name}</h2>
      <MapViewer url={url} name={name} height="80vh" />
    </div>
  )
}

export default Map

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { map } = $.obj({ map: $.string }).transformOrThrow(params)

  return { props: MAPS.find((m) => m.name === map)! }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = MAPS.map((map) => `/maps/${encodeURIComponent(map.name)}`)

  return { paths, fallback: false }
}
