import DataLoader from 'dataloader'

import { getCollection } from './helpers'
import { Document, Collection } from 'mongoose'

// https://github.com/graphql/dataloader#batch-function
const orderDocs = (ids: string[]) => (docs: Document[]) => {
  const idMap: {
    [_id: string]: Document
  } = {}
  docs.forEach(doc => {
    idMap[doc._id] = doc
  })
  return ids.map(id => idMap[id])
}

export const createCachingMethods = ({
  collection,
  cache
}: {
  collection: Collection
  cache: any
}) => {
  const loader = new DataLoader<string, any>(ids =>
    collection
      .find({ _id: { $in: ids } })
      .toArray()
      .then(orderDocs(ids))
  )

  const cachePrefix = `mongo-${getCollection(collection).collectionName}-`

  const methods = {
    findOneById: async (id: string, { ttl }: { ttl?: number } = {}) => {
      const key = cachePrefix + id

      const cacheDoc = await cache.get(key)
      if (cacheDoc) {
        return JSON.parse(cacheDoc)
      }

      const doc = await loader.load(id)
      if (Number.isInteger(ttl as any)) {
        // https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-caching#apollo-server-caching
        cache.set(key, JSON.stringify(doc), { ttl })
      }

      return doc
    },
    findManyByIds: (ids: string[], { ttl }: { ttl?: number } = {}) => {
      return Promise.all(ids.map(id => methods.findOneById(id, { ttl })))
    },
    deleteFromCacheById: (id: string) => cache.delete(cachePrefix + id)
  }

  return methods
}
