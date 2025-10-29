import { getListingById } from '../services/listingService.js';

export async function authorizeOwnership(req, res, next) {
  try {
    const listingId = parseInt(req.params.id);
    const listing = await getListingById(listingId);
    
    if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      const error = new Error('Forbidden: insufficient permission');
      error.status = 403;
      throw error;
    }
    return next();
  } catch (error) {
    next(error);
  }
}