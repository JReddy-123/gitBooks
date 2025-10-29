import express from 'express';
import { 
  getAllUsersHandler, 
  getCurrentUserHandler, 
  updateCurrentUserHandler, 
  deleteCurrentUserHandler, 
  getCurrentUserListingsHandler,
  updateUserRoleHandler
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';
import { validateUpdateUser, validateUserId, validateUserRole } from '../middleware/userValidators.js';

const router = express.Router();

router.get('/', authenticate, authorizeRoles('ADMIN'), getAllUsersHandler);
router.get('/me', authenticate, getCurrentUserHandler);
router.put('/me', authenticate, validateUpdateUser, updateCurrentUserHandler);
router.delete('/me', authenticate, deleteCurrentUserHandler);
router.get('/me/listings', authenticate, getCurrentUserListingsHandler);
router.patch('/:id/role', authenticate, authorizeRoles('ADMIN'), validateUserId, validateUserRole, updateUserRoleHandler);

export default router;