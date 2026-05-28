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

const NOMBRES_SEMESTRE = {
  3: 'TERCERO', 4: 'CUARTO', 5: 'QUINTO', 6: 'SEXTO',
  7: 'SÉPTIMO', 8: 'OCTAVO', 9: 'NOVENO', 10: 'DÉCIMO'
};

const HORAS_PERIODOS = [
  '07:45 - 08:30', '08:30 - 09:15', '09:15 - 10:00',
  '10:15 - 11:00', '11:00 - 11:45',
  '12:00 - 12:45', '12:45 - 13:30', '13:30 - 14:15'
];

const TIPO_SIGLA = (tipoAula) => {
  if (!tipoAula) return '(T)';
  const t = tipoAula.toLowerCase();
  if (t.includes('lab')) return '(L)';
  if (t.includes('prac')) return '(P)';
  return '(T)';
};

// ── helpers ───────────────────────────────────────────────────────────────────

function headerPDF(doc, titulo, periodo, estado) {
  doc.setFillColor(13, 27, 42);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(REPORT_CONFIG.institutionName, 14, 10);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(REPORT_CONFIG.careerName + '  ·  ' + titulo, 14, 18);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Periodo: ${periodo}   |   Estado: ${(estado || 'PENDIENTE').toUpperCase()}`, 14, 25);
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  const fecha = new Date().toLocaleString('es-BO');
  doc.text(`Generado: ${fecha}`, doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

export function buildScheduleRows({ horario, docentes = [], aulas = [] }) {
  if (!horario) return [];
  const rows = [];
  Object.entries(horario).forEach(([semestre, dias]) => {
    if (!Array.isArray(dias)) return;
    dias.forEach((periodos, dia) => {
      if (!Array.isArray(periodos)) return;
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

// ── PDF: Horario General en formato oficial EMI ───────────────────────────────

export function exportarHorarioGeneralPDF({ horario, docentes, aulas, materias, periodo, estadoHorario }) {
  if (!horario) { alert('Sin datos para exportar.'); return; }

  const semestres = [3, 4, 5, 6, 7, 8, 9, 10].filter(s => horario[s]);
  if (!semestres.length) { alert('Sin datos para exportar.'); return; }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  semestres.forEach((sem, semIdx) => {
    if (semIdx > 0) doc.addPage();

    // ── Encabezado institucional ──
    doc.setFillColor(13, 27, 42);
    doc.rect(0, 0, pageW, 32, 'F');

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCUELA MILITAR DE INGENIERÍA', 10, 9);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('"Mcal. Antonio José de Sucre"', 10, 15);
    doc.text('Unidad Académica La Paz — BOLIVIA', 10, 20);

    const rightX = pageW - 10;
    [
      ['CARRERA:', 'INGENIERÍA DE SISTEMAS'],
      ['SEMESTRE:', NOMBRES_SEMESTRE[sem] || `${sem}°`],
      ['CURSO:', 'A'],
      ['GESTIÓN:', periodo || 'I/2026'],
    ].forEach(([label, valor], i) => {
      doc.setTextColor(212, 175, 55);
      doc.text(label, rightX - 52, 8 + i * 6);
      doc.setTextColor(255, 255, 255);
      doc.text(valor, rightX, 8 + i * 6, { align: 'right' });
    });

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('H O R A R I O   D E   C L A S E S', pageW / 2, 29, { align: 'center' });

    // ── Tabla principal ──
    const head = [['HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']];
    const body = [];

    const periodosCfg = [
      { label: '07:45 - 08:30', p: 0 },
      { label: '08:30 - 09:15', p: 1 },
      { label: '09:15 - 10:00', p: 2 },
      { label: null, receso: '⏸  RECESO  10:00 – 10:15' },
      { label: '10:15 - 11:00', p: 3 },
      { label: '11:00 - 11:45', p: 4 },
      { label: null, receso: '⏸  RECESO  11:45 – 12:00' },
      { label: '12:00 - 12:45', p: 5 },
      { label: '12:45 - 13:30', p: 6 },
      { label: '13:30 - 14:15', p: 7 },
    ];

    periodosCfg.forEach(({ label, p, receso }) => {
      if (receso) {
        body.push([{
          content: receso,
          colSpan: 6,
          styles: { halign: 'center', fillColor: [255, 248, 220], textColor: [146, 64, 14], fontStyle: 'italic', fontSize: 7 }
        }]);
        return;
      }
      const fila = [label];
      for (let dia = 0; dia < 5; dia++) {
        const celda = horario[sem]?.[dia]?.[p];
        fila.push(celda?.nombre ? `${celda.nombre} ${TIPO_SIGLA(celda.tipoAula)}` : '');
      }
      body.push(fila);
    });

    autoTable(doc, {
      startY: 35,
      head,
      body,
      styles: { fontSize: 7, cellPadding: 2.5, valign: 'middle', lineColor: [200, 200, 200], lineWidth: 0.3 },
      headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold', fontSize: 8, halign: 'center' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 26, fontStyle: 'bold', halign: 'center', fillColor: [235, 240, 248] },
        1: { cellWidth: 44 }, 2: { cellWidth: 44 },
        3: { cellWidth: 44 }, 4: { cellWidth: 44 }, 5: { cellWidth: 44 },
      },
    });

    // ── Tabla resumen de materias ──
    const horasPorMateria = {};
    for (let dia = 0; dia < 5; dia++) {
      for (let p = 0; p < 8; p++) {
        const celda = horario[sem]?.[dia]?.[p];
        if (!celda?.nombre) continue;
        const key = celda.nombre;
        if (!horasPorMateria[key]) {
          horasPorMateria[key] = { T: 0, P: 0, L: 0, docente: '' };
          const d = docentes?.find(d => d.id === celda.docenteId);
          if (d) horasPorMateria[key].docente = d.nombre || '';
        }
        const sigla = TIPO_SIGLA(celda.tipoAula);
        if (sigla === '(L)') horasPorMateria[key].L++;
        else if (sigla === '(P)') horasPorMateria[key].P++;
        else horasPorMateria[key].T++;
      }
    }

    const resumenBody = Object.entries(horasPorMateria).map(([nombre, hrs]) => [
      nombre, hrs.docente, hrs.T, hrs.P, hrs.L, hrs.T + hrs.P + hrs.L
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['MATERIA', 'DOCENTE', 'TEORÍA', 'PRÁCTICA', 'LAB.', 'TOTAL']],
      body: resumenBody,
      styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.3 },
      headStyles: { fillColor: [13, 27, 42], textColor: [212, 175, 55], fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 55 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 15, halign: 'center' },
        5: { cellWidth: 15, halign: 'center', fontStyle: 'bold', fillColor: [13, 27, 42], textColor: [212, 175, 55] },
      },
    });

    // Pie de página
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado: ${new Date().toLocaleString('es-BO')}`, 10, pageH - 5);
    doc.text(`${semIdx + 1} / ${semestres.length}`, pageW / 2, pageH - 5, { align: 'center' });
    doc.text(`Estado: ${(estadoHorario || 'PENDIENTE').toUpperCase()}`, pageW - 10, pageH - 5, { align: 'right' });
  });

  doc.save(`Horario_General_${periodo || 'I2026'}.pdf`);
}

