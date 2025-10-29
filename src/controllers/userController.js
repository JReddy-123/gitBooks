import { 
  getAllUsers, 
  getCurrentUser, 
  updateCurrentUser, 
  deleteCurrentUser, 
  getCurrentUserListings,
  updateUserRole 
} from '../services/userService.js';

export async function getAllUsersHandler(req, res, next) {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUserHandler(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateCurrentUserHandler(req, res, next) {
  try {
    const updateData = {};
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.password) updateData.password = req.body.password;
    if (req.body.firstName) updateData.firstName = req.body.firstName;
    if (req.body.lastName) updateData.lastName = req.body.lastName;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    
    const updatedUser = await updateCurrentUser(req.user.id, updateData);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
}

export async function deleteCurrentUserHandler(req, res, next) {
  try {
    await deleteCurrentUser(req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUserListingsHandler(req, res, next) {
  try {
    const listings = await getCurrentUserListings(req.user.id);
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    next(error);
  }
}

export async function updateUserRoleHandler(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id);
    const { role } = req.body;
    
    const updatedUser = await updateUserRole(targetUserId, role);
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
}