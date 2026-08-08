const Product = require('../models/Product');
const asyncWrapper = require('../middleware/asyncWrapper');
const { sendSuccess, sendError } = require('../utils/responseUtils');

// POST /api/v1/products — Create a new product listing
const createProduct = asyncWrapper(async (req, res) => {
  const { title, price, description, images, video, sellerPhone, sellerEmail, brand, acType, capacity, starRating, usageDuration } = req.body;

  if (!title || !price || !description || !sellerPhone || !sellerEmail) {
    return sendError(res, 400, 'Title, price, description, seller phone and email are required');
  }
  if (!images || images.length === 0) {
    return sendError(res, 400, 'At least one image URL is required');
  }

  const product = await Product.create({
    title,
    price: Number(price),
    description,
    images,       // Array of Cloudinary image URLs
    video,        // Cloudinary video URL (optional)
    sellerPhone,
    sellerEmail,
    brand: brand || '',
    acType: acType || '',
    capacity: capacity || '',
    starRating: starRating || '',
    usageDuration: usageDuration || '',
  });

  return sendSuccess(res, 201, 'Product listed successfully', { product });
});

// GET /api/v1/products — Get all product listings
const getProducts = asyncWrapper(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Products fetched', { count: products.length, products });
});

// GET /api/v1/products/:id — Get single product
const getProductById = asyncWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 404, 'Product not found');
  return sendSuccess(res, 200, 'Product fetched', { product });
});

// DELETE /api/v1/products/:id — Delete a product
const deleteProduct = asyncWrapper(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 404, 'Product not found');

  if (product.sellerEmail !== req.user.email && req.user.role !== 'admin') {
    return sendError(res, 403, 'You are not authorized to delete this product listing');
  }

  await product.deleteOne();
  return sendSuccess(res, 200, 'Product deleted successfully');
});

// PUT /api/v1/products/:id — Update a product listing
const updateProduct = asyncWrapper(async (req, res) => {
  const { title, price, description, images, video, sellerPhone, brand, acType, capacity, starRating, usageDuration } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 404, 'Product not found');

  if (product.sellerEmail !== req.user.email && req.user.role !== 'admin') {
    return sendError(res, 403, 'You are not authorized to edit this product listing');
  }

  if (title) product.title = title;
  if (price) product.price = Number(price);
  if (description) product.description = description;
  if (images) product.images = images;
  if (video !== undefined) product.video = video;
  if (sellerPhone) product.sellerPhone = sellerPhone;
  if (brand !== undefined) product.brand = brand;
  if (acType !== undefined) product.acType = acType;
  if (capacity !== undefined) product.capacity = capacity;
  if (starRating !== undefined) product.starRating = starRating;
  if (usageDuration !== undefined) product.usageDuration = usageDuration;

  await product.save();
  return sendSuccess(res, 200, 'Product updated successfully', { product });
});

module.exports = { createProduct, getProducts, getProductById, deleteProduct, updateProduct };
