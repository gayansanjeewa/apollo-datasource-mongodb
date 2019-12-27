import { DataSource } from 'apollo-datasource'
import { ApolloError } from 'apollo-server-errors'
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching'

import { createCachingMethods } from './cache'
import { isCollectionOrModel, isModel } from './helpers'
import { Collection, Model, Document } from 'mongoose'

abstract class MongoDataSource<
  T extends Document,
  TContext = any
> extends DataSource {
  collection: Collection
  context?: TContext
  model?: Model<T>
  constructor(collection: Collection | Model<T>) {
    super()

    if (!isCollectionOrModel(collection)) {
      throw new ApolloError(
        'MongoDataSource constructor must be given a collection or Mongoose model'
      )
    }

    if (isModel(collection)) {
      this.model = collection as Model<T>
      this.collection = this.model.collection
    } else {
      this.collection = collection as Collection
    }
  }

  // https://github.com/apollographql/apollo-server/blob/master/packages/apollo-datasource/src/index.ts
  initialize({
    context,
    cache
  }: { context?: TContext; cache?: KeyValueCache } = {}) {
    this.context = context

    const methods = createCachingMethods({
      collection: this.collection,
      cache: cache || new InMemoryLRUCache()
    })

    Object.assign(this, methods)
  }
}

export { MongoDataSource }