// ── PDF: Por Docente ──────────────────────────────────────────────────────────

export function exportarHorarioDocentePDF({ horario, docentes, aulas, docenteId, periodo, estadoHorario }) {
  const doc2 = docentes.find(d => d.id === docenteId);
  if (!doc2) { alert('Selecciona un docente.'); return; }

  const semestres = [3, 4, 5, 6, 7, 8, 9, 10];
  const rows = [];
  semestres.forEach(sem => {
    for (let dia = 0; dia < 5; dia++) {
      for (let p = 0; p < 8; p++) {
        const celda = horario?.[sem]?.[dia]?.[p];
        if (celda?.docenteId === docenteId) {
          rows.push([
            `${sem}°`,
            DIAS[dia],
            HORAS_PERIODOS[p] || `P${p + 1}`,
            celda.nombre,
            aulas.find(a => a.id === celda.aulaId)?.nombre || '—',
            TIPO_SIGLA(celda.tipoAula),
          ]);
        }
      }
    }
  });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  headerPDF(doc, `Horario Docente: ${doc2.nombre}`, periodo, estadoHorario);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Especialidad: ${doc2.especialidad || '—'}   |   Tipo: ${doc2.tipo || '—'}   |   Horas máx: ${doc2.max_horas || doc2.maxHoras || '—'}`, 14, 36);

  autoTable(doc, {
    startY: 42,
    head: [['Semestre', 'Día', 'Hora', 'Materia', 'Aula', 'Tipo']],
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
    let usos = 0;
    semestres.forEach(s => {
      for (let dia = 0; dia < 5; dia++) {
        for (let p = 0; p < 8; p++) {
          if (horario?.[s]?.[dia]?.[p]?.aulaId === aula.id) usos++;
        }
      }
    });
    const tasa = Math.round((usos / 40) * 100);
    return [aula.nombre || aula.numero_aula, aula.tipo, `Edif. ${aula.edificio}`, aula.capacidad, usos, `${tasa}%`];
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
    const minH = d.min_horas || d.minHoras || 0;
    const maxH = d.max_horas || d.maxHoras || 0;
    const estado = h < minH ? 'BAJO' : h > maxH ? 'EXCEDE' : 'OK';
    return [d.nombre, d.tipo, d.especialidad, minH, maxH, h, estado];
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

// ── EXCEL: Horario General en formato oficial EMI ─────────────────────────────

export function exportarHorarioGeneralExcel({ horario, docentes, aulas, materias, periodo }) {
  if (!horario) { alert('Sin datos para exportar.'); return; }

  const semestres = [3, 4, 5, 6, 7, 8, 9, 10].filter(s => horario[s]);
  if (!semestres.length) { alert('Sin datos para exportar.'); return; }

  const wsData = [];

  semestres.forEach((sem, semIdx) => {
    if (semIdx > 0) {
      wsData.push([]); wsData.push([]); wsData.push([]);
    }

    // ── Encabezado institucional ──
    wsData.push(['ESCUELA MILITAR DE INGENIERÍA', '', '', '', '', 'CARRERA         :', 'INGENIERÍA DE SISTEMAS']);
    wsData.push(['"Mcal. Antonio José de Sucre"', '', '', '', '', 'SEMESTRE       :', NOMBRES_SEMESTRE[sem] || `${sem}°`]);
    wsData.push(['Unidad Académica La Paz', '', '', '', '', 'CURSO             :', 'A']);
    wsData.push(['BOLIVIA', '', '', '', '', 'GESTIÓN          :', periodo || 'I/2026']);
    wsData.push(['', '', '', '', '', 'AULA                :', '']);
    wsData.push([]);
    wsData.push(['H O R A R I O  D E  C L A S E S']);
    wsData.push([]);

    // ── Cabecera de días ──
    wsData.push(['', 'HORA', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES']);

    // ── Filas de periodos con recesos ──
    const periodosCfg = [
      { p: 0 }, { p: 1 }, { p: 2 },
      { receso: 'RECESO 10:00 - 10:15' },
      { p: 3 }, { p: 4 },
      { receso: 'RECESO 11:45 - 12:00' },
      { p: 5 }, { p: 6 }, { p: 7 },
    ];

    periodosCfg.forEach(({ p, receso }) => {
      if (receso !== undefined) {
        wsData.push(['', receso, '', '', '', '', '']);
        return;
      }
      const hora = HORAS_PERIODOS[p];
      const fila = ['', hora];
      for (let dia = 0; dia < 5; dia++) {
        const celda = horario[sem]?.[dia]?.[p];
        fila.push(celda?.nombre ? `${celda.nombre} ${TIPO_SIGLA(celda.tipoAula)}` : '');
      }
      wsData.push(fila);
    });

    wsData.push([]);
    wsData.push([]);

    // ── Tabla resumen de materias ──
    wsData.push(['', '', '', 'HORAS SEMANALES', '', '', '']);
    wsData.push(['MATERIA', 'DOCENTE', '', 'TEORÍA', 'PRÁCTICA', 'LABORATORIO', 'TOTAL']);

    const horasPorMateria = {};
    for (let dia = 0; dia < 5; dia++) {
      for (let p = 0; p < 8; p++) {
        const celda = horario[sem]?.[dia]?.[p];
        if (!celda?.nombre) continue;
        const key = celda.nombre;
        if (!horasPorMateria[key]) {
          horasPorMateria[key] = { T: 0, P: 0, L: 0, docente: '' };
          const d = docentes?.find(d => d.id === celda.docenteId);
          if (d) horasPorMateria[key].docente = d.nombre || '';
        }
        const sigla = TIPO_SIGLA(celda.tipoAula);
        if (sigla === '(L)') horasPorMateria[key].L++;
        else if (sigla === '(P)') horasPorMateria[key].P++;
        else horasPorMateria[key].T++;
      }
    }

    Object.entries(horasPorMateria).forEach(([nombre, hrs]) => {
      wsData.push([nombre, hrs.docente, '', hrs.T, hrs.P, hrs.L, hrs.T + hrs.P + hrs.L]);
    });
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 8 }, { wch: 16 }, { wch: 38 },
    { wch: 38 }, { wch: 38 }, { wch: 38 }, { wch: 38 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Horario');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `Horario_General_${periodo || 'I2026'}.xlsx`
  );
}

// ── EXCEL: Carga Horaria ──────────────────────────────────────────────────────

export function exportarCargaExcel({ docentes, horasDoc, periodo }) {
  const rows = docentes.map(d => {
    const h = horasDoc?.[d.id] || 0;
    const minH = d.min_horas || d.minHoras || 0;
    const maxH = d.max_horas || d.maxHoras || 0;
    return {
      Docente: d.nombre,
      Tipo: d.tipo,
      Especialidad: d.especialidad,
      'Horas Mín': minH,
      'Horas Máx': maxH,
      'Horas Asignadas': h,
      Estado: h < minH ? 'BAJO' : h > maxH ? 'EXCEDE' : 'OK',
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
      for (let dia = 0; dia < 5; dia++) {
        for (let p = 0; p < 8; p++) {
          if (horario?.[s]?.[dia]?.[p]?.aulaId === aula.id) usos++;
        }
      }
    });
    return {
      Aula: aula.nombre || aula.numero_aula,
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