import { and, eq } from 'drizzle-orm'
import { database } from '../../client'
import { NotFoundError } from '../../lib/errors'
import { Result } from '../../lib/Result'
import Transaction, { PromisedResult } from '../../lib/Transaction'
import { projects } from '../../schema'

export async function pingProjectUpdate(
  {
    projectId,
  }: {
    projectId: number
  },
  db = database,
): PromisedResult<undefined, Error> {
  return Transaction.call(async (tx) => {
    const result = (
      await tx
        .update(projects)
        .set({ lastEditedAt: new Date() })
        .where(and(eq(projects.id, projectId)))
        .returning()
    )[0]

    if (!result) {
      return Result.error(new NotFoundError('Project does not exist'))
    }

    return Result.ok(undefined)
  }, db)
}
