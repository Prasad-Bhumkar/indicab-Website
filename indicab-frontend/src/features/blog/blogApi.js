import { apiClient } from '../../config/apiConfig';

/**
 * Public Blog API endpoints
 */
export const fetchPublishedBlogsApi = (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.size) queryParams.append('size', params.size);
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiClient.get(`/v1/blogs/published${query}`);
};

export const fetchBlogByIdApi = (id) => {
  return apiClient.get(`/v1/blogs/${id}`);
};
