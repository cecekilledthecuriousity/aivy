import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Departemen contoh: "Technology", "People Operations"
  const techDept = await prisma.department.upsert({
    where: { code: 'TECH' },
    update: {},
    create: {
      name: 'Technology',
      code: 'TECH',
    },
  })

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: {
      name: 'People Operations',
      code: 'HR',
    },
  })

  // User akun
  const passwordHash = await bcrypt.hash('password123', 10)

  const hrAdmin = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      name: 'HR Admin',
      passwordHash,
      role: Role.HR_ADMIN,
      jobTitle: 'HR Manager',
      employeeCode: 'HR-001',
      departmentId: hrDept.id,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@company.com' },
    update: {},
    create: {
      email: 'manager@company.com',
      name: 'Tech Manager',
      passwordHash,
      role: Role.MANAGER,
      jobTitle: 'Engineering Manager',
      employeeCode: 'TECH-M-001',
      departmentId: techDept.id,
    },
  })

  const developer = await prisma.user.upsert({
    where: { email: 'developer@company.com' },
    update: {},
    create: {
      email: 'developer@company.com',
      name: 'Software Developer',
      passwordHash,
      role: Role.EMPLOYEE,
      jobTitle: 'Software Engineer',
      employeeCode: 'TECH-E-001',
      departmentId: techDept.id,
      managerId: manager.id,
    },
  })

  // Kompetensi
  const compIntegrity = await prisma.competency.upsert({
    where: { code: 'CORE-01' },
    update: {},
    create: {
      code: 'CORE-01',
      name: 'Integritas',
      category: 'Core',
      description: 'Menjaga integritas dan kejujuran dalam bekerja.',
    },
  })

  const compComm = await prisma.competency.upsert({
    where: { code: 'CORE-02' },
    update: {},
    create: {
      code: 'CORE-02',
      name: 'Komunikasi',
      category: 'Core',
      description: 'Kemampuan komunikasi efektif.',
    },
  })

  const compProbSolving = await prisma.competency.upsert({
    where: { code: 'TECH-01' },
    update: {},
    create: {
      code: 'TECH-01',
      name: 'Problem Solving',
      category: 'Technical',
      description: 'Mampu memecahkan masalah teknis kompleks.',
    },
  })

  const compSysDesign = await prisma.competency.upsert({
    where: { code: 'TECH-02' },
    update: {},
    create: {
      code: 'TECH-02',
      name: 'System Design',
      category: 'Technical',
      description: 'Merancang arsitektur sistem.',
    },
  })

  const compMentoring = await prisma.competency.upsert({
    where: { code: 'LEAD-01' },
    update: {},
    create: {
      code: 'LEAD-01',
      name: 'Team Mentoring',
      category: 'Leadership',
      description: 'Membimbing anggota tim junior.',
    },
  })

  // Assign kompetensi
  const competencies = [
    { comp: compIntegrity, level: 3 },
    { comp: compComm, level: 3 },
    { comp: compProbSolving, level: 4 },
    { comp: compSysDesign, level: 3 },
  ]

  for (const c of competencies) {
    await prisma.employeeCompetencyAssignment.upsert({
      where: {
        userId_competencyId: {
          userId: developer.id,
          competencyId: c.comp.id,
        },
      },
      update: {},
      create: {
        userId: developer.id,
        competencyId: c.comp.id,
        standardLevel: c.level,
      },
    })
  }

  console.log('Database seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
