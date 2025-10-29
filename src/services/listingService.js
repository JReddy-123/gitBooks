import {
  getAll,
  getById,
  create,
  update,
  remove,
} from '../repositories/listingRepo.js';

export async function getAllListings(filter) {
  return await getAll(filter);
}

export async function getListingById(id) {
  const result = await getById(id);
  if (result) return result;
  
  const error = new Error(`Listing not found with id ${id}`);
  error.status = 404;
  throw error;
}

export async function createListing(data) {
  return await create(data);
}

export async function updateListing(id, data) {
  const updatedListing = await update(id, data);
  if (updatedListing) return updatedListing;
  
  const error = new Error(`Listing not found with id ${id}`);
  error.status = 404;
  throw error;
}

export async function deleteListing(id) {
  const result = await remove(id);
  if (result) return;
  
  const error = new Error(`Listing not found with id ${id}`);
  error.status = 404;
  throw error;
}