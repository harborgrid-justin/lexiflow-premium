
import { CreateUserDto } from './src/types/dto';

const user: CreateUserDto = {
    email: 'test@example.com',
    password: 'password',
    firstName: 'Test',
    lastName: 'User',
    role: 'Associate' // This should be valid if UserRole is imported correctly
};

console.log('CreateUserDto imported successfully');
