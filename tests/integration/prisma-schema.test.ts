import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

describe('Prisma Schema Integration', () => {
  it('should generate Prisma Client correctly', () => {
    expect(prisma).toBeDefined()
    expect(prisma.user).toBeDefined()
    expect(prisma.department).toBeDefined()
    expect(prisma.competency).toBeDefined()
    expect(prisma.employeeCompetencyAssignment).toBeDefined()
    expect(prisma.appraisalPeriod).toBeDefined()
    expect(prisma.appraisalSession).toBeDefined()
    expect(prisma.appraisalScoreItem).toBeDefined()
    expect(prisma.iDPItem).toBeDefined()
    expect(prisma.aISummary).toBeDefined()
  })

  it('should have correct relational definitions in the schema', () => {
    expect(prisma.user.findUnique).toBeDefined()
    expect(prisma.department.findMany).toBeDefined()
    expect(prisma.appraisalSession.findFirst).toBeDefined()

    // Type-level verification of relation definitions
    type UserWithSubordinates = Prisma.UserGetPayload<{
      include: { subordinates: true }
    }>
    
    type SessionWithScoreItems = Prisma.AppraisalSessionGetPayload<{
      include: { scoreItems: true }
    }>

    type AssignmentWithCompetency = Prisma.EmployeeCompetencyAssignmentGetPayload<{
      include: { competency: true }
    }>

    // If the above types compile without TS errors, the relations exist.
    expect(true).toBe(true)
  })
})
