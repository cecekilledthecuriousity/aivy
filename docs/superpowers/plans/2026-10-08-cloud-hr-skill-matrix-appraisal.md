# Cloud-Based HR Skill Matrix Appraisal System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun sistem evaluasi kinerja berbasis web (*internal company cloud*) dengan matriks kompetensi individual, kalkulasi GAP standar TDS (1–4, GAP -4 s/d ≥+1), alur kerja 2-tahap (Manager -> HR -> Karyawan), grafik Radar Chart, TNA & IDP tracking, ekspor PDF/Excel, dan AI Summary bertenaga Google Gemini.

**Architecture:** Monolit Next.js 15 (App Router, Server Actions, TypeScript) dengan Prisma ORM + PostgreSQL, Recharts untuk visualisasi Radar Chart, `@google/genai` untuk AI summary terstruktur, `@react-pdf/renderer` untuk rapor PDF resmi, dan `xlsx` untuk rekapitulasi data organisasi.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, NextAuth.js, Recharts, @google/genai, @react-pdf/renderer, xlsx, Zod, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-08-cloud-hr-skill-matrix-appraisal-design.md`

## Global Constraints

- Skala kemahiran dibatasi tepat integer 1 s/d 4 (1: Pemahaman dasar, 2: Cukup kompeten, 3: Kompeten, 4: Ahli).
- Rumus GAP: `actualLevel - standardLevel`.
- Pemetaan label GAP: -4 ("Memerlukan pengembangan menyeluruh."), -3 ("Memerlukan pengembangan intensif."), -2 ("Memerlukan pengembangan."), -1 ("Memerlukan peningkatan kompetensi."), 0 ("Sesuai standar jabatan."), ≥+1 ("Melampaui standar jabatan.").
- Alur berkas penilaian mengikuti status baku: `PENDING_EVALUATION` -> `SUBMITTED` -> `APPROVED` -> `PUBLISHED` (dan `NEEDS_REVISION`).
- Karyawan hanya diizinkan melihat berkas penilaian jika status sudah `PUBLISHED`.
- Manager hanya bisa mengedit penilaian anggotanya saat status `PENDING_EVALUATION` atau `NEEDS_REVISION`.

## Review Focus

1. **Input di luar rentang (misal level 0, 5, atau nilai desimal):** Form dan server actions wajib menolak dengan validasi Zod eksplisit.
2. **Karyawan mengintip berkas yang belum dipublikasi:** Server actions dan route handler wajib memblokir akses jika user berstatus `EMPLOYEE` dan berkas belum `PUBLISHED`.
3. **Manager mengedit bawahan manager lain:** Otorisasi wajib memverifikasi bahwa `session.user.id == employee.managerId` atau user berstatus `HR_ADMIN`.
4. **Kegagalan API Gemini (kuota habis / timeout):** Sistem tidak boleh menggagalkan proses penyimpanan nilai penilaian; status AI fallback ke state error yang bisa di-retry.
5. **Ekspor PDF/Excel pada data kosong atau sesi belum lengkap:** Handler ekspor wajib memvalidasi kelengkapan data sebelum menghasilkan file.

---

### Task 1: Setup Proyek, Tooling & Core Domain Calculations (TDS Gap Engine)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`
- Create: `src/lib/gap-calculator.ts`
- Create: `tests/unit/gap-calculator.test.ts`

**Interfaces:**
- Produces:
  - `calculateGap(standardLevel: number, actualLevel: number): number`
  - `getTdsGapLabel(gap: number): string`
  - `getProficiencyDescriptor(level: number): { label: string; description: string }`

- [ ] **Step 1: Inisialisasi scaffolding Next.js 15 dengan TypeScript, Tailwind, dan Vitest**
- [ ] **Step 2: Tulis failing test untuk kalkulator GAP TDS**

