import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} from '../services/listingService.js';

export async function getAllListingsHandler(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      condition,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = req.query;

    const filter = {
      search,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      condition,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    const result = await getAllListings(filter);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getListingByIdHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const listing = await getListingById(id);
    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
}

export async function createListingHandler(req, res, next) {
  try {
    const data = {
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      condition: req.body.condition,
      category: req.body.category,
      images: req.body.images || [],
      sellerId: req.user.id,
    };
    const newListing = await createListing(data);
    res.status(201).json({ success: true, data: newListing });
  } catch (error) {
    next(error);
  }
}

export async function updateListingHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updates = {};
    
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description) updates.description = req.body.description;
    if (req.body.price) updates.price = parseFloat(req.body.price);
    if (req.body.condition) updates.condition = req.body.condition;
    if (req.body.category) updates.category = req.body.category;
    if (req.body.images) updates.images = req.body.images;
    if (req.body.isAvailable !== undefined) updates.isAvailable = req.body.isAvailable;

    const updatedListing = await updateListing(id, updates);
    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    next(error);
  }
}

export async function deleteListingHandler(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await deleteListing(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}