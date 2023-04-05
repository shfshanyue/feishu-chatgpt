import LRU from 'lru-cache'

// TODO: serverless 对 cache 不太友好
export const cache = new LRU({
  max: 1000,
  maxSize: 50000,
  ttl: 1000 * 60 * 60 * 2,
  sizeCalculation(key, value) {
    return typeof value === 'string' ? value.length : 1
  },
})