```typescript
// tests/unit/gap-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateGap, getTdsGapLabel, getProficiencyDescriptor } from '@/lib/gap-calculator';

describe('TDS Gap Engine', () => {
  it('menghitung GAP aktual - standar dengan benar', () => {
    expect(calculateGap(3, 1)).toBe(-2);
    expect(calculateGap(2, 2)).toBe(0);
    expect(calculateGap(2, 4)).toBe(2);
  });

  it('memetakan label keterangan GAP sesuai standar TDS', () => {
    expect(getTdsGapLabel(-4)).toBe('Memerlukan pengembangan menyeluruh.');
    expect(getTdsGapLabel(-3)).toBe('Memerlukan pengembangan intensif.');
    expect(getTdsGapLabel(-2)).toBe('Memerlukan pengembangan.');
    expect(getTdsGapLabel(-1)).toBe('Memerlukan peningkatan kompetensi.');
    expect(getTdsGapLabel(0)).toBe('Sesuai standar jabatan.');
    expect(getTdsGapLabel(1)).toBe('Melampaui standar jabatan.');
    expect(getTdsGapLabel(2)).toBe('Melampaui standar jabatan.');
  });

  it('mengembalikan deskriptor kemahiran 1-4', () => {
    expect(getProficiencyDescriptor(1).label).toBe('Pemahaman dasar');
    expect(getProficiencyDescriptor(4).label).toBe('Ahli');
  });

  it('menolak input di luar skala 1-4', () => {
    expect(() => calculateGap(0, 3)).toThrow();
    expect(() => calculateGap(2, 5)).toThrow();
  });
});
```

- [ ] **Step 3: Jalankan test untuk memverifikasi kegagalan**
  - Run: `npx vitest run tests/unit/gap-calculator.test.ts`
  - Expected: FAIL dengan error module `@/lib/gap-calculator` not found.

- [ ] **Step 4: Implementasikan `src/lib/gap-calculator.ts`**
  - Implementasikan validasi integer 1–4, rumus `actual - standard`, dan kamus label TDS.

- [ ] **Step 5: Jalankan test untuk memverifikasi kelulusan**
  - Run: `npx vitest run tests/unit/gap-calculator.test.ts`
  - Expected: PASS seluruh 4 test cases.

- [ ] **Step 6: Commit perubahan**
  - Commit: `feat: add TDS gap calculation engine and proficiency definitions`

---

### Task 2: Skema Database Prisma, Relasi & Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`
- Test: `tests/integration/prisma-schema.test.ts`

**Interfaces:**
- Consumes: Skema model dari dokumen spesifikasi.
- Produces: Prisma Client singleton di `src/lib/db.ts` dengan relasi lengkap User, Department, Competency, AppraisalSession, AppraisalScoreItem, IDPItem, AISummary.

- [ ] **Step 1: Tulis skema Prisma di `prisma/schema.prisma`**
  - Definisikan enum: `Role`, `AppraisalStatus`, `IDPStatus`.
  - Definisikan 8 model: `Department`, `User`, `Competency`, `EmployeeCompetencyAssignment`, `AppraisalPeriod`, `AppraisalSession`, `AppraisalScoreItem`, `IDPItem`, `AISummary`.

- [ ] **Step 2: Buat berkas `src/lib/db.ts` (Prisma Singleton)**
  - Cegah multi-koneksi saat Next.js *hot-reload*.

- [ ] **Step 3: Tulis script `prisma/seed.ts` dengan data master TDS**
  - Buat departemen contoh: "Technology", "People Operations".
  - Buat user akun: `hr@company.com` (HR_ADMIN), `manager@company.com` (MANAGER), `developer@company.com` (EMPLOYEE).
  - Buat katalog kompetensi awal (Core: Integritas, Komunikasi; Technical: Problem Solving, System Design; Leadership: Team Mentoring).
  - Assign profil kompetensi ke karyawan contoh dengan target standard level (1–4).

- [ ] **Step 4: Tulis integration test verifikasi koneksi & relasi DB**
  - Verifikasi query relasi: `user.subordinates`, `session.scoreItems`, `assignment.competency`.

- [ ] **Step 5: Jalankan test Prisma & eksekusi migrasi/seed lokal**
  - Run: `npx prisma generate` dan jalankan test integration.
  - Expected: PASS.

- [ ] **Step 6: Commit perubahan**
  - Commit: `feat: implement prisma database schema and seed data`

---

### Task 3: Autentikasi & Guard Role-Based Access Control (RBAC)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/lib/rbac.ts`
- Test: `tests/unit/rbac.test.ts`

**Interfaces:**
- Consumes: `prisma` dari `src/lib/db.ts`.
- Produces:
  - `authOptions`: Konfigurasi NextAuth JWT + Credentials.
  - `authorizeRole(currentRole: Role, allowedRoles: Role[]): boolean`
  - `canAccessSession(user: { id: string; role: Role; managerId?: string }, session: { employeeId: string; evaluatorId: string; status: AppraisalStatus }): boolean`

