# Spesifikasi Desain: Cloud-Based HR Skill Matrix Appraisal System

## 1. Ringkasan Sistem (Executive Summary)

**Cloud-Based HR Skill Matrix Appraisal System** adalah platform evaluasi kinerja berbasis web (*internal company cloud*) yang mengintegrasikan metode **Skill Matrix Individual** dan **GAP Analysis** (standar TDS), visualisasi grafis (Radar/Spider Chart), tindak lanjut pengembangan (Training Needs Analysis & Individual Development Plan), ekspor laporan resmi (PDF & Excel), serta mesin ringkasan bertenaga kecerdasan buatan (**AI Summary Engine** menggunakan Google Gemini API).

Sistem ini dirancang untuk mempermudah HR dan Manager dalam memetakan kompetensi karyawan secara objektif, mendeteksi kesenjangan keterampilan (*skill gaps*), dan merumuskan program pelatihan serta rencana pengembangan individual secara terstruktur dan terukur.

---

## 2. Model Kompetensi & Rubrik Penilaian (TDS Standard)

### 2.1 Skala Tingkat Kemahiran (Proficiency Level: 1 - 4)
Setiap kompetensi yang ditugaskan kepada karyawan dinilai menggunakan skala 1 sampai 4 dengan definisi baku:

| Level | Predikat | Definisi Operasional |
| :---: | :--- | :--- |
| **1** | **Pemahaman dasar** | Memahami konsep dasar, namun masih membutuhkan arahan dalam pelaksanaan. |
| **2** | **Cukup kompeten** | Mampu menjalankan tugas rutin secara mandiri, tetapi masih perlu bimbingan pada kasus kompleks. |
| **3** | **Kompeten** | Bekerja mandiri dengan hasil konsisten, mampu menangani masalah dan berbagai situasi kerja. |
| **4** | **Ahli** | Menguasai secara mendalam, mampu memberi solusi strategis dan menjadi rujukan bagi orang lain. |

### 2.2 Rumus Kalkulasi & Interpretasi GAP Analysis
Setiap kompetensi pada profil karyawan memiliki:
* `Standard Level`: Target kecakapan yang diharapkan untuk jabatan/posisi karyawan (nilai: 1 - 4).
* `Actual Level`: Capaian kecakapan riil hasil penilaian Manager penilai (nilai: 1 - 4).

**Rumus:**
$$\text{GAP} = \text{Actual Level} - \text{Standard Level}$$

Rentang nilai GAP dan pemetaan keterangan standarnya:

| Nilai GAP | Keterangan Standar TDS | Kategori Tindak Lanjut |
| :---: | :--- | :--- |
| **-4** | Memerlukan pengembangan menyeluruh. | Intervensi Kritis / Pelatihan Fundamental Wajib |
| **-3** | Memerlukan pengembangan intensif. | Prioritas Tinggi TNA / Pelatihan Intensif |
| **-2** | Memerlukan pengembangan. | Masuk Program TNA & Mentoring Terstruktur |
| **-1** | Memerlukan peningkatan kompetensi. | On-the-job Coaching / Self-Learning IDP |
| **0** | Sesuai standar jabatan. | Memenuhi Standar Ekspektasi |
| **≥ +1** | Melampaui standar jabatan. | Kandidat Mentor / Talent Pool Promosi |

---

## 3. Peran Pengguna & Hak Akses (Role-Based Access Control)

