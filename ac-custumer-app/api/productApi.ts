import apiClient from './client';

export interface ProductItem {
  _id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  video?: string;
  sellerPhone: string;
  sellerEmail: string;
  createdAt: string;
  brand?: string;
  acType?: string;
  capacity?: string;
  starRating?: string;
  usageDuration?: string;
}

// GET /products
export const getProducts = async (): Promise<ProductItem[]> => {
  const res: any = await apiClient.get('/products');
  return res?.data?.data?.products ?? res?.data?.products ?? res?.products ?? [];
};

// GET /products/:id
export const getProductById = async (id: string): Promise<ProductItem> => {
  const res: any = await apiClient.get(`/products/${id}`);
  return res?.data?.data?.product ?? res?.data?.product ?? res?.product;
};

// POST /products — save Cloudinary URLs to DB
export const createProduct = async (data: {
  title: string;
  price: number;
  description: string;
  images: string[];       // Cloudinary image URLs
  video?: string;         // Cloudinary video URL
  sellerPhone: string;
  sellerEmail: string;
  brand?: string;
  acType?: string;
  capacity?: string;
  starRating?: string;
  usageDuration?: string;
}): Promise<ProductItem> => {
  const res: any = await apiClient.post('/products', data);
  return res?.data?.data?.product ?? res?.data?.product ?? res?.product;
};

// DELETE /products/:id
export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

// PUT /products/:id — update product listing
export const updateProduct = async (id: string, data: {
  title?: string;
  price?: number;
  description?: string;
  images?: string[];
  video?: string;
  sellerPhone?: string;
  brand?: string;
  acType?: string;
  capacity?: string;
  starRating?: string;
  usageDuration?: string;
}): Promise<ProductItem> => {
  const res: any = await apiClient.put(`/products/${id}`, data);
  return res?.data?.data?.product ?? res?.data?.product ?? res?.product;
};
