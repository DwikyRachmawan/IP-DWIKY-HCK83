import axios from 'axios'

const api = axios.create({
  baseURL: 'http://dwiky.fun', // Adjust port according to your server
  headers: {
    'Content-Type': 'application/json',
  },
})

export const googleLogin = async (idToken) => {
  try {
    const response = await api.post('/auth/google', {
      id_token: idToken
    })
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
