// API設定
export const API_CONFIG = {
  baseURL: 'http://localhost:5000',
};

/**
 * APIのURLを構築する関数
 * @param path APIのパス
 * @returns 完全なAPIのURL
 */
export const buildApiUrl = (path: string): string => {
  return `${API_CONFIG.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * fetchのラッパー関数
 * @param path APIのパス
 * @param options fetchのオプション
 * @returns fetchのPromise
 */
export const apiFetch = (path: string, options?: RequestInit): Promise<Response> => {
  return fetch(buildApiUrl(path), options);
};