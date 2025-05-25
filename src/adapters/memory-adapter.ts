import { StorageAdapter } from "./storage-adapter";
import {
  User,
  UserSchema,
  UserSettings,
  UserSettingsSchema,
  SceneState,
  SceneStateSchema,
  ActivityLog,
  ActivityLogSchema,
  NotificationSettings,
  NotificationSettingsSchema,
} from "../schemas";
import { randomUUID } from "crypto"; // Для генерации UUID
import { SessionData } from "../bot"; // Импортируем SessionData из bot.ts
// import { Note } from "../schemas"; // Для примера с заметками
import { logger, LogType } from "../utils/logger";

/**
 * Реализация StorageAdapter, хранящая все данные в памяти
 *
 * Используется для разработки и тестирования.
 * НЕ рекомендуется для продакшн, так как данные теряются при перезапуске бота.
 */
export class MemoryAdapter implements StorageAdapter {
  private users: User[] = [];
  private userSettings: UserSettings[] = [];
  private sceneStates: SceneState[] = [];
  private activityLogs: ActivityLog[] = [];
  private notificationSettings: NotificationSettings[] = [];
  private sessions: Map<string, SessionData> = new Map(); // Хранилище для сессий
  // private notes: Note[] = []; // Для примера с заметками
  // private userIdCounter = 1; // Больше не нужен, используем UUID
  // private noteIdCounter = 1; // Для примера с заметками

  async initialize(): Promise<void> {
    logger.info("MemoryAdapter initialized");
  }

  async close(): Promise<void> {
    logger.info("MemoryAdapter closed");
  }

  // --- SessionStore<SessionData> implementation ---
  async get(key: string): Promise<SessionData | undefined> {
    logger.debug(`MemoryAdapter: get session for key ${key}`);
    return this.sessions.get(key);
  }

  async set(key: string, session: SessionData): Promise<void> {
    logger.debug(`MemoryAdapter: set session for key ${key}`);
    this.sessions.set(key, session);
  }

  async delete(key: string): Promise<void> {
    logger.debug(`MemoryAdapter: delete session for key ${key}`);
    this.sessions.delete(key);
  }
  // --- End of SessionStore<SessionData> implementation ---

