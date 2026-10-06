import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/auth.store'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let isRefreshing = false
interface PendingRequest {
  resolve: (accessToken: string) => void
  reject: (error: unknown) => void
}

let pendingQueue: PendingRequest[] = []

function resolveQueue(accessToken: string) {
  pendingQueue.forEach(({ resolve }) => resolve(accessToken))
  pendingQueue = []
}

function rejectQueue(error: unknown) {
  pendingQueue.forEach(({ reject }) => reject(error))
  pendingQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (accessToken) => {
            originalRequest.headers.set('Authorization', `Bearer ${accessToken}`)
            resolve(axiosInstance(originalRequest))
          },
          reject,
        })
      })
    }

    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      useAuthStore.getState().logout()
      return Promise.reject(error)
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        { refreshToken },
      )

      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)

      resolveQueue(data.accessToken)
      originalRequest.headers.set('Authorization', `Bearer ${data.accessToken}`)
      return axiosInstance(originalRequest)
    } catch (refreshError) {
      useAuthStore.getState().logout()
      rejectQueue(refreshError)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default axiosInstance
