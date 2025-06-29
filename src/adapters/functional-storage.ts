// 🕉️ Functional Storage - Pure Functions Only
// 🚫 NO CLASSES, NO MUTATIONS, NO SIDE EFFECTS

import { User } from '../schemas/index.js';

// 📋 Types
export type UserStorage = Map<string, User>;
export type StorageState = Readonly<{
  users: UserStorage;
  nextId: number;
}>;

// 🌱 Initial State Creator
export const createEmptyStorage = (): StorageState => ({
  users: new Map(),
  nextId: 1,
});

// 🔍 Pure Query Functions
export const findUserByTelegramId = (
  storage: StorageState,
  telegramId: number
): User | undefined => {
  return Array.from(storage.users.values()).find(
    user => user.telegram_id === telegramId
  );
};

export const findUserById = (
  storage: StorageState,
  id: string
): User | undefined => {
  return storage.users.get(id);
};

export const getAllUsers = (storage: StorageState): ReadonlyArray<User> => {
  return Array.from(storage.users.values());
};

// ✨ Pure State Transformation Functions
export const addUser = (
  storage: StorageState,
  userData: Omit<User, 'id' | 'created_at' | 'updated_at'>
): [StorageState, User] => {
  const now = new Date();
  const newUser: User = {
    id: `user_${storage.nextId}`,
    ...userData,
    subscription_level: userData.subscription_level || 'free',
    last_active_at: userData.last_active_at || now,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  const newUsers = new Map(storage.users);
  newUsers.set(newUser.id, newUser);

  const newStorage: StorageState = {
    users: newUsers,
    nextId: storage.nextId + 1,
  };

  return [newStorage, newUser];
};

export const updateUser = (
  storage: StorageState,
  id: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): StorageState | null => {
  const existingUser = storage.users.get(id);
  if (!existingUser) {
    return null;
  }

  const updatedUser: User = {
    ...existingUser,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const newUsers = new Map(storage.users);
  newUsers.set(id, updatedUser);

  return {
    ...storage,
    users: newUsers,
  };
};

export const removeUser = (
  storage: StorageState,
  id: string
): StorageState | null => {
  if (!storage.users.has(id)) {
    return null;
  }

  const newUsers = new Map(storage.users);
  newUsers.delete(id);

  return {
    ...storage,
    users: newUsers,
  };
};

// 📊 Pure Analytics Functions
export const getUserCount = (storage: StorageState): number => {
  return storage.users.size;
};

export const getUsersCreatedAfter = (
  storage: StorageState,
  date: Date
): ReadonlyArray<User> => {
  return Array.from(storage.users.values()).filter(
    user => new Date(user.created_at) > date
  );
};

export const getUsersByUsername = (
  storage: StorageState,
  usernamePattern: string
): ReadonlyArray<User> => {
  const pattern = usernamePattern.toLowerCase();
  return Array.from(storage.users.values()).filter(
    user =>
      user.username?.toLowerCase().includes(pattern) ||
      user.first_name?.toLowerCase().includes(pattern) ||
      user.last_name?.toLowerCase().includes(pattern)
  );
};

// 🔄 Storage State Manager (Pure Function)
export type StorageManager = {
  readonly state: StorageState;
  readonly updateState: (newState: StorageState) => StorageManager;
};

export const createStorageManager = (
  initialState: StorageState = createEmptyStorage()
): StorageManager => ({
  state: initialState,
  updateState: (newState: StorageState) => createStorageManager(newState),
});

// 🎯 High-Level Operations (Compose pure functions)
export const createUserIfNotExists = (
  storage: StorageState,
  telegramId: number,
  userData: Omit<User, 'id' | 'telegram_id' | 'created_at' | 'updated_at'>
): [StorageState, User] => {
  const existingUser = findUserByTelegramId(storage, telegramId);

  if (existingUser) {
    return [storage, existingUser];
  }

  return addUser(storage, { ...userData, telegram_id: telegramId });
};

// 🧪 Testing Utilities
export const createTestUser = (
  telegramId: number = 12345,
  overrides: Partial<User> = {}
): Omit<User, 'id' | 'created_at' | 'updated_at'> => ({
  telegram_id: telegramId,
  username: 'test_user',
  first_name: 'Test',
  last_name: 'User',
  subscription_level: 'free',
  last_active_at: new Date(),
  ...overrides,
});

export const createTestStorage = (users: User[] = []): StorageState => {
  const userMap = new Map(users.map(user => [user.id, user]));
  const maxId = users.length > 0 ? users.length : 0;

  return {
    users: userMap,
    nextId: maxId + 1,
  };
};

// 🕉️ Sacred Export - All Pure Functions
export const FunctionalStorage = {
  // State Creators
  createEmptyStorage,
  createStorageManager,
  createTestStorage,
  createTestUser,

  // Queries
  findUserByTelegramId,
  findUserById,
  getAllUsers,
  getUserCount,
  getUsersCreatedAfter,
  getUsersByUsername,

  // Transformations
  addUser,
  updateUser,
  removeUser,
  createUserIfNotExists,
} as const;

export default FunctionalStorage;