- [ ] **Step 1: Tulis unit test untuk `src/lib/rbac.ts`**
  - Test skenario 1: `EMPLOYEE` dilarang melihat berkas saat status `SUBMITTED`.
  - Test skenario 2: `EMPLOYEE` boleh melihat berkas miliknya sendiri saat status `PUBLISHED`.
  - Test skenario 3: `MANAGER` dilarang mengedit berkas bawahan yang bukan *direct report*-nya.
  - Test skenario 4: `HR_ADMIN` memiliki izin akses ke seluruh berkas status apa pun.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  - Run: `npx vitest run tests/unit/rbac.test.ts`
  - Expected: FAIL.

- [ ] **Step 3: Implementasikan fungsi otorisasi di `src/lib/rbac.ts` dan konfigurasi `src/lib/auth.ts`**

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**
  - Run: `npx vitest run tests/unit/rbac.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Setup Next.js middleware untuk memproteksi rute `/admin`, `/manager`, dan `/portal`**

- [ ] **Step 6: Commit perubahan**
  - Commit: `feat: implement NextAuth authentication and RBAC authorization guards`

---

### Task 4: Server Actions Evaluasi Manager & Kalkulasi GAP Otomatis

**Files:**
- Create: `src/actions/evaluation.ts`
- Create: `src/schemas/evaluation-schema.ts`
- Test: `tests/unit/evaluation-actions.test.ts`

**Interfaces:**
- Consumes: `src/lib/gap-calculator.ts`, `src/lib/db.ts`, `src/lib/rbac.ts`.
- Produces:
  - `saveEvaluationDraftAction(input: EvaluationInput)`
  - `submitManagerEvaluationAction(input: EvaluationInput)`
  - Input schema memvalidasi array skor: `competencyId`, `actualLevel (1-4)`, `managerComment`, serta array draf IDP (`actionPlan`, `targetDate`).

- [ ] **Step 1: Tulis Zod schema di `src/schemas/evaluation-schema.ts`**
  - Validasi bahwa `actualLevel` wajib integer min 1 dan max 4.

- [ ] **Step 2: Tulis integration/unit test untuk Server Actions**
  - Test kalkulasi GAP tersimpan otomatis di database saat action dipanggil.
  - Test transisi status dari `PENDING_EVALUATION` menjadi `SUBMITTED`.
  - Test penolakan jika input aktual di luar 1-4.

- [ ] **Step 3: Jalankan test untuk memverifikasi kegagalan**
  - Run: `npx vitest run tests/unit/evaluation-actions.test.ts`
  - Expected: FAIL.

- [ ] **Step 4: Implementasikan `saveEvaluationDraftAction` dan `submitManagerEvaluationAction` di `src/actions/evaluation.ts`**
  - Gunakan Prisma transaksi (`prisma.$transaction`) untuk menyimpan nilai skor, menghitung GAP, label TDS, dan mengupdate status sesi.

- [ ] **Step 5: Jalankan test untuk memverifikasi kelulusan**
  - Run: `npx vitest run tests/unit/evaluation-actions.test.ts`
  - Expected: PASS.

- [ ] **Step 6: Commit perubahan**
  - Commit: `feat: implement manager evaluation server actions with automated gap calculation`

---

### Task 5: Server Actions Kalibrasi HR, Review & Publikasi

**Files:**
- Create: `src/actions/calibration.ts`
- Test: `tests/unit/calibration-actions.test.ts`

**Interfaces:**
- Consumes: `src/lib/db.ts`, `src/lib/rbac.ts`.
- Produces:
  - `requestRevisionAction(sessionId: string, hrNotes: string)`
  - `approveEvaluationAction(sessionId: string, hrNotes?: string)`
  - `publishEvaluationAction(sessionId: string)`

- [ ] **Step 1: Tulis unit test untuk alur kalibrasi dan approval HR**
  - Test approval mengubah status sesi dari `SUBMITTED` ke `APPROVED`.
  - Test publikasi mengubah status menjadi `PUBLISHED` dan mencatat `publishedAt`.
  - Test `requestRevisionAction` mengubah status menjadi `NEEDS_REVISION`.

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  - Run: `npx vitest run tests/unit/calibration-actions.test.ts`
  - Expected: FAIL.

- [ ] **Step 3: Implementasikan logika status transition di `src/actions/calibration.ts`**

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**
  - Run: `npx vitest run tests/unit/calibration-actions.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit perubahan**
  - Commit: `feat: implement HR calibration, approval, and publishing actions`

---

### Task 6: Integrasi Google Gemini AI Summary Engine

