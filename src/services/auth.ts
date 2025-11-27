export type UserRole = 'General' | 'Bienes' | 'Biblioteca' | 'Admin';

export interface User {
  username: string;
  password?: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: UserRole;
}

const USERS_KEY = 'colegio_users';
const CURRENT_USER_KEY = 'colegio_current_user';

export const authService = {
  register: (user: User): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersStr = localStorage.getItem(USERS_KEY);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        const existingUser = users.find(u => u.username === user.username || u.email === user.email);
        if (existingUser) {
          reject(new Error('El usuario o correo ya existe.'));
          return;
        }

        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        resolve();
      }, 500); // Simulate network delay
    });
  },

  login: (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const usersStr = localStorage.getItem(USERS_KEY);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword as User);
        } else {
          reject(new Error('Credenciales inválidas.'));
        }
      }, 500);
    });
  },

  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data', e);
      localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(CURRENT_USER_KEY);
  }
};
