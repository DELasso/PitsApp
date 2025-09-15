import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersFileService {
    private readonly filePath = join(process.cwd(), 'data', 'users.json');
    private currentId = 1;

    constructor() {
        this.ensureDataDirectory();
        this.loadNextId();
    }

    private ensureDataDirectory(): void {
        const dataDir = join(process.cwd(), 'data');
        if (!existsSync(dataDir)) {
            require('fs').mkdirSync(dataDir, { recursive: true });
        }
    }

    private loadUsers(): User[] {
        if (!existsSync(this.filePath)) {
            return [];
        }

        try {
            const data = readFileSync(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading users file:', error);
            return [];
        }
    }

    private saveUsers(users: User[]): void {
        try {
            writeFileSync(this.filePath, JSON.stringify(users, null, 2), 'utf-8');
            console.log(`✅ Usuarios guardados en: ${this.filePath}`);
        } catch (error) {
            console.error('Error saving users file:', error);
            throw new Error('No se pudo guardar el usuario');
        }
    }

    private loadNextId(): void {
        const users = this.loadUsers();
        if (users.length > 0) {
            const maxId = Math.max(...users.map(u => parseInt(u.id)));
            this.currentId = maxId + 1;
        }
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const users = this.loadUsers();

        // Verificar si el email ya existe
        const existingUser = users.find(user => user.email === createUserDto.email);
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const newUser: User = {
            id: this.currentId.toString(),
            ...createUserDto,
            password: hashedPassword,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.currentId++;
        users.push(newUser);
        this.saveUsers(users);

        console.log(`✅ Usuario registrado: ${newUser.email} (ID: ${newUser.id})`);
        return newUser;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const users = this.loadUsers();
        return users.find(user => user.email === email);
    }

    async findById(id: string): Promise<User | undefined> {
        const users = this.loadUsers();
        return users.find(user => user.id === id);
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async findAll(): Promise<User[]> {
        const users = this.loadUsers();
        return users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as User;
        });
    }

    async findByIdSafe(id: string): Promise<Omit<User, 'password'> | undefined> {
        const user = await this.findById(id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return undefined;
    }
}