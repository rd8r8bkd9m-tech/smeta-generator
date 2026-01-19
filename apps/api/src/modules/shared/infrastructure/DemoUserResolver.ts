import { getOrCreateDemoUser } from '../../../lib/demoUser.js'
import type { UserResolver } from '../application/UserResolver.js'

export class DemoUserResolver implements UserResolver {
  async resolve(userId?: string | null): Promise<string> {
    return getOrCreateDemoUser(userId ?? undefined)
  }
}