| Peran (*Role*) | Deskripsi & Hak Akses Utama |
| :--- | :--- |
| **`HR_ADMIN`** | • Manajemen periode evaluasi (buka/tutup/kalibrasi).<br>• Manajemen master data (Karyawan, Departemen, Hirarki Manager, Master Kompetensi).<br>• Penetapan penugasan kompetensi individual (*Individual Competency Profile*) & target standar (1–4).<br>• Review, kalibrasi nilai, dan otorisasi persetujuan akhir (*Approval & Publish*).<br>• Akses dasbor analitik komprehensif: TNA matrix, Heatmap GAP departemen, ekspor Excel, dan AI Departmental Executive Summary. |
| **`MANAGER`** | • Mengakses daftar anggota tim langsung (*Direct Reports*).<br>• Mengisi form evaluasi matriks kompetensi anggota tim (Actual Level 1–4, bukti/alasan penilaian).<br>• Pratinjau *real-time* Spider/Radar Chart dan kalkulasi GAP saat pengisian.<br>• Menyusun draf usulan Individual Development Plan (IDP) untuk kompetensi dengan GAP < 0.<br>• Mengirim berkas penilaian ke HR (*Submit*). Akses form terkunci menjadi *read-only* setelah pengiriman. |
| **`EMPLOYEE`** | • Akses mandiri khusus untuk melihat rapor evaluasi milik pribadi yang telah berstatus `PUBLISHED`.<br>• Melihat visualisasi Radar Chart (Target Standar vs Capaian Aktual), rincian GAP, catatan Manager, ringkasan AI narrative, dan target IDP.<br>• Mengunduh berkas resmi Rapor Kinerja berformat PDF. |

---

## 4. Alur Kerja Evaluasi (*2-Stage Workflow State Machine*)

```
 +---------------------------------------------------------+
 |                      HR_ADMIN                           |
 |  Membuat Periode Appraisal & Mapping Kompetensi Individu|
 +----------------------------+----------------------------+
                              |
                              v (Buka Periode)
                 [Status: PENDING_EVALUATION]
                              |
                              v
 +----------------------------+----------------------------+
 |                       MANAGER                           |
 | Mengisi Actual Level (1-4), Feedback, & Usulan IDP      |
 +----------------------------+----------------------------+
                              |
                              v (Manager Submit)
                     [Status: SUBMITTED]
                              |
           +------------------+------------------+
           |                                     |
           | (Perlu klarifikasi)                 | (Disetujui)
           v                                     v
 [Status: NEEDS_REVISION]               [Status: APPROVED]
           |                                     |
           +---> (Kembali ke Manager)            v (HR Publish)
                                        [Status: PUBLISHED]
                                                 |
                                                 v
                                        +------------------+
                                        |     EMPLOYEE     |
                                        | Melihat Hasil &  |
                                        | Unduh Rapor PDF  |
                                        +------------------+
```

---

## 5. Arsitektur Data & Skema Database (Prisma ORM)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  HR_ADMIN
  MANAGER
  EMPLOYEE
}

enum AppraisalStatus {
  PENDING_EVALUATION
  SUBMITTED
  NEEDS_REVISION
  APPROVED
  PUBLISHED
}

enum IDPStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
}

