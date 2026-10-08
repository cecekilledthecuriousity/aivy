import Link from 'next/link';
import { prisma } from '@/lib/db';
import { UserCheck, Users, BarChart3, FileSpreadsheet, FileText, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  // Query evaluasi yang ada di database untuk direct shortcut link
  let latestSessionId: string | null = null;
  let activePeriodId: string | null = null;

  try {
    const session = await prisma.appraisalSession.findFirst({
      select: { id: true }
    });
    latestSessionId = session?.id || null;

    const period = await prisma.appraisalPeriod.findFirst({
      select: { id: true }
    });
    activePeriodId = period?.id || null;
  } catch (err) {
    // Graceful fallback jika DB belum di-migrate/seed
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Cloud HR Performance Appraisal 2.0</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Sistem Penilaian Kinerja & <span className="text-indigo-600">Skill Matrix Individual</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Platform terpadu untuk evaluasi kompetensi kerja berbasis standar TDS: kalkulasi deviasi GAP otomatis (1–4), visualisasi Radar Chart interaktif, rekomendasi rencana pengembangan (IDP), sintesis naratif AI Gemini, dan Dasbor Training Needs Analysis (TNA).
        </p>
      </section>

      {/* AIVY Sunrise Valuation Console Showcase Card */}
      <section className="bg-gradient-to-r from-[#FFF5F2] via-[#FFFDF9] to-[#F0FAFF] border border-[#FF9A8B]/40 rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/90 border border-[#FF9A8B]/30 rounded-full text-xs font-bold text-slate-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#FF9A8B]" />
            <span>AIVY Cloud Valuation Console • Sunrise UI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Asset Appraisal & Valuation Dashboard
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Antarmuka modern AIVY dengan estetika soft sunrise gradient, kurva tren valuasi Recharts (Coral & Sky Blue), pelacak riwayat timeline audit, dan login glassmorphic terenkripsi.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200 text-slate-700">
              Soft Sunrise Aesthetic
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200 text-slate-700">
              Glassmorphism Cards (18–24px)
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white/80 border border-slate-200 text-slate-700">
              Recharts Area Trend
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-[#FF9A8B] hover:bg-[#FFC3A0] text-slate-900 font-extrabold text-sm shadow-soft transition-all active:scale-98"
          >
            <span>Buka Dashboard AIVY</span>
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </Link>
          <Link
            href="/appraisals/aivy-8841"
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border border-slate-200 font-bold text-sm transition-all shadow-2xs"
          >
            <span>Detail Appraisal</span>
          </Link>
        </div>
      </section>

      {/* Role Access Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Portal Karyawan */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Peran: Karyawan</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Portal Rapor Karyawan</h2>
            </div>
            <p className="text-sm text-slate-600">
              Akses rapor evaluasi resmi yang telah dipublikasikan (`PUBLISHED`), grafik Radar capaian vs standar jabatan, narasi umpan balik AI Gemini, serta pelacakan progres rencana pengembangan (IDP).
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Visualisasi Spider/Radar Chart Recharts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Ekspor Rapor Resmi Format PDF (A4 HR)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Pelacak Status IDP (Planned / Done)</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <Link
              href="/portal/my-evaluation"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition space-x-2 shadow-sm"
            >
              <span>Buka Portal Karyawan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card 2: Evaluasi Manager */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Peran: Manager</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Evaluasi Bawahan Langsung</h2>
            </div>
            <p className="text-sm text-slate-600">
              Penilaian kompetensi anggota tim pada skala kemahiran 1–4 TDS. Menghitung GAP secara instan, preview live radar chart, penyusunan draf tindakan perbaikan, dan pengajuan ke HR.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Input Level Aktual (1: Dasar s/d 4: Ahli)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Kalkulasi Deviasi GAP & Label TDS Real-Time</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Validasi Kelengkapan IDP sebelum Submit</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            {latestSessionId ? (
              <Link
                href={`/manager/evaluations/${latestSessionId}`}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition space-x-2 shadow-sm"
              >
                <span>Buka Form Evaluasi (Sesi Aktif)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/manager/evaluations/demo-session"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition space-x-2 shadow-sm"
              >
                <span>Buka Form Evaluasi Manager</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Card 3: HR Administration & TNA */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Peran: HR Admin</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">HR Analytics & TNA Matrix</h2>
            </div>
            <p className="text-sm text-slate-600">
              Dasbor analitik Training Needs Analysis (TNA) untuk mengidentifikasi kesenjangan kompetensi organisasi, kalibrasi review, persetujuan & publikasi massal, serta rekapitulasi data.
            </p>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Deteksi GAP Kritis (-4 & -3) Otomatis</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Filter Kebutuhan Training per Departemen</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Ekspor Spreadsheet Excel Rekap 3-Sheet</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100">
            <Link
              href="/admin/analytics/tna"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition space-x-2 shadow-sm"
            >
              <span>Buka Dasbor TNA HR</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TDS Reference & Logic Guide */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Standar Penilaian Kompetensi TDS</h2>
          <p className="text-sm text-slate-500 mt-1">
            Rubrik baku yang diadaptasi dari framework Skill Matrix Individual:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skala Kemahiran */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              1. Skala Kemahiran (Proficiency Level 1–4)
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">1</span>
                <div>
                  <div className="font-semibold text-slate-900">Pemahaman Dasar (Basic)</div>
                  <div className="text-xs text-slate-500">Memiliki pemahaman teoritis/konseptual dasar, memerlukan bimbingan rutin.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">2</span>
                <div>
                  <div className="font-semibold text-slate-900">Cukup Kompeten (Working Knowledge)</div>
                  <div className="text-xs text-slate-500">Mampu menyelesaikan tugas operasional standar dengan supervisi umum.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">3</span>
                <div>
                  <div className="font-semibold text-slate-900">Kompeten (Proficient) - Standar Jabatan</div>
                  <div className="text-xs text-slate-500">Mandiri penuh, mengatasi kendala kerja tanpa supervisi, benchmark umum jabatan.</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">4</span>
                <div>
                  <div className="font-semibold text-slate-900">Ahli (Expert / Master)</div>
                  <div className="text-xs text-slate-500">Menguasai pemecahan masalah rumit, menjadi rujukan tim, mampu membimbing orang lain.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Formula GAP & Kategori TDS */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              2. Kalkulasi GAP & Interpretasi TDS
            </h3>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-mono text-indigo-900">
              GAP = Actual Level - Standard Level
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center p-2 rounded bg-red-50 border border-red-100 text-red-800">
                <span className="font-bold">GAP: -4</span>
                <span>Memerlukan pengembangan menyeluruh. (Kritis)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-red-50 border border-red-100 text-red-800">
                <span className="font-bold">GAP: -3</span>
                <span>Memerlukan pengembangan intensif. (Kritis)</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-orange-50 border border-orange-100 text-orange-800">
                <span className="font-bold">GAP: -2</span>
                <span>Memerlukan pengembangan.</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-amber-50 border border-amber-100 text-amber-800">
                <span className="font-bold">GAP: -1</span>
                <span>Memerlukan peningkatan kompetensi.</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-blue-50 border border-blue-100 text-blue-800">
                <span className="font-bold">GAP: 0</span>
                <span>Sesuai standar jabatan.</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-emerald-50 border border-emerald-100 text-emerald-800">
                <span className="font-bold">GAP: ≥ +1</span>
                <span>Melampaui standar jabatan. (Kandidat Promosi/Mentor)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ekspor Laporan Resmi Shortcuts */}
      <section className="bg-slate-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Modul Ekspor Laporan Resmi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unduh laporan siap cetak terverifikasi tanda tangan 3-pihak (PDF) atau rekapitulasi komprehensif organisasi (Excel).
          </p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {latestSessionId ? (
            <a
              href={`/api/export/pdf/${latestSessionId}`}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
              download
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Unduh Rapor PDF</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">PDF Rapor (Jalankan seed data)</span>
          )}

          {activePeriodId ? (
            <a
              href={`/api/export/excel/period/${activePeriodId}`}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
              download
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Unduh Excel (3-Sheet)</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">Excel Rekap (Jalankan seed data)</span>
          )}
        </div>
      </section>
    </div>
  );
}
