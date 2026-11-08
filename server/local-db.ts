// Development and integration tests only. This module is never included in the Worker.
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Database, Statement } from './db'
export function sqliteDatabase(filename: string): Database & { close():void } {
  const sqlite = new DatabaseSync(filename)
  sqlite.exec('PRAGMA foreign_keys = ON')
  sqlite.exec('CREATE TABLE IF NOT EXISTS _local_migrations (name TEXT PRIMARY KEY)')
  for (const name of readdirSync(resolve('drizzle')).filter(f=>f.endsWith('.sql')).sort()) {
    if (sqlite.prepare('SELECT name FROM _local_migrations WHERE name = ?').get(name)) continue
    sqlite.exec('BEGIN')
    try {sqlite.exec(readFileSync(resolve('drizzle',name),'utf8'));sqlite.prepare('INSERT INTO _local_migrations VALUES (?)').run(name);sqlite.exec('COMMIT')}catch(e){sqlite.exec('ROLLBACK');throw e}
  }
  function prepare(sql:string):Statement {
    let values: (string|number|null)[]=[]
    return {
      bind(...args:unknown[]){values=args as typeof values;return this},
      async first<T>(){return (sqlite.prepare(sql).get(...values)||null) as T|null},
      async all<T>(){return {results:sqlite.prepare(sql).all(...values) as T[]}},
      async run(){return sqlite.prepare(sql).run(...values)},
    }
  }
  return {prepare,async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());sqlite.exec('COMMIT');return results}catch(e){sqlite.exec('ROLLBACK');throw e}},close(){sqlite.close()}}
}