  // --- User methods ---
  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    const user = this.users.find((u) => u.telegram_id === telegramId);
    return user ? { ...user } : null;
  }

  async getUserById(userId: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === userId);
    return user ? { ...user } : null;
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    const newUser: User = {
      id: randomUUID(),
      telegram_id: userData.telegram_id || 0, // Должен быть предоставлен
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      language_code: userData.language_code,
      is_bot: userData.is_bot,
      subscription_level: userData.subscription_level || "free",
      last_active_at: userData.last_active_at || new Date(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const parsedUser = UserSchema.safeParse(newUser);
    if (!parsedUser.success) {
      logger.error("MemoryAdapter: createUser validation failed", {
        error: parsedUser.error,
        type: LogType.ERROR,
      });
      return null;
    }

    this.users.push(parsedUser.data);
    logger.debug(
      `[MemoryAdapter] User created: ${parsedUser.data.id} for telegram_id ${parsedUser.data.telegram_id}`
    );
    return parsedUser.data;
  }

  async updateUser(
    telegramId: number,
    userData: Partial<User>
  ): Promise<User | null> {
    const userIndex = this.users.findIndex((u) => u.telegram_id === telegramId);
    if (userIndex === -1) {
      logger.warn(`[MemoryAdapter] User not found for update: ${telegramId}`);
      return null;
    }
    const updatedUser = {
      ...this.users[userIndex],
      ...userData,
      updated_at: new Date().toISOString(),
    };

    const parsedUser = UserSchema.safeParse(updatedUser);
    if (!parsedUser.success) {
      logger.error("MemoryAdapter: updateUser validation failed", {
        error: parsedUser.error,
        type: LogType.ERROR,
      });
      return null;
    }

    this.users[userIndex] = parsedUser.data;
    logger.debug(`[MemoryAdapter] User updated: ${parsedUser.data.id}`);
    return parsedUser.data;
  }

  // --- User Settings methods ---
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = this.userSettings.find((s) => s.user_id === userId);
    return settings ? { ...settings } : null;
  }

  async createUserSettings(
    userId: string,
    settings: Partial<UserSettings> = {}
  ): Promise<UserSettings | null> {
    const existingSettings = await this.getUserSettings(userId);
    if (existingSettings) {
      return this.updateUserSettings(userId, settings);
    }

    const newSettings: UserSettings = {
      id: this.userSettings.length + 1,
      user_id: userId,
      setting_key: settings.setting_key || "default",
      setting_value: settings.setting_value || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const parsedSettings = UserSettingsSchema.safeParse(newSettings);
    if (!parsedSettings.success) {
      logger.error("MemoryAdapter: createUserSettings validation failed", {
        error: parsedSettings.error,
        type: LogType.ERROR,
      });
      return null;
    }

    this.userSettings.push(parsedSettings.data);
    logger.debug(`[MemoryAdapter] UserSettings created for user: ${userId}`);
    return parsedSettings.data;
  }

  async updateUserSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<UserSettings | null> {
    const settingIndex = this.userSettings.findIndex(
      (s) => s.user_id === userId
    );
    if (settingIndex === -1) {
      return this.createUserSettings(userId, settings);
    }

    const updatedSettings = {
      ...this.userSettings[settingIndex],
      ...settings,
      updated_at: new Date().toISOString(),
    };

    const parsedSettings = UserSettingsSchema.safeParse(updatedSettings);
    if (!parsedSettings.success) {
      logger.error("MemoryAdapter: updateUserSettings validation failed", {
        error: parsedSettings.error,
        type: LogType.ERROR,
      });
      return null;
    }

    this.userSettings[settingIndex] = parsedSettings.data;
    logger.debug(`[MemoryAdapter] UserSettings updated for user: ${userId}`);
    return parsedSettings.data;
  }

  // --- Scene State methods ---
  async getSceneState(
    userId: string,
    sceneId: string
  ): Promise<SceneState | null> {
    const state = this.sceneStates.find(
      (s) => s.user_id === userId && s.scene_id === sceneId
    );
    return state ? { ...state } : null;
  }

  async saveSceneState(
    userId: string,
    sceneId: string,
    stateData: any
  ): Promise<SceneState | null> {
    const stateIndex = this.sceneStates.findIndex(
      (s) => s.user_id === userId && s.scene_id === sceneId
    );

    if (stateIndex === -1) {
      // Create new state
      const newState: SceneState = {
        id: this.sceneStates.length + 1,
        user_id: userId,
        scene_id: sceneId,
        state_data: stateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const parsedState = SceneStateSchema.safeParse(newState);
      if (!parsedState.success) {
        logger.error(
          "MemoryAdapter: saveSceneState (create) validation failed",
          {
            error: parsedState.error,
            type: LogType.ERROR,
          }
        );
        return null;
      }

      this.sceneStates.push(parsedState.data);
      logger.debug(
        `[MemoryAdapter] SceneState created for user: ${userId}, scene: ${sceneId}`
      );
      return parsedState.data;
    } else {
      // Update existing state
      const updatedState = {
        ...this.sceneStates[stateIndex],
        state_data: stateData,
        updated_at: new Date().toISOString(),
      };

      const parsedState = SceneStateSchema.safeParse(updatedState);
      if (!parsedState.success) {
        logger.error(
          "MemoryAdapter: saveSceneState (update) validation failed",
          {
            error: parsedState.error,
            type: LogType.ERROR,
          }
        );
        return null;
      }

      this.sceneStates[stateIndex] = parsedState.data;
      logger.debug(
        `[MemoryAdapter] SceneState updated for user: ${userId}, scene: ${sceneId}`
      );
      return parsedState.data;
    }
  }

  async deleteSceneState(userId: string, sceneId: string): Promise<boolean> {
    const stateIndex = this.sceneStates.findIndex(
      (s) => s.user_id === userId && s.scene_id === sceneId
    );
    if (stateIndex === -1) {
      return false;
    }

    this.sceneStates.splice(stateIndex, 1);
    logger.debug(
      `[MemoryAdapter] SceneState deleted for user: ${userId}, scene: ${sceneId}`
    );
    return true;
  }

  // --- Activity Log methods ---
  async logActivity(log: Partial<ActivityLog>): Promise<ActivityLog | null> {
    const newLog: ActivityLog = {
      id: this.activityLogs.length + 1,
      user_id: log.user_id,
      action_type: log.action_type || "unknown",
      action_details: log.action_details || {},
      performed_at: log.performed_at || new Date().toISOString(),
      ip_address: log.ip_address,
      created_at: new Date().toISOString(),
    };

    const parsedLog = ActivityLogSchema.safeParse(newLog);
    if (!parsedLog.success) {
      logger.error("MemoryAdapter: logActivity validation failed", {
        error: parsedLog.error,
        type: LogType.ERROR,
      });
      return null;
    }

    this.activityLogs.push(parsedLog.data);
    logger.debug(
      `[MemoryAdapter] Activity logged: ${parsedLog.data.action_type}`
    );
    return parsedLog.data;
  }

  async getActivityLogs(
    userId: string,
    limit: number = 100
  ): Promise<ActivityLog[]> {
    return this.activityLogs
      .filter((log) => log.user_id === userId)
      .sort((a, b) => {
        // Sort by performed_at in descending order
        return (
          new Date(b.performed_at).getTime() -
          new Date(a.performed_at).getTime()
        );
      })
      .slice(0, limit);
  }

  // --- Utility method for custom queries ---
  async executeQuery(query: string, _params?: any[]): Promise<any> {
    logger.warn(
      `[MemoryAdapter] executeQuery called with query: ${query}. This is a no-op in MemoryAdapter.`,
      { type: LogType.SYSTEM }
    );
    return null; // No-op for memory adapter
  }

  // --- Notification Settings methods ---
  async getNotificationSettings(
    userId: string
  ): Promise<NotificationSettings | null> {
    const settings = this.notificationSettings.find(
      (s) => s.user_id === userId
    );
    return settings ? { ...settings } : null;
  }

  async createNotificationSettings(
    userId: string,
    settings?: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> {
    const existingSettings = await this.getNotificationSettings(userId);
    if (existingSettings) {
      // Если настройки уже существуют, обновляем их
      if (!settings || Object.keys(settings).length === 0)
        return existingSettings;
      return this.updateNotificationSettings(userId, settings);
    }

    // Создание новых настроек с добавлением id, что требуется для NotificationSettings
    const defaultSettings: NotificationSettings = {
      user_id: userId,
      enabled: true,
      daily_summary: false,
      language: "ru",
      custom_settings: settings?.custom_settings || {},
      ...(settings || {}), // применяем переданные настройки поверх дефолтных
    };

    // Валидация через Zod schema
    const parsedSettings =
      NotificationSettingsSchema.safeParse(defaultSettings);
    if (!parsedSettings.success) {
      logger.error(
        "MemoryAdapter: createNotificationSettings validation failed",
        {
          error: parsedSettings.error,
          type: LogType.ERROR,
        }
      );
      return null;
    }

    this.notificationSettings.push(parsedSettings.data);
    return { ...parsedSettings.data };
  }

  async updateNotificationSettings(
    userId: string,
    settingsUpdate: Partial<NotificationSettings>
  ): Promise<NotificationSettings | null> {
    const settingsIndex = this.notificationSettings.findIndex(
      (s) => s.user_id === userId
    );
    if (settingsIndex === -1) {
      // Если настроек нет, создаем их с переданными обновлениями
      return this.createNotificationSettings(userId, settingsUpdate);
    }

    const updatedSettingsData = {
      ...this.notificationSettings[settingsIndex],
      ...settingsUpdate,
    };

    const parsedSettings =
      NotificationSettingsSchema.safeParse(updatedSettingsData);
    if (!parsedSettings.success) {
      logger.error(
        "MemoryAdapter: updateNotificationSettings validation failed",
        {
          error: parsedSettings.error,
          type: LogType.ERROR,
        }
      );
      return null;
    }

    this.notificationSettings[settingsIndex] = parsedSettings.data;
    return { ...parsedSettings.data };
  }

  // --- Example methods for a "Notes" feature ---
  // async getNoteById(noteId: string, userId: number): Promise<Note | null> {
  //   const note = this.notes.find(n => n.id === noteId && n.userId === userId);
  //   return note || null;
  // }

  // async getNotesByUser(userId: number): Promise<Note[]> {
  //   return this.notes.filter(n => n.userId === userId);
  // }

  // async createNote(noteData: Partial<Note>, userId: number): Promise<Note | null> {
  //   if (!noteData.title) {
  //     throw new Error("Title is required for a note");
  //   }
  //   const newNote: Note = {
  //     id: (this.noteIdCounter++).toString(),
  //     userId,
  //     title: noteData.title,
  //     content: noteData.content || "",
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //   };
  //   this.notes.push(newNote);
  //   return newNote;
  // }

  // async updateNote(noteId: string, noteData: Partial<Note>, userId: number): Promise<Note | null> {
  //   const noteIndex = this.notes.findIndex(n => n.id === noteId && n.userId === userId);
  //   if (noteIndex === -1) {
  //     return null;
  //   }
  //   this.notes[noteIndex] = {
  //     ...this.notes[noteIndex],
  //     ...noteData,
  //     updatedAt: new Date().toISOString()
  //   };
  //   return this.notes[noteIndex];
  // }

  // async deleteNote(noteId: string, userId: number): Promise<boolean> {
  //   const noteIndex = this.notes.findIndex(n => n.id === noteId && n.userId === userId);
  //   if (noteIndex === -1) {
  //     return false;
  //   }
  //   this.notes.splice(noteIndex, 1);
  //   return true;
  // }
}
