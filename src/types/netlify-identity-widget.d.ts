declare module 'netlify-identity-widget' {
  type IdentityUser = {
    email?: string
    user_metadata?: { full_name?: string }
    jwt(): Promise<string>
  }
  type AuthTab = 'login' | 'signup' | 'recovery' | 'confirmation'
  type IdentityWidget = {
    init(options?: Record<string, unknown>): void
    open(tab?: AuthTab): void
    close(): void
    logout(): void
    currentUser(): IdentityUser | null
    on(event: 'init', callback: (user: IdentityUser | null) => void): void
    on(event: 'login', callback: (user: IdentityUser) => void): void
    off(event: 'init', callback: (user: IdentityUser | null) => void): void
    off(event: 'login', callback: (user: IdentityUser) => void): void
  }
  const netlifyIdentity: IdentityWidget
  export default netlifyIdentity
}
