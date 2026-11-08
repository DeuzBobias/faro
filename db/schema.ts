import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const profiles = sqliteTable('profiles', {
  userId: text('user_id').primaryKey(),
  data: text('data').notNull(),
  updatedAt: text('updated_at').notNull(),
})
export const dailyLogs = sqliteTable('daily_logs', {
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  data: text('data').notNull(),
  updatedAt: text('updated_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.date] })])
export const fasAssessments = sqliteTable('fas_assessments', {
  userId: text('user_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  id: text('id').notNull(),
  answers: text('answers').notNull(),
  score: integer('score').notNull(),
  completedAt: text('completed_at').notNull(),
}, table => [primaryKey({ columns: [table.userId, table.id] })])
