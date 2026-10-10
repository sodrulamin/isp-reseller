const API_BASE_URL = '/api';

export const apiClient = {
  async request(endpoint, options = {}) {
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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('isp_auth_token');
      localStorage.removeItem('isp_auth_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
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
