import { AxiosPromise, AxiosRequestConfig, Method, RejectedFn, ResolvedFn } from '../types'
import dispatchRequest from './dispatchRequest'
import InterceptorManager from './interceptorManager'

interface Interceptors {
  request: InterceptorManager<AxiosRequestConfig>
  response: InterceptorManager<AxiosPromise>
}

interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise)
  rejected?: RejectedFn
}

export default class Axios {
  interceptors: Interceptors

  constructor() {
    this.interceptors = {
      request: new InterceptorManager<AxiosRequestConfig>(),
      response: new InterceptorManager<AxiosPromise>()
    }
  }

  // example1 : axios('/user/12345')
  // example2 : axios({ url: '/user/12345' })
  request(url: any, config?: any): AxiosPromise {
    if (typeof url === 'string') {
      if (!config) {
        config = {}
      }
      config.url = url
    } else {
      config = url
    }

    const chain: PromiseChain<any>[] = [
      {
        resolved: dispatchRequest,
        rejected: undefined
      }
    ]

    // request interceptors
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor)
    })

    // response interceptors
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })

    let promise = Promise.resolve(config)

    while (chain.length) {
      const { resolved, rejected } = chain.shift()!
      promise = promise.then(resolved, rejected)
    }

    return promise
  }

  _requestMethodWithoutData(
    method: Method,
    url: string,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url
      })
    )
  }

  _requestMethodWithData(
    method: Method,
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): AxiosPromise {
    return this.request(
      Object.assign(config || {}, {
        method,
        url,
        data
      })
    )
  }

  get(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('get', url, config)
  }

  delete(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('delete', url, config)
  }

  head(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('head', url, config)
  }

  options(url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithoutData('options', url, config)
  }

  post(url: string, data: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._requestMethodWithData('post', url, data, config)
  }
}
