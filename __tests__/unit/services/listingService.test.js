import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock the repository before importing listingService
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

jest.unstable_mockModule('../../../src/repositories/listingRepo.js', () => ({
  getAll: mockGetAll,
  getById: mockGetById,
  create: mockCreate,
  update: mockUpdate,
  remove: mockRemove,
}));

// Now import listingService (after mocking)
const {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} = await import('../../../src/services/listingService.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('listingService - getAllListings', () => {
  test('should return all listings with filters', async () => {
    const filter = {
      search: 'textbook',
      category: 'TEXTBOOKS',
      sortBy: 'price',
      sortOrder: 'asc',
      limit: 20,
      offset: 0
    };

    const mockListings = [
      { id: 1, title: 'Math Textbook', price: 50.00, category: 'TEXTBOOKS' },
      { id: 2, title: 'CS Textbook', price: 60.00, category: 'TEXTBOOKS' }
    ];

    mockGetAll.mockResolvedValue(mockListings);

    const result = await getAllListings(filter);

    expect(result).toEqual(mockListings);
    expect(mockGetAll).toHaveBeenCalledWith(filter);
  });

  test('should return empty array if no listings', async () => {
    const filter = { limit: 20, offset: 0 };

    mockGetAll.mockResolvedValue([]);

    const result = await getAllListings(filter);

    expect(result).toEqual([]);
  });

  test('should handle filters with price range', async () => {
    const filter = {
      minPrice: 10.00,
      maxPrice: 50.00,
      sortBy: 'price',
      sortOrder: 'asc',
      limit: 20,
      offset: 0
    };

    const mockListings = [
      { id: 1, title: 'Cheap Item', price: 15.00 },
      { id: 2, title: 'Mid Item', price: 30.00 }
    ];

    mockGetAll.mockResolvedValue(mockListings);

    const result = await getAllListings(filter);

    expect(result).toEqual(mockListings);
    expect(mockGetAll).toHaveBeenCalledWith(filter);
  });
});

describe('listingService - getListingById', () => {
  test('should return listing by ID', async () => {
    const mockListing = {
      id: 1,
      title: 'Test Listing',
      description: 'Test description',
      price: 25.00,
      seller: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      }
    };

    mockGetById.mockResolvedValue(mockListing);

    const result = await getListingById(1);

    expect(result).toEqual(mockListing);
    expect(mockGetById).toHaveBeenCalledWith(1);
  });

  test('should throw 404 error if listing not found', async () => {
    mockGetById.mockResolvedValue(null);

    await expect(getListingById(999)).rejects.toThrow('Listing not found with id 999');

    try {
      await getListingById(999);
    } catch (error) {
      expect(error.status).toBe(404);
      expect(error.message).toContain('999');
    }
  });

  test('should include seller information', async () => {
    const mockListing = {
      id: 1,
      title: 'Item',
      seller: {
        id: 2,
        email: 'seller@student.edu',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    };

    mockGetById.mockResolvedValue(mockListing);

    const result = await getListingById(1);

    expect(result.seller).toBeDefined();
    expect(result.seller.firstName).toBe('Jane');
  });
});

describe('listingService - createListing', () => {
  test('should create listing successfully', async () => {
    const listingData = {
      title: 'New Listing',
      description: 'Description here',
      price: 45.99,
      condition: 'NEW',
      category: 'ELECTRONICS',
      images: ['image1.jpg'],
      sellerId: 1
    };

    const mockCreatedListing = {
      id: 1,
      ...listingData,
      isAvailable: true,
      createdAt: new Date(),
      seller: {
        id: 1,
        firstName: 'Test',
        lastName: 'User'
      }
    };

    mockCreate.mockResolvedValue(mockCreatedListing);

    const result = await createListing(listingData);

    expect(result).toEqual(mockCreatedListing);
    expect(mockCreate).toHaveBeenCalledWith(listingData);
  });

  test('should create listing with empty images array', async () => {
    const listingData = {
      title: 'No Image Listing',
      description: 'Description',
      price: 10.00,
      condition: 'USED',
      category: 'OTHER',
      images: [],
      sellerId: 1
    };

    const mockCreatedListing = {
      id: 2,
      ...listingData
    };

    mockCreate.mockResolvedValue(mockCreatedListing);

    const result = await createListing(listingData);

    expect(result.images).toEqual([]);
  });

  test('should create listing with default isAvailable true', async () => {
    const listingData = {
      title: 'New Listing',
      description: 'Description',
      price: 20.00,
      condition: 'GOOD',
      category: 'TEXTBOOKS',
      sellerId: 1
    };

    const mockCreatedListing = {
      id: 3,
      ...listingData,
      isAvailable: true
    };

    mockCreate.mockResolvedValue(mockCreatedListing);

    const result = await createListing(listingData);

    expect(result.isAvailable).toBe(true);
  });
});

