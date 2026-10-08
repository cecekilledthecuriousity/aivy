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

  // Periode Penilaian Contoh
  const period = await prisma.appraisalPeriod.upsert({
    where: { id: 'period-q4-2026' },
    update: {},
    create: {
      id: 'period-q4-2026',
      name: 'Siklus Penilaian Kinerja Q4 2026',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  })

  // Sesi Evaluasi Contoh (PUBLISHED agar dapat dilihat di portal karyawan)
  const session = await prisma.appraisalSession.upsert({
    where: {
      periodId_employeeId: {
        periodId: period.id,
        employeeId: developer.id,
      },
    },
    update: {},
    create: {
      id: 'session-demo-01',
      periodId: period.id,
      employeeId: developer.id,
      evaluatorId: manager.id,
      status: 'PUBLISHED',
      managerNotes: 'Kinerja teknis secara umum sangat solid. Perlu pendalaman pada perancangan arsitektur sistem skala besar.',
      hrNotes: 'Disetujui. Rekomendasi pelatihan IDP telah diselaraskan dengan budget L&D.',
      submittedAt: new Date('2026-10-05T09:00:00Z'),
      approvedAt: new Date('2026-10-06T14:30:00Z'),
      publishedAt: new Date('2026-10-07T10:00:00Z'),
    },
  })

  // Skor Evaluasi Contoh
  const scoreData = [
    { compId: compIntegrity.id, standard: 3, actual: 3, gap: 0, label: 'Sesuai standar jabatan.' },
    { compId: compComm.id, standard: 3, actual: 4, gap: 1, label: 'Melampaui standar jabatan.' },
    { compId: compProbSolving.id, standard: 4, actual: 3, gap: -1, label: 'Memerlukan peningkatan kompetensi.' },
    { compId: compSysDesign.id, standard: 3, actual: 2, gap: -1, label: 'Memerlukan peningkatan kompetensi.' },
  ]

  for (const s of scoreData) {
    await prisma.appraisalScoreItem.upsert({
      where: {
        sessionId_competencyId: {
          sessionId: session.id,
          competencyId: s.compId,
        },
      },
      update: {},
      create: {
        sessionId: session.id,
        competencyId: s.compId,
        standardLevel: s.standard,
        actualLevel: s.actual,
        gapValue: s.gap,
        gapLabel: s.label,
        managerComment: `Evaluasi kompetensi ${s.gap >= 0 ? 'memenuhi/melampaui' : 'membutuhkan pembinaan'}.`,
      },
    })
  }

  // IDP Item Contoh untuk kompetensi yang memiliki gap negatif
  await prisma.iDPItem.createMany({
    data: [
      {
        sessionId: session.id,
        competencyId: compProbSolving.id,
        actionPlan: 'Workshop Algoritma Lanjutan & Distributed Systems',
        targetDate: new Date('2026-11-30'),
        status: 'IN_PROGRESS',
      },
      {
        sessionId: session.id,
        competencyId: compSysDesign.id,
        actionPlan: 'Mentoring 1-on-1 dengan Principal Architect untuk High-Level Design',
        targetDate: new Date('2026-12-15'),
        status: 'PLANNED',
      },
    ],
  }).catch(() => {})

  // Ringkasan AI Contoh
  await prisma.aISummary.upsert({
    where: { sessionId: session.id },
    update: {},
    create: {
      sessionId: session.id,
      overviewNarrative: 'Software Developer menunjukkan integritas dan kapabilitas komunikasi yang melampaui ekspektasi. Fokus pengembangan selanjutnya adalah penguatan kemandirian pemecahan masalah kompleks dan perancangan arsitektur sistem.',
      topStrengthsJson: JSON.stringify(['Komunikasi Tim', 'Integritas & Etika Kerja']),
      growthAreasJson: JSON.stringify(['Problem Solving Arsitektur', 'System Design Skala Besar']),
      actionRecommendationsJson: JSON.stringify([
        'Ikuti sertifikasi cloud architecture',
        'Libatkan dalam review RFC arsitektur sistem',
      ]),
    },
  })

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
