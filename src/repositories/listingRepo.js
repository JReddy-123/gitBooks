import prisma from '../config/db.js';

export async function getAll(filter) {
  const conditions = { isAvailable: true };

  if (filter.search) {
    conditions.OR = [
      { title: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  if (filter.category) {
    conditions.category = filter.category;
  }

  if (filter.condition) {
    conditions.condition = filter.condition;
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    conditions.price = {};
    if (filter.minPrice !== undefined) conditions.price.gte = filter.minPrice;
    if (filter.maxPrice !== undefined) conditions.price.lte = filter.maxPrice;
  }

  const listings = await prisma.listing.findMany({
    where: conditions,
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    },
    orderBy: { [filter.sortBy]: filter.sortOrder },
    take: filter.limit,
    skip: filter.offset,
  });

  return listings;
}

export async function getById(id) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        }
      }
    }
  });
  return listing;
}

export async function create(listing) {
  const newListing = await prisma.listing.create({
    data: listing,
    include: {
      seller: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        }
      }
    }
  });
  return newListing;
}

export async function update(id, updates) {
  try {
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updates,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    return updatedListing;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

export async function remove(id) {
  try {
    const deletedListing = await prisma.listing.delete({
      where: { id },
    });
    return deletedListing;
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}
