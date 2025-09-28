import { users, getNextId } from "../db/users.js";

export function create(userData) {
    const { email, password, first_name, last_name, phone } = userData;
    const now = new Date().toISOString();
    
    const newUser = {
        id: getNextId(),
        email,
        password,
        first_name,
        last_name,
        phone: phone || null,
        profile_image: null,
        is_active: true,
        created_at: now,
        updated_at: now
    };
    
    users.push(newUser);
    
    // Return user without password for security
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

export function findByEmail(email) {
    return users.find(user => user.email === email && user.is_active === true);
}

export function findById(id) {
    const user = users.find(user => user.id === id && user.is_active === true);
    if (user) {
        // Return user without password for security
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

export function update(id, updateData) {
    const index = users.findIndex(user => user.id === id && user.is_active === true);
    
    if (index !== -1) {
        const updatedUser = {
            ...users[index],
            ...updateData,
            updated_at: new Date().toISOString()
        };
        
        users[index] = updatedUser;
        
        // Return user without password for security
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    
    return null;
}