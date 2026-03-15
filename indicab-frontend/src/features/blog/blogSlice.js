import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as blogApi from './blogApi';

const isDevelopment = import.meta.env.DEV;

// Mock fallback blog data for development
const mockPublishedBlogs = [
  {
    id: 1,
    title: 'Safe Intercity Travels in 2025',
    content: 'Full content of the blog post...',
    excerpt: 'Tips for ensuring your intercity journey is safe and comfortable.',
    author: 'Admin',
    category: 'Safety',
    imageUrl: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    createdAt: '2025-02-10 10:00:00',
    status: 'PUBLISHED'
  },
  {
    id: 2,
    title: 'Top 10 Weekend Getaways Near Mumbai',
    content: 'Full content of the blog post...',
    excerpt: 'Explore the best weekend escapes around Mumbai.',
    author: 'Admin',
    category: 'Travel',
    imageUrl: 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    createdAt: '2025-02-12 11:30:00',
    status: 'PUBLISHED'
  },
  {
    id: 3,
    title: 'Future of Ride Sharing in India',
    content: 'Full content of the blog post...',
    excerpt: 'Trends that will shape the future of ride sharing apps in India.',
    author: 'Admin',
    category: 'Future',
    imageUrl: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    createdAt: '2025-02-15 09:15:00',
    status: 'PUBLISHED'
  }
];

// Async Thunks
export const fetchPublishedBlogs = createAsyncThunk(
  'blog/fetchPublished',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogApi.fetchPublishedBlogsApi(params);
      return response.data?.content || response.data || (isDevelopment ? mockPublishedBlogs : []);
    } catch (error) {
      console.warn('Failed to fetch published blogs:', error.message);
      return isDevelopment ? mockPublishedBlogs : [];
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blog/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogApi.fetchBlogByIdApi(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

const initialState = {
  publishedBlogs: [],
  currentBlog: null,
  loading: false,
  error: null,
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublishedBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedBlogs = action.payload;
      })
      .addCase(fetchPublishedBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default blogSlice.reducer;
