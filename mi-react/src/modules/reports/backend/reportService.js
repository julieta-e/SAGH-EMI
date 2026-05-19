// Backend de reportes. Actualmente genera artefactos desde el navegador;
// en servidor se puede reemplazar por pdfkit/puppeteer y exceljs.

export const REPORT_CONFIG = {
  institutionName: 'Escuela Militar de Ingenieria',
  careerName: 'Ingenieria de Sistemas',
  defaultAcademicPeriod: 'I/2026', // Valor propio a confirmar.
  approvedStatus: 'aprobado',
};

export function assertApprovedSchedule(estadoHorario) {
  if (estadoHorario !== REPORT_CONFIG.approvedStatus) {
    throw new Error('HU-64/HU-65/HU-68: solo se exporta el horario aprobado en validacion.');
  }
}

export function buildScheduleRows({ horario, docentes = [], aulas = [] }) {
  if (!horario) return [];
  const rows = [];
  Object.entries(horario).forEach(([semestre, dias]) => {
    dias.forEach((periodos, dia) => {
      periodos.forEach((celda, periodo) => {
        if (!celda) return;
        rows.push({
          semestre,
          dia,
          periodo: periodo + 1,
          materia: celda.nombre,
          docente: docentes.find((d) => d.id === celda.docenteId)?.nombre || '',
          aula: aulas.find((a) => a.id === celda.aulaId)?.nombre || '',
        });
      });
    });
  });
  return rows;
}

export function exportApprovedScheduleToPdf(payload) {
  assertApprovedSchedule(payload.estadoHorario);
  return {
    fileName: `horario-${REPORT_CONFIG.defaultAcademicPeriod}.pdf`,
    mimeType: 'application/pdf',
    status: 'ready-for-server-export',
    rows: buildScheduleRows(payload),
  };
}

export function exportApprovedScheduleToExcel(payload) {
  assertApprovedSchedule(payload.estadoHorario);
  const rows = buildScheduleRows(payload);
  const csv = ['Semestre,Dia,Periodo,Materia,Docente,Aula']
    .concat(rows.map((r) => [r.semestre, r.dia, r.periodo, r.materia, r.docente, r.aula].map(csvEscape).join(',')))
    .join('\n');
  return {
    fileName: `horario-${REPORT_CONFIG.defaultAcademicPeriod}.csv`,
    mimeType: 'text/csv',
    content: csv,
  };
}

export function printApprovedSchedule(payload) {
  assertApprovedSchedule(payload.estadoHorario);
  return { printable: true, rows: buildScheduleRows(payload) };
}

export function registerReportObservation(observaciones, texto, usuario = 'Sistema') {
  if (!texto?.trim()) return observaciones;
  return [
    { id: `obs${Date.now()}`, texto: texto.trim(), usuario, fecha: new Date().toLocaleString() },
    ...observaciones,
  ];
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export const REPORT_POSTGRES_NOTES = {
  tables: ['horarios_aprobados', 'horario_bloques', 'reportes_generados', 'observaciones'],
  source: 'El reporte debe tomar como fuente el horario aprobado por validacion.',
};
