import axios from 'axios';

export const API_BASE_URL = import.meta.env.REACT_APP_API_URL || '/api';

const normalizeUrl = (path) => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/api')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

const isInternalUrl = (url = '') => !/^https?:\/\//i.test(url) || url.startsWith(window.location.origin);

const getAuthToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const normalizeError = (error) => {
  const status = error.response?.status || error.status || 0;
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'So\'rovni bajarishda xatolik yuz berdi';

  return {
    success: false,
    status,
    message,
    data: error.response?.data?.data || null,
    errors: error.response?.data?.errors || null,
    response: error.response,
    originalError: error,
  };
};

axios.interceptors.request.use((config) => {
  const nextConfig = { ...config };
  nextConfig.headers = nextConfig.headers || {};
  nextConfig.url = normalizeUrl(nextConfig.url);

  const token = getAuthToken();
  if (token && isInternalUrl(nextConfig.url) && !nextConfig.headers.Authorization) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  return nextConfig;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error))
);

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    data,
    params,
    headers,
    responseType,
    withCredentials,
  } = options;

  try {
    const response = await axios({
      url: normalizeUrl(path),
      method,
      data,
      params,
      headers,
      responseType,
      withCredentials,
    });

    return response.data;
  } catch (error) {
    return normalizeError(error.originalError ? error.originalError : error);
  }
};

export const apiFetch = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    headers = {},
    params,
    auth = true,
    ...rest
  } = options;

  const url = new URL(normalizeUrl(path), window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const isFormData = body instanceof FormData;
  const requestHeaders = { ...headers };

  if (!isFormData && body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const token = auth ? getAuthToken() : null;
  if (token && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: requestHeaders,
      body: isFormData || typeof body === 'string' ? body : body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        message: payload?.message || payload?.error || response.statusText,
        data: payload?.data || null,
        errors: payload?.errors || null,
      };
    }

    return payload;
  } catch (error) {
    return normalizeError(error);
  }
};

export default axios;
