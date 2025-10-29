import express from 'express';
import {
  validateListingId,
  validateListingQuery,
  validateCreateListing,
  validateUpdateListing,
} from '../middleware/listingValidators.js';

import {
  getAllListingsHandler,
  getListingByIdHandler,
  createListingHandler,
  updateListingHandler,
  deleteListingHandler,
} from '../controllers/listingController.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorizeOwnership } from '../middleware/authorizeOwnership.js';

const router = express.Router();

router.get('/', validateListingQuery, getAllListingsHandler);
router.get('/:id', validateListingId, getListingByIdHandler);
router.post('/', authenticate, validateCreateListing, createListingHandler);
router.put('/:id', validateListingId, authenticate, authorizeOwnership, validateUpdateListing, updateListingHandler);
router.delete('/:id', validateListingId, authenticate, authorizeOwnership, deleteListingHandler);

export default router;