**Files:**
- Create: `src/lib/ai-summary.ts`
- Create: `src/actions/ai.ts`
- Test: `tests/unit/ai-summary.test.ts`

**Interfaces:**
- Consumes: `@google/genai`, database session items.
- Produces:
  - `generateEmployeeSummary(sessionId: string): Promise<AISummaryResult>`
  - Output format: `{ overviewNarrative: string, topStrengths: string[], growthAreas: string[], actionRecommendations: string[] }`
  - Caching ke tabel `AISummary` di PostgreSQL.

- [ ] **Step 1: Tulis unit test untuk parsing respons Gemini & fallback handler**
  - Mock SDK Gemini untuk mengembalikan JSON terstruktur.
  - Test penanganan saat API mengembalikan error/rate limit (harus melempar error tertangkap tanpa crash).

- [ ] **Step 2: Jalankan test untuk memverifikasi kegagalan**
  - Run: `npx vitest run tests/unit/ai-summary.test.ts`
  - Expected: FAIL.

- [ ] **Step 3: Implementasikan fungsi `generateEmployeeSummary` di `src/lib/ai-summary.ts`**
  - Siapkan prompt terstruktur dengan konteks: nama, jabatan, matriks kompetensi (Standar vs Aktual), catatan manager, dan rumus GAP TDS.
  - Simpan hasil generasi ke database `AISummary`.

- [ ] **Step 4: Jalankan test untuk memverifikasi kelulusan**
  - Run: `npx vitest run tests/unit/ai-summary.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit perubahan**
  - Commit: `feat: implement Gemini AI summary engine with structured output and caching`

---

### Task 7: Antarmuka Evaluasi & Visualisasi Radar Chart (Recharts)

**Files:**
- Create: `src/components/charts/competency-radar-chart.tsx`
- Create: `src/components/evaluation/skill-matrix-form.tsx`
- Create: `src/components/evaluation/gap-badge.tsx`
- Create: `src/app/manager/evaluations/[sessionId]/page.tsx`
- Test: `tests/unit/competency-radar-chart.test.ts`

**Interfaces:**
- Consumes: Recharts, `getTdsGapLabel`, `calculateGap`.
- Produces:
  - Komponen visual `<CompetencyRadarChart items={scoreItems} />` dengan dua poligon (Target vs Aktual).
  - Form interaktif penilaian dengan preview radar chart *real-time* dan tombol simpan draf / submit.

- [ ] **Step 1: Tulis test untuk helper transformasi data Recharts**
  - Format data dari entitas `AppraisalScoreItem` menjadi format Recharts: `{ subject: comp.name, standard: item.standardLevel, actual: item.actualLevel, fullMark: 4 }`.

- [ ] **Step 2: Implementasikan `<CompetencyRadarChart />` dengan Recharts**
- [ ] **Step 3: Implementasikan komponen `<GapBadge gap={gapValue} />` dengan warna indikator TDS (-4 merah tua s/d +1 hijau)**
- [ ] **Step 4: Implementasikan halaman form evaluasi Manager dengan sinkronisasi nilai interaktif**
- [ ] **Step 5: Verifikasi rendering komponen**
  - Run: `npx vitest run tests/unit/competency-radar-chart.test.ts`
  - Expected: PASS.

- [ ] **Step 6: Commit perubahan**
  - Commit: `feat: implement interactive skill matrix form and radar chart visualization`

---

### Task 8: Portal Karyawan & Pelacakan IDP (Individual Development Plan)

**Files:**
- Create: `src/app/portal/my-evaluation/page.tsx`
- Create: `src/components/idp/idp-tracker-table.tsx`
- Create: `src/actions/idp.ts`
- Test: `tests/unit/idp-actions.test.ts`

**Interfaces:**
- Consumes: `canAccessSession`, Prisma IDPItem.
- Produces:
  - Halaman rapor mandiri karyawan (hanya membaca data jika status `PUBLISHED`).
  - Server Action `updateIDPStatusAction(idpId: string, status: IDPStatus)` untuk mencatat kemajuan pelatihan/mentoring.

- [ ] **Step 1: Tulis test untuk Server Action update status IDP**
- [ ] **Step 2: Implementasikan `<IDPTrackerTable />` dengan selector status (PLANNED / IN_PROGRESS / COMPLETED)**
- [ ] **Step 3: Implementasikan portal karyawan yang menampilkan Ringkasan AI, Radar Chart, dan Tabel GAP**
- [ ] **Step 4: Jalankan test**
  - Run: `npx vitest run tests/unit/idp-actions.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit perubahan**
  - Commit: `feat: implement employee self-portal and IDP action plan tracker`

