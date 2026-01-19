import type { PrismaClient } from '@prisma/client'
import { Client } from '../domain/Client.js'
import { UniqueEntityId } from '../../shared/domain/UniqueEntityId.js'
import type { ClientRepository } from '../domain/ClientRepository.js'
import type { UpdateClientInput } from '../application/types.js'

export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(userId?: string): Promise<Client[]> {
    const clients = await this.prisma.client.findMany({
      where: userId ? { userId } : undefined,
      include: { projects: { select: { id: true } } },
      orderBy: { updatedAt: 'desc' },
    })

    return clients.map((client) =>
      Client.create(
        {
          name: client.name,
          type: client.type,
          contact: client.contact,
          phone: client.phone,
          email: client.email,
          address: client.address,
          inn: client.inn,
          kpp: client.kpp,
          notes: client.notes,
          userId: client.userId,
          projects: client.projects,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        },
        new UniqueEntityId(client.id)
      )
    )
  }

  async findById(id: string): Promise<Client | null> {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        projects: { select: { id: true } },
      },
    })

    if (!client) return null

    return Client.create(
      {
        name: client.name,
        type: client.type,
        contact: client.contact,
        phone: client.phone,
        email: client.email,
        address: client.address,
        inn: client.inn,
        kpp: client.kpp,
        notes: client.notes,
        userId: client.userId,
        projects: client.projects,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
      },
      new UniqueEntityId(client.id)
    )
  }

  async create(client: Client): Promise<Client> {
    const props = client.toJSON()
    const created = await this.prisma.client.create({
      data: {
        id: props.id,
        name: props.name,
        type: props.type,
        contact: props.contact,
        phone: props.phone,
        email: props.email,
        address: props.address,
        inn: props.inn,
        kpp: props.kpp,
        notes: props.notes,
        userId: props.userId,
      },
      include: { projects: { select: { id: true } } },
    })

    return Client.create(
      {
        name: created.name,
        type: created.type,
        contact: created.contact,
        phone: created.phone,
        email: created.email,
        address: created.address,
        inn: created.inn,
        kpp: created.kpp,
        notes: created.notes,
        userId: created.userId,
        projects: created.projects,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      new UniqueEntityId(created.id)
    )
  }

  async update(id: string, data: UpdateClientInput): Promise<Client | null> {
    const existing = await this.prisma.client.findUnique({ where: { id } })
    if (!existing) return null

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        contact: data.contact,
        phone: data.phone,
        email: data.email,
        address: data.address,
        inn: data.inn,
        kpp: data.kpp,
        notes: data.notes,
      },
      include: { projects: { select: { id: true } } },
    })

    return Client.create(
      {
        name: updated.name,
        type: updated.type,
        contact: updated.contact,
        phone: updated.phone,
        email: updated.email,
        address: updated.address,
        inn: updated.inn,
        kpp: updated.kpp,
        notes: updated.notes,
        userId: updated.userId,
        projects: updated.projects,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      new UniqueEntityId(updated.id)
    )
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } })
  }
}
