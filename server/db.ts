export interface Statement {
  bind(...values: unknown[]): Statement
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{results:T[]}>
  run(): Promise<unknown>
}
export interface Database {
  prepare(sql: string): Statement
  batch(statements: Statement[]): Promise<unknown[]>
}
export interface Env { DB: Database; ASSETS: { fetch(request: Request): Promise<Response> }; notifyGuidance?: (id:string)=>Promise<{accepted:number;failed:number}> }
export function database(env: Env) {
  if (!env.DB) throw new Error('Database binding unavailable')
  return env.DB
}