describe('listingService - updateListing', () => {
  test('should update listing successfully', async () => {
    const listingId = 1;
    const updates = {
      title: 'Updated Title',
      price: 35.00
    };

    const mockUpdatedListing = {
      id: 1,
      title: 'Updated Title',
      description: 'Original description',
      price: 35.00,
      condition: 'GOOD',
      category: 'TEXTBOOKS'
    };

    mockUpdate.mockResolvedValue(mockUpdatedListing);

    const result = await updateListing(listingId, updates);

    expect(result).toEqual(mockUpdatedListing);
    expect(mockUpdate).toHaveBeenCalledWith(listingId, updates);
  });

  test('should throw 404 if listing not found during update', async () => {
    const listingId = 999;
    const updates = { title: 'New Title' };

    mockUpdate.mockResolvedValue(null);

    await expect(
      updateListing(listingId, updates)
    ).rejects.toThrow('Listing not found with id 999');

    try {
      await updateListing(listingId, updates);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  test('should update isAvailable status', async () => {
    const listingId = 1;
    const updates = { isAvailable: false };

    const mockUpdatedListing = {
      id: 1,
      title: 'Item',
      isAvailable: false
    };

    mockUpdate.mockResolvedValue(mockUpdatedListing);

    const result = await updateListing(listingId, updates);

    expect(result.isAvailable).toBe(false);
  });

  test('should update multiple fields at once', async () => {
    const listingId = 1;
    const updates = {
      title: 'New Title',
      price: 100.00,
      condition: 'LIKE_NEW',
      description: 'New description'
    };

    const mockUpdatedListing = {
      id: 1,
      ...updates
    };

    mockUpdate.mockResolvedValue(mockUpdatedListing);

    const result = await updateListing(listingId, updates);

    expect(result.title).toBe('New Title');
    expect(result.price).toBe(100.00);
    expect(result.condition).toBe('LIKE_NEW');
  });

  test('should update images array', async () => {
    const listingId = 1;
    const updates = {
      images: ['new1.jpg', 'new2.jpg']
    };

    const mockUpdatedListing = {
      id: 1,
      title: 'Item',
      images: ['new1.jpg', 'new2.jpg']
    };

    mockUpdate.mockResolvedValue(mockUpdatedListing);

    const result = await updateListing(listingId, updates);

    expect(result.images).toEqual(['new1.jpg', 'new2.jpg']);
  });
});

describe('listingService - deleteListing', () => {
  test('should delete listing successfully', async () => {
    const listingId = 1;

    mockRemove.mockResolvedValue({
      id: 1,
      title: 'Deleted Listing'
    });

    await deleteListing(listingId);

    expect(mockRemove).toHaveBeenCalledWith(listingId);
  });

  test('should throw 404 if listing not found during delete', async () => {
    const listingId = 999;

    mockRemove.mockResolvedValue(null);

    await expect(
      deleteListing(listingId)
    ).rejects.toThrow('Listing not found with id 999');

    try {
      await deleteListing(listingId);
    } catch (error) {
      expect(error.status).toBe(404);
    }
  });

  test('should not return anything on successful delete', async () => {
    const listingId = 1;

    mockRemove.mockResolvedValue({ id: 1 });

    const result = await deleteListing(listingId);

    expect(result).toBeUndefined();
  });
});