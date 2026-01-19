export interface UserResolver {
  resolve(userId?: string | null): Promise<string>
}
