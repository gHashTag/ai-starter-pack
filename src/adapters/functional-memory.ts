// 🕉️ Functional Memory Adapter - Pure Functions Only
// 🚫 NO CLASSES, NO MUTATIONS, NO SIDE EFFECTS
// ✅ Direct replacement for MemoryAdapter class

import { User } from '../schemas/index.js';
import {
  FunctionalStorage,
  createEmptyStorage,
  createStorageManager,
  type StorageManager,
} from './functional-storage.js';

// 📋 Memory Adapter State
export type MemoryAdapterState = {
  readonly storage: StorageManager;
  readonly initialized: boolean;
  readonly createdAt: Date;
};

// 🌱 Create Memory Adapter
export const createMemoryAdapter = (): MemoryAdapterState => ({
  storage: createStorageManager(createEmptyStorage()),
  initialized: true,
  createdAt: new Date(),
});

// 🔍 Pure Query Functions (Compatible with StorageAdapter interface)
export const getUserByTelegramId = async (
  adapter: MemoryAdapterState,
  telegramId: number
): Promise<User | null> => {
  const user = FunctionalStorage.findUserByTelegramId(
    adapter.storage.state,
    telegramId
  );
  return Promise.resolve(user || null);
};

export const getUserById = async (
  adapter: MemoryAdapterState,
  id: string
): Promise<User | null> => {
  const user = FunctionalStorage.findUserById(adapter.storage.state, id);
  return Promise.resolve(user || null);
};

export const getAllUsers = async (
  adapter: MemoryAdapterState
): Promise<User[]> => {
  const users = FunctionalStorage.getAllUsers(adapter.storage.state);
  return Promise.resolve([...users]);
};

// ✨ Pure State Transformation Functions
export const createUser = async (
  adapter: MemoryAdapterState,
  userData: Partial<User>
): Promise<[MemoryAdapterState, User | null]> => {
  try {
    // Validate required fields
    if (!userData.telegram_id) {
      return [adapter, null];
    }

    // Check if user already exists
    const existingUser = FunctionalStorage.findUserByTelegramId(
      adapter.storage.state,
      userData.telegram_id
    );

    if (existingUser) {
      return [adapter, existingUser];
    }

    // Create user data with defaults
    const userDataWithDefaults = {
      telegram_id: userData.telegram_id,
      username: userData.username || null,
      first_name: userData.first_name || null,
      last_name: userData.last_name || null,
      language_code: userData.language_code || null,
      is_bot: userData.is_bot || false,
      subscription_level: userData.subscription_level || 'free',
      subscription_expires_at: userData.subscription_expires_at || null,
      last_active_at: userData.last_active_at || new Date(),
    };

    const [newStorage, newUser] = FunctionalStorage.addUser(
      adapter.storage.state,
      userDataWithDefaults
    );

    const newAdapter: MemoryAdapterState = {
      ...adapter,
      storage: adapter.storage.updateState(newStorage),
    };

    return [newAdapter, newUser];
  } catch (error) {
    console.error('Error creating user:', error);
    return [adapter, null];
  }
};

export const updateUser = async (
  adapter: MemoryAdapterState,
  id: string,
  updates: Partial<User>
): Promise<[MemoryAdapterState, User | null]> => {
  try {
    const updatedStorage = FunctionalStorage.updateUser(
      adapter.storage.state,
      id,
      updates
    );

    if (!updatedStorage) {
      return [adapter, null];
    }

    const newAdapter: MemoryAdapterState = {
      ...adapter,
      storage: adapter.storage.updateState(updatedStorage),
    };

    const updatedUser = FunctionalStorage.findUserById(updatedStorage, id);
    return [newAdapter, updatedUser || null];
  } catch (error) {
    console.error('Error updating user:', error);
    return [adapter, null];
  }
};

export const deleteUser = async (
  adapter: MemoryAdapterState,
  id: string
): Promise<[MemoryAdapterState, boolean]> => {
  try {
    const updatedStorage = FunctionalStorage.removeUser(
      adapter.storage.state,
      id
    );

    if (!updatedStorage) {
      return [adapter, false];
    }

    const newAdapter: MemoryAdapterState = {
      ...adapter,
      storage: adapter.storage.updateState(updatedStorage),
    };

    return [newAdapter, true];
  } catch (error) {
    console.error('Error deleting user:', error);
    return [adapter, false];
  }
};

// 📊 Analytics Functions
export const getUserCount = async (
  adapter: MemoryAdapterState
): Promise<number> => {
  const count = FunctionalStorage.getUserCount(adapter.storage.state);
  return Promise.resolve(count);
};

export const getUsersCreatedAfter = async (
  adapter: MemoryAdapterState,
  date: Date
): Promise<User[]> => {
  const users = FunctionalStorage.getUsersCreatedAfter(
    adapter.storage.state,
    date
  );
  return Promise.resolve([...users]);
};

export const searchUsersByPattern = async (
  adapter: MemoryAdapterState,
  pattern: string
): Promise<User[]> => {
  const users = FunctionalStorage.getUsersByUsername(
    adapter.storage.state,
    pattern
  );
  return Promise.resolve([...users]);
};

// 🔄 Functional Memory Adapter Factory (Stateful wrapper for compatibility)
export const createFunctionalMemoryAdapter = () => {
  let state = createMemoryAdapter();

  return {
    // Query methods (read-only, no state mutation)
    async getUserByTelegramId(telegramId: number): Promise<User | null> {
      return getUserByTelegramId(state, telegramId);
    },

    async getUserById(id: string): Promise<User | null> {
      return getUserById(state, id);
    },

    async getAllUsers(): Promise<User[]> {
      return getAllUsers(state);
    },

    // Mutation methods (update state internally)
    async createUser(userData: Partial<User>): Promise<User | null> {
      const [newState, user] = await createUser(state, userData);
      state = newState;
      return user;
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
      const [newState, user] = await updateUser(state, id, updates);
      state = newState;
      return user;
    },

    async deleteUser(id: string): Promise<boolean> {
      const [newState, success] = await deleteUser(state, id);
      state = newState;
      return success;
    },

    // Analytics methods
    async getUserCount(): Promise<number> {
      return getUserCount(state);
    },

    async getUsersCreatedAfter(date: Date): Promise<User[]> {
      return getUsersCreatedAfter(state, date);
    },

    async searchUsers(pattern: string): Promise<User[]> {
      return searchUsersByPattern(state, pattern);
    },

    // State introspection (for debugging)
    getState(): MemoryAdapterState {
      return state;
    },

    // Reset state (for testing)
    reset(): void {
      state = createMemoryAdapter();
    },
  };
};

// 🕉️ Sacred Export - Functional Memory Adapter
export const FunctionalMemoryAdapter = {
  // Factory
  createMemoryAdapter,
  createFunctionalMemoryAdapter,

  // Pure Functions
  getUserByTelegramId,
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserCount,
  getUsersCreatedAfter,
  searchUsersByPattern,
} as const;

export default FunctionalMemoryAdapter;
