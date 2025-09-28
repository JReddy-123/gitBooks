export const users = [
    {
        id: 1,
        email: 'john.doe@student.edu',
        // This is bcrypt hash for 'password123'
        //password: '$2a$10$8K1p/a0dqNhJXFR2wnxmsuJ0JFklbBCHr.LgjR2FHyxOMLOKI2BNq',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        profile_image: null,
        is_active: true,
        created_at: '2025-01-01T12:00:00.000Z',
        updated_at: '2025-01-01T12:00:00.000Z'
    },
    {
        id: 2,
        email: 'jane.smith@student.edu',
        // This is bcrypt hash for 'password456'
        password: '$2a$10$dXJ3SW6G7P2YBKBFbKq3h.Zi2ZKrBd4EZv4BoJTmVWXrqJ1.rELvG',
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+0987654321',
        profile_image: null,
        is_active: true,
        created_at: '2025-01-02T10:30:00.000Z',
        updated_at: '2025-01-02T10:30:00.000Z'
    },
    {
        id: 3,
        email: 'test@test.com',
        // This is bcrypt hash for 'testpass'
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        first_name: 'Test',
        last_name: 'User',
        phone: null,
        profile_image: null,
        is_active: true,
        created_at: '2025-01-03T09:15:00.000Z',
        updated_at: '2025-01-03T09:15:00.000Z'
    }
];

let nextId = users.length + 1;

export function getNextId() {
    return nextId++;
}

export function resetDb() {
    users.length = 0;
    nextId = 1;
}