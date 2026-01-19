export class DomainError extends Error {
  public readonly code: string

  constructor(message: string, code = 'DOMAIN_ERROR') {
    super(message)
    this.code = code
    this.name = 'DomainError'
  }
}
