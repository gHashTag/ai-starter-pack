// 🧪 Tests for Functional Storage
// 🕉️ Pure function testing with no side effects

import { describe, it, expect } from 'vitest';
import {
  FunctionalStorage,
  createEmptyStorage,
  addUser,
  findUserByTelegramId,
  findUserById,
  getAllUsers,
  updateUser,
  removeUser,
  createUserIfNotExists,
  getUserCount,
  createTestUser,
  createTestStorage,
} from '../../../adapters/functional-storage.js';

describe('🕉️ Functional Storage - Pure Functions', () => {
  describe('🌱 State Creation', () => {
    it('should create empty storage', () => {
      const storage = createEmptyStorage();

      expect(storage.users.size).toBe(0);
      expect(storage.nextId).toBe(1);
    });

    it('should create test storage with users', () => {
      const testUsers = [
        {
          id: 'user_1',
          telegram_id: 123,
          username: 'user1',
          first_name: 'Test',
          last_name: 'One',
          subscription_level: 'free',
          last_active_at: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'user_2',
          telegram_id: 456,
          username: 'user2',
          first_name: 'Test',
          last_name: 'Two',
          subscription_level: 'free',
          last_active_at: new Date(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const storage = createTestStorage(testUsers);

      expect(storage.users.size).toBe(2);
      expect(storage.nextId).toBe(3);
    });

    it('should create test user with defaults', () => {
      const userData = createTestUser();

      expect(userData.telegram_id).toBe(12345);
      expect(userData.username).toBe('test_user');
      expect(userData.first_name).toBe('Test');
      expect(userData.last_name).toBe('User');
      expect(userData.subscription_level).toBe('free');
    });

    it('should create test user with overrides', () => {
      const userData = createTestUser(99999, {
        username: 'custom_user',
        first_name: 'Custom',
      });

      expect(userData.telegram_id).toBe(99999);
      expect(userData.username).toBe('custom_user');
      expect(userData.first_name).toBe('Custom');
      expect(userData.last_name).toBe('User'); // default preserved
    });
  });

  describe('👤 User Operations', () => {
    it('should add user and return new state', () => {
      const storage = createEmptyStorage();
      const userData = createTestUser();

      const [newStorage, newUser] = addUser(storage, userData);

      // Original storage unchanged (immutability)
      expect(storage.users.size).toBe(0);

      // New storage has user
      expect(newStorage.users.size).toBe(1);
      expect(newStorage.nextId).toBe(2);

      // User created correctly
      expect(newUser.id).toBe('user_1');
      expect(newUser.telegram_id).toBe(userData.telegram_id);
      expect(typeof newUser.created_at).toBe('string');
      expect(typeof newUser.updated_at).toBe('string');
    });

    it('should find user by telegram ID', () => {
      const userData = createTestUser(12345);
      const [storage] = addUser(createEmptyStorage(), userData);

      const found = findUserByTelegramId(storage, 12345);
      const notFound = findUserByTelegramId(storage, 99999);

      expect(found?.telegram_id).toBe(12345);
      expect(notFound).toBeUndefined();
    });

    it('should find user by ID', () => {
      const userData = createTestUser();
      const [storage, user] = addUser(createEmptyStorage(), userData);

      const found = findUserById(storage, user.id);
      const notFound = findUserById(storage, 'user_999');

      expect(found?.id).toBe(user.id);
      expect(notFound).toBeUndefined();
    });

    it('should get all users', () => {
      let storage = createEmptyStorage();

      const [storage1] = addUser(storage, createTestUser(111));
      const [storage2] = addUser(storage1, createTestUser(222));

      const users = getAllUsers(storage2);

      expect(users).toHaveLength(2);
      expect(users[0].telegram_id).toBe(111);
      expect(users[1].telegram_id).toBe(222);
    });

    it('should update user', async () => {
      const userData = createTestUser();
      const [storage, user] = addUser(createEmptyStorage(), userData);

      // Добавляем минимальную задержку чтобы updated_at точно изменился
      await new Promise(resolve => setTimeout(resolve, 1));

      const updatedStorage = updateUser(storage, user.id, {
        username: 'updated_user',
        first_name: 'Updated',
      });

      expect(updatedStorage).not.toBeNull();

      const updatedUser = findUserById(updatedStorage!, user.id);

      expect(updatedUser?.username).toBe('updated_user');
      expect(updatedUser?.first_name).toBe('Updated');
      expect(updatedUser?.last_name).toBe('User'); // unchanged
      expect(updatedUser?.updated_at).not.toEqual(user.updated_at);
      // Дополнительно проверяем что время действительно больше
      expect(new Date(updatedUser?.updated_at || '').getTime()).toBeGreaterThan(
        new Date(user.updated_at).getTime()
      );
    });

    it('should return null when updating non-existent user', () => {
      const storage = createEmptyStorage();

      const result = updateUser(storage, 'user_999', { username: 'test' });

      expect(result).toBeNull();
    });

    it('should remove user', () => {
      const userData = createTestUser();
      const [storage, user] = addUser(createEmptyStorage(), userData);

      const removedStorage = removeUser(storage, user.id);

      expect(removedStorage).not.toBeNull();
      expect(removedStorage!.users.size).toBe(0);
      expect(findUserById(removedStorage!, user.id)).toBeUndefined();
    });

    it('should return null when removing non-existent user', () => {
      const storage = createEmptyStorage();

      const result = removeUser(storage, 'user_999');

      expect(result).toBeNull();
    });
  });

  describe('🎯 High-Level Operations', () => {
    it('should create user if not exists - new user', () => {
      const storage = createEmptyStorage();
      const userData = createTestUser();

      const [newStorage, user] = createUserIfNotExists(
        storage,
        userData.telegram_id,
        {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          subscription_level: 'free',
          last_active_at: new Date(),
        }
      );

      expect(newStorage.users.size).toBe(1);
      expect(user.telegram_id).toBe(userData.telegram_id);
      expect(user.id).toBe('user_1');
    });

    it('should create user if not exists - existing user', () => {
      const userData = createTestUser();
      const [storage, existingUser] = addUser(createEmptyStorage(), userData);

      const [newStorage, user] = createUserIfNotExists(
        storage,
        userData.telegram_id,
        {
          username: 'different_name',
          first_name: 'Different',
          last_name: 'Name',
          subscription_level: 'free',
          last_active_at: new Date(),
        }
      );

      // Storage unchanged
      expect(newStorage).toBe(storage);
      expect(newStorage.users.size).toBe(1);

      // Existing user returned (not created)
      expect(user.id).toBe(existingUser.id);
      expect(user.username).toBe(existingUser.username); // original preserved
    });
  });

  describe('📊 Analytics Functions', () => {
    it('should count users', () => {
      let storage = createEmptyStorage();

      expect(getUserCount(storage)).toBe(0);

      const [storage1] = addUser(storage, createTestUser(111));
      const [storage2] = addUser(storage1, createTestUser(222));

      expect(getUserCount(storage2)).toBe(2);
    });

    it('should filter users created after date', () => {
      const storage = createEmptyStorage();
      const pastDate = new Date('2020-01-01');
      const futureDate = new Date('2030-01-01');

      const [storageWithUser] = addUser(storage, createTestUser());

      const recentUsers = FunctionalStorage.getUsersCreatedAfter(
        storageWithUser,
        pastDate
      );
      const noUsers = FunctionalStorage.getUsersCreatedAfter(
        storageWithUser,
        futureDate
      );

      expect(recentUsers).toHaveLength(1);
      expect(noUsers).toHaveLength(0);
    });

    it('should search users by username pattern', () => {
      let storage = createEmptyStorage();

      const [storage1] = addUser(
        storage,
        createTestUser(111, {
          username: 'john_doe',
          first_name: 'John',
          last_name: 'Smith',
        })
      );
      const [storage2] = addUser(
        storage1,
        createTestUser(222, {
          username: 'jane_smith',
          first_name: 'Jane',
          last_name: 'Doe',
        })
      );
      const [storage3] = addUser(
        storage2,
        createTestUser(333, {
          username: 'bob_jones',
          first_name: 'Bob',
          last_name: 'Johnson',
        })
      );

      const johnUsers = FunctionalStorage.getUsersByUsername(storage3, 'john');
      const jUsers = FunctionalStorage.getUsersByUsername(storage3, 'j');
      const noUsers = FunctionalStorage.getUsersByUsername(storage3, 'xyz');

      // Поиск "john" найдет:
      // 1. john_doe (username содержит "john")
      // 2. bob_jones (last_name "Johnson" содержит "john")
      expect(johnUsers).toHaveLength(2);
      expect(johnUsers.some(u => u.username === 'john_doe')).toBe(true);
      expect(johnUsers.some(u => u.last_name === 'Johnson')).toBe(true);

      expect(jUsers).toHaveLength(3); // john, jane и bob_jones (все содержат "j")
      expect(noUsers).toHaveLength(0);
    });
  });

  describe('🔄 Storage Manager', () => {
    it('should create storage manager', () => {
      const manager = FunctionalStorage.createStorageManager();

      expect(manager.state.users.size).toBe(0);
      expect(manager.state.nextId).toBe(1);
      expect(typeof manager.updateState).toBe('function');
    });

    it('should update storage manager state', () => {
      const manager = FunctionalStorage.createStorageManager();
      const userData = createTestUser();

      const [newState] = addUser(manager.state, userData);
      const newManager = manager.updateState(newState);

      // Original manager unchanged
      expect(manager.state.users.size).toBe(0);

      // New manager has updated state
      expect(newManager.state.users.size).toBe(1);
    });
  });

  describe('🧘‍♂️ Immutability & Purity', () => {
    it('should not mutate original state in add operation', () => {
      const originalStorage = createEmptyStorage();
      const originalUsersSize = originalStorage.users.size;
      const originalNextId = originalStorage.nextId;

      addUser(originalStorage, createTestUser());

      // Original unchanged
      expect(originalStorage.users.size).toBe(originalUsersSize);
      expect(originalStorage.nextId).toBe(originalNextId);
    });

    it('should not mutate original state in update operation', () => {
      const userData = createTestUser();
      const [originalStorage, user] = addUser(createEmptyStorage(), userData);
      const originalUser = findUserById(originalStorage, user.id)!;
      const originalUsername = originalUser.username;

      updateUser(originalStorage, user.id, { username: 'changed' });

      // Original unchanged
      const stillOriginalUser = findUserById(originalStorage, user.id)!;
      expect(stillOriginalUser.username).toBe(originalUsername);
    });

    it('should return consistent results (referential transparency)', () => {
      const storage = createEmptyStorage();
      const userData = createTestUser();

      // Same input, same output
      const [result1] = addUser(storage, userData);
      const [result2] = addUser(storage, userData);

      expect(result1.users.size).toBe(result2.users.size);
      expect(result1.nextId).toBe(result2.nextId);

      const user1 = Array.from(result1.users.values())[0];
      const user2 = Array.from(result2.users.values())[0];

      expect(user1.id).toBe(user2.id);
      expect(user1.telegram_id).toBe(user2.telegram_id);
      expect(user1.username).toBe(user2.username);
    });
  });
});

// 🕉️ Sacred Export for Test Utils
export const FunctionalStorageTestUtils = {
  createEmptyStorage,
  createTestUser,
  createTestStorage,
  addUser,
  findUserByTelegramId,
} as const;
