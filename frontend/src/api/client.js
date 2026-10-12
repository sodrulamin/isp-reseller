const API_BASE_URL = '/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  localStorage.removeItem('isp_auth_token');
  localStorage.removeItem('isp_refresh_token');
  localStorage.removeItem('isp_auth_user');
  window.dispatchEvent(new Event('auth:unauthorized'));
};

export const apiClient = {
  async request(endpoint, options = {}, isRetry = false) {
    const token = localStorage.getItem('isp_auth_token');
    const workspaceId = localStorage.getItem('isp_active_workspace_id');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (workspaceId) {
      headers['X-Workspace-Id'] = workspaceId;
    }

    const config = {
      ...options,
      headers,
    };

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkErr) {
      throw networkErr;
    }

    // If 401 Unauthorized occurs and this is not a login or refresh request itself
    if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/refresh') && !isRetry) {
      const refreshToken = localStorage.getItem('isp_refresh_token');

      if (!refreshToken) {
        clearAuthAndRedirect();
        throw new Error('Session expired. Please log in again.');
      }

      if (isRefreshing) {
        // Another request is already refreshing the token, queue this request
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          const retryConfig = {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          return this.request(endpoint, retryConfig, true);
        } catch (err) {
          throw err;
        }
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Refresh token invalid or expired');
        }

        const refreshData = await refreshResponse.json();
        const newAccessToken = refreshData.token;
        const newRefreshToken = refreshData.refreshToken;

        localStorage.setItem('isp_auth_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('isp_refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Re-execute the original request with the new access token
        const retryConfig = {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          },
        };
        return this.request(endpoint, retryConfig, true);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        clearAuthAndRedirect();
        throw new Error('Session expired. Please log in again.');
      }
    } else if (response.status === 401 && !isRetry) {
      clearAuthAndRedirect();
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  },

  get(endpoint, params = {}) {
    const url = new URL(`${window.location.origin}${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    return this.request(endpoint + url.search, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${endpoint}?${query}` : endpoint;
    return this.request(url, { method: 'PATCH' });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
