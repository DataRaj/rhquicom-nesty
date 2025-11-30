import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('Role', ['User', 'Admin']);

export const users = pgTable(
  'user',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').unique().notNull(),
    displayUsername: text('displayUsername'),
    email: text('email').unique().notNull(),
    isEmailVerified: boolean('isEmailVerified').default(false).notNull(),
    role: roleEnum('role').default('User').notNull(),
    firstName: text('firstName'),
    lastName: text('lastName'),
    image: text('image'),
    bio: text('bio'),
    twoFactorEnabled: boolean('twoFactorEnabled').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      usernameIdx: index('idx_user_username').on(table.username),
      emailIdx: index('idx_user_email').on(table.email),
      deletedAtIdx: index('idx_user_deleted_at').on(table.deletedAt),
    };
  },
);

export const accounts = pgTable(
  'account',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').default('credential').notNull(),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    idToken: text('idToken'),
    password: text('password'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      userIdIdx: index('idx_account_user_id').on(table.userId),
      accountIdIdx: index('idx_account_account_id').on(table.accountId),
    };
  },
);

export const sessions = pgTable(
  'session',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').unique().notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      userIdIdx: index('idx_session_user_id').on(table.userId),
      tokenIdx: index('idx_session_token').on(table.token),
      expiresAtIdx: index('idx_session_expires_at').on(table.expiresAt),
    };
  },
);

export const verifications = pgTable(
  'verification',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      identifierIdx: index('idx_verification_identifier').on(table.identifier),
      expiresAtIdx: index('idx_verification_expires_at').on(table.expiresAt),
    };
  },
);

export const twoFactors = pgTable(
  'twoFactor',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    secret: text('secret'),
    backupCodes: text('backupCodes'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      userIdIdx: index('idx_two_factor_user_id').on(table.userId),
    };
  },
);

export const passKeys = pgTable(
  'passkey',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name'),
    userId: uuid('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    publicKey: text('publicKey').notNull(),
    credentialID: text('credentialID').notNull(),
    counter: integer('counter').notNull(),
    deviceType: text('deviceType').notNull(),
    backedUp: text('backedUp').notNull(),
    transports: text('transports').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => {
    return {
      userIdIdx: index('idx_passkey_user_id').on(table.userId),
      credentialIDIdx: index('idx_passkey_credential_id').on(
        table.credentialID,
      ),
    };
  },
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  twoFactors: many(twoFactors),
  passkeys: many(passKeys),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const twoFactorsRelations = relations(twoFactors, ({ one }) => ({
  user: one(users, {
    fields: [twoFactors.userId],
    references: [users.id],
  }),
}));

export const passKeysRelations = relations(passKeys, ({ one }) => ({
  user: one(users, {
    fields: [passKeys.userId],
    references: [users.id],
  }),
}));
