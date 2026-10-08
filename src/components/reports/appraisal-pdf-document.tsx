import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 20 },
  companyName: { fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  periodInfo: { fontSize: 12, marginTop: 5 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: 5, marginTop: 15, marginBottom: 5 },
  infoRow: { flexDirection: 'row', marginBottom: 3 },
  infoLabel: { width: 120, fontWeight: 'bold' },
  infoValue: { flex: 1 },
  table: { display: 'flex', flexDirection: 'column', marginTop: 10, borderWidth: 1, borderColor: '#000' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000' },
  tableHeader: { fontWeight: 'bold', backgroundColor: '#f0f0f0' },
  tableCell: { padding: 5, borderRightWidth: 1, borderRightColor: '#000', fontSize: 9 },
  colNo: { width: '5%', textAlign: 'center' },
  colCat: { width: '15%' },
  colComp: { width: '30%' },
  colLvl: { width: '10%', textAlign: 'center' },
  colGap: { width: '10%', textAlign: 'center' },
  colLabel: { width: '20%' },
  colAction: { width: '35%' },
  colTarget: { width: '15%' },
  colStatus: { width: '15%' },
  noBorderRight: { borderRightWidth: 0 },
  textMuted: { color: '#555', fontStyle: 'italic', marginTop: 5 },
  signatures: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  sigBox: { width: '30%', textAlign: 'center' },
  sigLine: { borderTopWidth: 1, borderTopColor: '#000', marginTop: 50 },
  sigName: { marginTop: 5, fontWeight: 'bold' },
  sigRole: { fontSize: 9, color: '#555' }
});

export const AppraisalPdfDocument = ({
  periodName,
  employee,
  department,
  evaluator,
  scoreItems,
  idpItems,
  aiSummary,
  managerNotes,
}: any) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>PT KARYA TEKNOLOGI</Text>
          <Text style={styles.title}>LAPORAN PENILAIAN KINERJA &amp; MATRIKS KOMPETENSI</Text>
          <Text style={styles.periodInfo}>Periode: {periodName}</Text>
        </View>

        <View style={styles.sectionTitle}><Text>Informasi Karyawan</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Nama:</Text><Text style={styles.infoValue}>{employee.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>NIP (Employee Code):</Text><Text style={styles.infoValue}>{employee.employeeCode}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Departemen:</Text><Text style={styles.infoValue}>{department.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Jabatan:</Text><Text style={styles.infoValue}>{employee.jobTitle}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Penilai (Evaluator):</Text><Text style={styles.infoValue}>{evaluator.name}</Text></View>

        <View style={styles.sectionTitle}><Text>Tabel Matriks Kompetensi TDS</Text></View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.colNo]}>No</Text>
            <Text style={[styles.tableCell, styles.colCat]}>Kategori</Text>
            <Text style={[styles.tableCell, styles.colComp]}>Nama Kompetensi</Text>
            <Text style={[styles.tableCell, styles.colLvl]}>Standar</Text>
            <Text style={[styles.tableCell, styles.colLvl]}>Aktual</Text>
            <Text style={[styles.tableCell, styles.colGap]}>GAP</Text>
            <Text style={[styles.tableCell, styles.colLabel, styles.noBorderRight]}>Label TDS</Text>
          </View>
          {scoreItems.map((item: any, i: number) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.colCat]}>{item.competency.category}</Text>
              <Text style={[styles.tableCell, styles.colComp]}>{item.competency.name}</Text>
              <Text style={[styles.tableCell, styles.colLvl]}>{item.standardLevel}</Text>
              <Text style={[styles.tableCell, styles.colLvl]}>{item.actualLevel}</Text>
              <Text style={[styles.tableCell, styles.colGap]}>{item.gapValue}</Text>
              <Text style={[styles.tableCell, styles.colLabel, styles.noBorderRight]}>{item.gapLabel}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionTitle}><Text>Ringkasan AI &amp; Catatan Manager</Text></View>
        {aiSummary ? (
          <Text style={{ marginBottom: 10 }}>{aiSummary.overviewNarrative}</Text>
        ) : (
          <Text style={styles.textMuted}>Ringkasan AI tidak tersedia.</Text>
        )}
        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>Catatan Manager:</Text>
        <Text>{managerNotes || '-'}</Text>

        <View style={styles.sectionTitle}><Text>Rencana Pengembangan Individual (IDP)</Text></View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.colNo]}>No</Text>
            <Text style={[styles.tableCell, styles.colComp]}>Kompetensi</Text>
            <Text style={[styles.tableCell, styles.colAction]}>Program / Action Plan</Text>
            <Text style={[styles.tableCell, styles.colTarget]}>Target Date</Text>
            <Text style={[styles.tableCell, styles.colStatus, styles.noBorderRight]}>Status</Text>
          </View>
          {idpItems.length > 0 ? idpItems.map((idp: any, i: number) => (
            <View key={idp.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo]}>{i + 1}</Text>
              <Text style={[styles.tableCell, styles.colComp]}>{idp.competency.name}</Text>
              <Text style={[styles.tableCell, styles.colAction]}>{idp.actionPlan}</Text>
              <Text style={[styles.tableCell, styles.colTarget]}>{new Date(idp.targetDate).toLocaleDateString()}</Text>
              <Text style={[styles.tableCell, styles.colStatus, styles.noBorderRight]}>{idp.status}</Text>
            </View>
          )) : (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '100%', textAlign: 'center' }, styles.noBorderRight]}>Tidak ada IDP.</Text>
            </View>
          )}
        </View>

        <View style={styles.signatures}>
          <View style={styles.sigBox}>
            <Text>Dibuat oleh,</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{evaluator.name}</Text>
            <Text style={styles.sigRole}>Manager Penilai</Text>
          </View>
          <View style={styles.sigBox}>
            <Text>Disetujui oleh,</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>HRD / Manajemen</Text>
            <Text style={styles.sigRole}>Penyelenggara</Text>
          </View>
          <View style={styles.sigBox}>
            <Text>Diterima oleh,</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{employee.name}</Text>
            <Text style={styles.sigRole}>Karyawan yang Dinilai</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
