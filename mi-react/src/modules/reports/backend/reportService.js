import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export const REPORT_CONFIG = {
  institutionName: 'Escuela Militar de Ingeniería',
  careerName: 'Ingeniería de Sistemas',
  defaultAcademicPeriod: 'I/2026',
  approvedStatus: 'aprobado',
};

// ── helpers ──────────────────────────────────────────────────────────────────

function headerPDF(doc, titulo, periodo, estado) {
  // Franja superior azul marino
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');

  doc.setTextColor(212, 175, 55); // dorado
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(REPORT_CONFIG.institutionName, 14, 10);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(REPORT_CONFIG.careerName + '  ·  ' + titulo, 14, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Periodo: ${periodo}   |   Estado: ${(estado || 'PENDIENTE').toUpperCase()}`, 14, 25);

  // Fecha generación
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  const fecha = new Date().toLocaleString('es-BO');
  doc.text(`Generado: ${fecha}`, doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });

  doc.setTextColor(0, 0, 0); // reset
}

export function buildScheduleRows({ horario, docentes = [], aulas = [] }) {
  if (!horario) return [];
  const rows = [];
  Object.entries(horario).forEach(([semestre, dias]) => {
    dias.forEach((periodos, dia) => {
      periodos.forEach((celda, periodo) => {
        if (!celda) return;
        rows.push({
          Semestre: `${semestre}°`,
          Día: DIAS[dia] || `Día ${dia + 1}`,
          Periodo: `P${periodo + 1}`,
          Materia: celda.nombre || '',
          Docente: docentes.find(d => d.id === celda.docenteId)?.nombre || '—',
          Aula: aulas.find(a => a.id === celda.aulaId)?.nombre || '—',
          'Tipo Aula': celda.tipoAula || '',
        });
      });
    });
  });
  return rows;
}

// ── PDF: Horario General ──────────────────────────────────────────────────────

export function exportarHorarioGeneralPDF({ horario, docentes, aulas, periodo, estadoHorario }) {
  const rows = buildScheduleRows({ horario, docentes, aulas });
  if (!rows.length) { alert('Sin datos para exportar.'); return; }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  headerPDF(doc, 'Horario General', periodo, estadoHorario);

  autoTable(doc, {
    startY: 32,
    head: [['Semestre', 'Día', 'Periodo', 'Materia', 'Docente', 'Aula', 'Tipo Aula']],
    body: rows.map(r => [r.Semestre, r.Día, r.Periodo, r.Materia, r.Docente, r.Aula, r['Tipo Aula']]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 3: { cellWidth: 55 }, 4: { cellWidth: 45 } },
  });

  doc.save(`Horario_General_${periodo}.pdf`);
}

// ── PDF: Por Docente ──────────────────────────────────────────────────────────

export function exportarHorarioDocentePDF({ horario, docentes, aulas, docenteId, periodo, estadoHorario }) {
  const doc2 = docentes.find(d => d.id === docenteId);
  if (!doc2) { alert('Selecciona un docente.'); return; }

  const rows = [];
  Object.entries(horario || {}).forEach(([semestre, dias]) => {
    dias.forEach((periodos, dia) => {
      periodos.forEach((celda, periodo_idx) => {
        if (celda?.docenteId === docenteId) {
          rows.push([
            `${semestre}°`,
            DIAS[dia],
            `P${periodo_idx + 1}`,
            celda.nombre,
            aulas.find(a => a.id === celda.aulaId)?.nombre || '—',
            celda.tipoAula || '',
          ]);
        }
      });
    });
  });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  headerPDF(doc, `Horario Docente: ${doc2.nombre}`, periodo, estadoHorario);

  // Info docente
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Especialidad: ${doc2.especialidad}   |   Tipo: ${doc2.tipo}   |   Horas máx: ${doc2.maxHoras}`, 14, 36);

  autoTable(doc, {
    startY: 42,
    head: [['Semestre', 'Día', 'Periodo', 'Materia', 'Aula', 'Tipo']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3.5 },
    headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  doc.save(`Horario_${doc2.nombre.replace(/ /g, '_')}_${periodo}.pdf`);
}

// ── PDF: Ocupación de Aulas ───────────────────────────────────────────────────

export function exportarAulasPDF({ horario, aulas, periodo, estadoHorario }) {
  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  headerPDF(doc, 'Ocupación de Aulas', periodo, estadoHorario);

  const body = aulas.filter(a => a.disponible).map(aula => {
    const usos = [];
    semestres.forEach(s => {
      (horario[s] || []).forEach((periodos, dia) => {
        periodos.forEach((celda, p) => {
          if (celda?.aulaId === aula.id) usos.push(`${DIAS[dia]} P${p + 1}`);
        });
      });
    });
    const tasa = Math.round((usos.length / 40) * 100);
    return [aula.nombre, aula.tipo, `Edif. ${aula.edificio}`, aula.capacidad, usos.length, `${tasa}%`];
  });

  autoTable(doc, {
    startY: 32,
    head: [['Aula', 'Tipo', 'Edificio', 'Capacidad', 'Periodos Usados', 'Ocupación %']],
    body,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: { 5: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  });

  doc.save(`Ocupacion_Aulas_${periodo}.pdf`);
}

// ── PDF: Carga Horaria ────────────────────────────────────────────────────────

export function exportarCargaPDF({ docentes, horasDoc, periodo, estadoHorario }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  headerPDF(doc, 'Carga Horaria Docentes', periodo, estadoHorario);

  const body = docentes.map(d => {
    const h = horasDoc?.[d.id] || 0;
    const estado = h < d.minHoras ? 'BAJO' : h > d.maxHoras ? 'EXCEDE' : 'OK';
    return [d.nombre, d.tipo, d.especialidad, d.minHoras, d.maxHoras, h, estado];
  });

  autoTable(doc, {
    startY: 32,
    head: [['Docente', 'Tipo', 'Especialidad', 'Mín', 'Máx', 'Asignadas', 'Estado']],
    body,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    didParseCell: (data) => {
      if (data.column.index === 6 && data.section === 'body') {
        const v = data.cell.raw;
        data.cell.styles.textColor = v === 'OK' ? [22, 101, 52] : v === 'BAJO' ? [146, 64, 14] : [185, 28, 28];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  doc.save(`Carga_Horaria_${periodo}.pdf`);
}

// ── EXCEL: Horario General ────────────────────────────────────────────────────

export function exportarHorarioGeneralExcel({ horario, docentes, aulas, periodo }) {
  const rows = buildScheduleRows({ horario, docentes, aulas });
  if (!rows.length) { alert('Sin datos para exportar.'); return; }

  const ws = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 40 },
    { wch: 30 }, { wch: 18 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Horario General');

  // Hoja resumen por semestre
  const semestres = [...new Set(rows.map(r => r.Semestre))].sort();
  const resumen = semestres.map(s => ({
    Semestre: s,
    'Total Clases': rows.filter(r => r.Semestre === s).length,
    Materias: [...new Set(rows.filter(r => r.Semestre === s).map(r => r.Materia))].length,
  }));
  const wsRes = XLSX.utils.json_to_sheet(resumen);
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Horario_General_${periodo}.xlsx`);
}

// ── EXCEL: Carga Horaria ──────────────────────────────────────────────────────

export function exportarCargaExcel({ docentes, horasDoc, periodo }) {
  const rows = docentes.map(d => {
    const h = horasDoc?.[d.id] || 0;
    return {
      Docente: d.nombre,
      Tipo: d.tipo,
      Especialidad: d.especialidad,
      'Horas Mín': d.minHoras,
      'Horas Máx': d.maxHoras,
      'Horas Asignadas': h,
      Estado: h < d.minHoras ? 'BAJO' : h > d.maxHoras ? 'EXCEDE' : 'OK',
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Carga Horaria');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Carga_Horaria_${periodo}.xlsx`);
}

// ── EXCEL: Aulas ──────────────────────────────────────────────────────────────

export function exportarAulasExcel({ horario, aulas, periodo }) {
  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];
  const rows = aulas.filter(a => a.disponible).map(aula => {
    let usos = 0;
    semestres.forEach(s => {
      (horario[s] || []).forEach(periodos => {
        periodos.forEach(celda => { if (celda?.aulaId === aula.id) usos++; });
      });
    });
    return {
      Aula: aula.nombre,
      Tipo: aula.tipo,
      Edificio: aula.edificio,
      Capacidad: aula.capacidad,
      'Periodos Usados': usos,
      'Total Posible': 40,
      'Ocupación %': Math.round((usos / 40) * 100) + '%',
    };
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 20 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Aulas');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Aulas_${periodo}.xlsx`);
}