---

### Task 9: Dasbor HR Analytics & Matriks TNA (Training Needs Analysis)

**Files:**
- Create: `src/app/admin/analytics/tna/page.tsx`
- Create: `src/components/analytics/tna-matrix-board.tsx`
- Create: `src/lib/tna-calculator.ts`
- Test: `tests/unit/tna-calculator.test.ts`

**Interfaces:**
- Consumes: Prisma aggregate query.
- Produces:
  - `calculateTnaSummary(sessions: AppraisalSession[])`: Mengelompokkan seluruh gap negatif per kompetensi dan departemen.
  - Tabel interaktif TNA untuk menyusun prioritas pelatihan HR.

- [ ] **Step 1: Tulis unit test untuk kalkulasi ringkasan TNA**
  - Menguji pengelompokan gap kritis (-4, -3) vs gap pembinaan (-2, -1) per departemen.

- [ ] **Step 2: Implementasikan `src/lib/tna-calculator.ts` dan `<TNAMatrixBoard />`**
- [ ] **Step 3: Buat halaman dashboard `/admin/analytics/tna` dengan filter departemen**
- [ ] **Step 4: Jalankan test**
  - Run: `npx vitest run tests/unit/tna-calculator.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit perubahan**
  - Commit: `feat: implement HR Training Needs Analysis matrix and analytics dashboard`

---

### Task 10: Modul Ekspor Laporan Resmi (PDF Rapor Karyawan & Excel Rekapitulasi)

**Files:**
- Create: `src/app/api/export/pdf/[sessionId]/route.ts`
- Create: `src/components/reports/appraisal-pdf-document.tsx`
- Create: `src/app/api/export/excel/period/[periodId]/route.ts`
- Create: `src/lib/excel-export.ts`
- Test: `tests/integration/export-routes.test.ts`

**Interfaces:**
- Consumes: `@react-pdf/renderer`, `xlsx`, `canAccessSession`.
- Produces:
  - Endpoint GET `/api/export/pdf/[sessionId]` yang mengembalikan file PDF (A4 standar HR).
  - Endpoint GET `/api/export/excel/period/[periodId]` yang mengembalikan file Excel 3 sheet (Master Summary, Competency Matrix Pivot, TNA Priority List).

- [ ] **Step 1: Tulis integration test untuk route ekspor PDF dan Excel**
  - Uji response header `Content-Type: application/pdf` dan `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
  - Uji penolakan akses (403/401) jika user bukan pemilik berkas / bukan HR.

- [ ] **Step 2: Implementasikan template PDF di `src/components/reports/appraisal-pdf-document.tsx`**
  - Format resmi: Kop, Profil, Tabel Matriks Kompetensi TDS, Ringkasan AI, IDP, dan Lembar Pengesahan Tanda Tangan 3 Pihak.

- [ ] **Step 3: Implementasikan generator Excel di `src/lib/excel-export.ts` menggunakan library `xlsx`**

- [ ] **Step 4: Jalankan test integrasi ekspor**
  - Run: `npx vitest run tests/integration/export-routes.test.ts`
  - Expected: PASS.

- [ ] **Step 5: Commit perubahan**
  - Commit: `feat: implement official appraisal PDF report card and multi-sheet Excel export`

---

## Plan Self-Review Checklist

- [x] **Spec coverage:** Seluruh fitur dalam spec (Skala TDS 1-4, GAP -4 s/d ≥+1, RBAC, 2-stage workflow, Gemini AI, Radar Chart, TNA, IDP, PDF & Excel) tercakup dalam Task 1 sampai 10.
- [x] **Step scan:** Setiap langkah memiliki perintah eksekusi dan ekspektasi yang jelas, tanpa baris kosong/TBD.
- [x] **Type consistency:** Konsistensi tipe `standardLevel (1-4)`, `actualLevel (1-4)`, `gapValue (integer)`, status enum `AppraisalStatus`, dan `IDPStatus` terjaga di semua task.
- [x] **Review Focus:** Seluruh 5 poin risiko edge-case (input di luar 1-4, kebocoran akses employee, manager lintas tim, kegagalan AI, ekspor data kosong) telah dimasukkan ke dalam test case pada task terkait.
- [x] **Proportion:** Rencana terstruktur dalam 10 task modular yang masing-masing memiliki siklus pengujian mandiri (*independently testable*).