model Department {
  id        String   @id @default(cuid())
  name      String   @unique
  code      String   @unique
  users     User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model User {
  id             String                          @id @default(cuid())
  email          String                          @unique
  name           String
  passwordHash   String
  role           Role                            @default(EMPLOYEE)
  jobTitle       String
  employeeCode   String                          @unique // NIP / ID Karyawan
  departmentId   String
  department     Department                      @relation(fields: [departmentId], references: [id])
  managerId      String?
  manager        User?                           @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates   User[]                          @relation("ManagerSubordinates")
  competencies   EmployeeCompetencyAssignment[]
  evaluations    AppraisalSession[]              @relation("EmployeeEvaluations")
  evaluatedByMe  AppraisalSession[]              @relation("EvaluatorSessions")
  createdAt      DateTime                        @default(now())
  updatedAt      DateTime                        @updatedAt
}

model Competency {
  id          String                          @id @default(cuid())
  code        String                          @unique // e.g. "TECH-01", "LEAD-02"
  name        String
  category    String                          // Core, Technical, Leadership
  description String
  assignments EmployeeCompetencyAssignment[]
  scoreItems  AppraisalScoreItem[]
  idpItems    IDPItem[]
  createdAt   DateTime                        @default(now())
  updatedAt   DateTime                        @updatedAt
}

model EmployeeCompetencyAssignment {
  id            String     @id @default(cuid())
  userId        String
  competencyId  String
  standardLevel Int        // 1 - 4
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  competency    Competency @relation(fields: [competencyId], references: [id], onDelete: Cascade)

  @@unique([userId, competencyId])
}

model AppraisalPeriod {
  id          String             @id @default(cuid())
  name        String             // e.g. "Annual Appraisal 2026"
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean            @default(true)
  sessions    AppraisalSession[]
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
}

model AppraisalSession {
  id              String               @id @default(cuid())
  periodId        String
  employeeId      String
  evaluatorId     String
  status          AppraisalStatus      @default(PENDING_EVALUATION)
  managerNotes    String?
  hrNotes         String?
  period          AppraisalPeriod      @relation(fields: [periodId], references: [id], onDelete: Cascade)
  employee        User                 @relation("EmployeeEvaluations", fields: [employeeId], references: [id])
  evaluator       User                 @relation("EvaluatorSessions", fields: [evaluatorId], references: [id])
  scoreItems      AppraisalScoreItem[]
  idpItems        IDPItem[]
  aiSummary       AISummary?
  submittedAt     DateTime?
  approvedAt      DateTime?
  publishedAt     DateTime?
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@unique([periodId, employeeId])
}

model AppraisalScoreItem {
  id             String           @id @default(cuid())
  sessionId      String
  competencyId   String
  standardLevel  Int              // 1 - 4
  actualLevel    Int              // 1 - 4
  gapValue       Int              // actualLevel - standardLevel
  gapLabel       String           // Deskripsi TDS ("Memerlukan pengembangan (-2)", dll)
  managerComment String?
  session        AppraisalSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  competency     Competency       @relation(fields: [competencyId], references: [id])

  @@unique([sessionId, competencyId])
}

model IDPItem {
  id           String           @id @default(cuid())
  sessionId    String
  competencyId String
  actionPlan   String           // Program aksi/pelatihan/mentoring
  targetDate   DateTime
  status       IDPStatus        @default(PLANNED)
  session      AppraisalSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  competency   Competency       @relation(fields: [competencyId], references: [id])
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model AISummary {
  id                        String           @id @default(cuid())
  sessionId                 String           @unique
  overviewNarrative         String           // Ringkasan naratif menyeluruh
  topStrengthsJson          String           // Array string dalam JSON
  growthAreasJson           String           // Array string dalam JSON
  actionRecommendationsJson String           // Array rekomendasi pelatihan/aksi dalam JSON
  session                   AppraisalSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  generatedAt               DateTime         @default(now())
}
```

---

## 6. AI Summary Engine (Google Gemini API Integration)

### 6.1 Format Prompt & Output Terstruktur
Mesin AI dipanggil saat Manager menyelesaikan evaluasi atau saat HR melakukan kalibrasi. Pemanggilan menggunakan *Structured Outputs* (JSON schema):

```json
{
  "overviewNarrative": "Karyawan menunjukkan performa solid pada domain technical execution...",
  "topStrengths": [
    "Keahlian analisis sistem yang melampaui ekspektasi (+1)",
    "Konsistensi dalam eksekusi tugas rutin secara mandiri (Level 3)"
  ],
  "growthAreas": [
    "Strategic communication masih memerlukan bimbingan intensif (-2)"
  ],
  "actionRecommendations": [
    "Mengikuti workshop komunikasi lintas divisi pada Q3",
    "Didampingi oleh Lead Engineer untuk penyusunan dokumentasi arsitektur"
  ]
}
```

### 6.2 Ketahanan & Caching
* Hasil AI disimpan ke tabel `AISummary` di database PostgreSQL. Jika halaman dibuka kembali, data diambil dari DB (*cache*) tanpa memanggil ulang API Gemini.
* Tombol *Regenerate Summary* tersedia khusus untuk HR/Manager jika dilakukan revisi nilai pada kompetensi.
* Jika API Gemini mengalami *rate limit* atau gangguan jaringan, proses penyimpanan nilai penilaian tetap berhasil (*graceful degradation*), dan antarmuka menampilkan tombol *Retry AI Summary*.

---

## 7. Visualisasi & Analitik (Dashboard & Grafik)

### 7.1 Visualisasi Radar Chart (Spider Web)
* Menggunakan pustaka **Recharts**.
* Menyajikan dua lapisan kurva:
  * Garis referensi abu-abu putus-putus: `Standard Level (Target)`.
  * Area berwarna dengan aksen tegas: `Actual Level (Pencapaian)`.
* Menampilkan *interactive tooltip* yang merinci status GAP TDS untuk setiap sudut kompetensi.

### 7.2 Training Needs Analysis (TNA) Board
* HR Dashboard menyediakan tab analitik khusus TNA:
  * Agregasi seluruh kompetensi di organisasi.
  * Filter otomatis karyawan dengan `GAP < 0`.
  * Pengelompokan berdasarkan urgensi: Kritis (`GAP -4`, `GAP -3`) dan Pengembangan Bertahap (`GAP -2`, `GAP -1`).
  * Rekomendasi program pelatihan terpusat berdasarkan frekuensi kesenjangan kompetensi tertinggi di suatu departemen.

---

## 8. Modul Ekspor Laporan Resmi (PDF & Excel)

### 8.1 PDF Rapor Evaluasi Karyawan
Format dokumen A4 formal HR Indonesia:
1. **Header Perusahaan**: Logo korporat, Kop Surat, Judul Dokumen (*Laporan Evaluasi Kinerja & Matriks Kompetensi*).
2. **Metadata Karyawan**: Nama Lengkap, NIP/ID, Departemen, Jabatan, Nama Penilai (Manager), Periode Penilaian.
3. **Visualisasi Radar Chart**: Gambar vektor grafik perbandingan Standar vs Aktual.
4. **Tabel Rincian Matriks Kompetensi**: Nomor, Kategori, Nama Kompetensi, Target Standar (1–4), Capaian Aktual (1–4), Nilai GAP, Keterangan Resmi TDS.
5. **Ringkasan Naratif & AI Feedback**: Poin kekuatan, area peningkatan, dan ulasan penilai.
6. **Matriks Individual Development Plan (IDP)**: Tabel daftar program aksi, tenggat waktu, dan status.
7. **Lembar Pengesahan Legalitas**: 3 kolom tanda tangan (Karyawan yang Dinilai, Manager Penilai, dan HRD / Direksi).

### 8.2 Excel Rekapitulasi Departemen / Organisasi
Workbook multi-sheet menggunakan `xlsx`:
* **Sheet 1 (Master Summary)**: ID Karyawan, Nama, Departemen, Jabatan, Rata-rata Skor GAP, Jumlah Gap Negatif, Status Berkas.
* **Sheet 2 (Competency Matrix Pivot)**: Matriks tabel silang (Karyawan di baris, Kompetensi di kolom, nilai sel berisi Actual & GAP).
* **Sheet 3 (TNA Priority List)**: Daftar nominasi karyawan yang wajib mengikuti program pelatihan berdasarkan kompetensi yang defisit.

---

## 9. Arsitektur Teknis & Stack Teknologi

* **Framework**: Next.js 15 (App Router, React 19, TypeScript)
* **Styling & Komponen**: Tailwind CSS, Lucide React, Shadcn UI
* **Grafik**: Recharts
* **Database & ORM**: PostgreSQL + Prisma ORM
* **Autentikasi**: NextAuth.js (Auth.js) dengan proteksi berbasis peran (RBAC) & password hashing (bcrypt)
* **AI Service**: Google Gen AI SDK (`@google/genai` / Gemini 2.5 Flash)
* **Ekspor Dokumen**: `@react-pdf/renderer` (PDF) dan `xlsx` (Excel)
* **Validasi Skema**: Zod

---

## 10. Strategi Pengujian & Verifikasi (*Verification Plan*)

1. **Unit Testing (Vitest)**:
   * Pengujian akurasi rumus GAP: `gapValue = actualLevel - standardLevel`.
   * Pengujian validitas pemetaan label TDS untuk semua rentang integer (-4 s/d ≥+1).
   * Pengujian fungsi transisi *state machine* (`PENDING_EVALUATION` -> `SUBMITTED` -> `APPROVED` -> `PUBLISHED`).
2. **Integration Testing**:
   * Server Action pengisian penilaian: verifikasi penyimpanan database, pembentukan GAP otomatis, dan penguncian form.
   * Alur approval HR dan sinkronisasi status ke portal karyawan.
   * Mocking pemanggilan Gemini API untuk memastikan parsing JSON output tahan terhadap respons tidak valid.
3. **Verifikasi Visual & E2E**:
   * Tampilan responsif form evaluasi di perangkat desktop dan tablet.
   * Verifikasi rendering Radar Chart dan tata letak cetak dokumen PDF.
