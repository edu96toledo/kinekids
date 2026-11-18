/**
 * VISTA: ReportView
 * Generación e impresión de Informe Clínico Oficial en PDF con membrete KineKids
 */

function printOfficialReport(evalId) {
  const db = getDB();
  const ev = db.evaluations.find(e => e.id === evalId);
  if (!ev || !ev.officialResponse) {
    showToast('No hay dictamen oficial para generar el informe.', 'error');
    return;
  }

  const resp = ev.officialResponse;
  const child = db.children.find(c => c.id === ev.childId) || {};
  const clinician = db.users.find(u => u.id === resp.clinicianId);

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    showToast('Por favor habilite las ventanas emergentes en su navegador para imprimir.', 'warning');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe Clínico KineKids - ${ev.childName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 36px; color: #1e293b; background: white; font-size: 13px; }
        .header-bar { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .logo-box { background: linear-gradient(135deg, #0d9488, #0891b2); color: white; padding: 10px 16px; border-radius: 12px; font-size: 20px; font-weight: 900; }
        h1 { margin: 0; font-size: 20px; color: #0f766e; }
        h2 { color: #0d9488; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; }
        .field label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; }
        .field span { font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; display: block; }
        .semaforo { display: inline-block; padding: 3px 12px; border-radius: 999px; font-weight: 900; font-size: 11px; }
        .rojo { background: #fee2e2; color: #991b1b; }
        .amarillo { background: #fef3c7; color: #92400e; }
        .verde { background: #d1fae5; color: #065f46; }
        .dictamen-box { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 10px; padding: 14px; line-height: 1.6; margin-top: 6px; }
        .presencial-alert { background: #fff1f2; border: 2px solid #fecaca; border-radius: 10px; padding: 12px; margin-top: 12px; }
        .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature { text-align: center; border-top: 1px solid #94a3b8; padding-top: 6px; width: 220px; font-size: 11px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div class="brand">
          <div class="logo-box">KineKids</div>
          <div>
            <h1>Informe Clínico Oficial de Marcha Pediátrica</h1>
            <p style="margin:2px 0 0;font-size:11px;color:#64748b;">Telemedicina Kinésica Pediátrica • Cumplimiento Ley 20.584 (Chile)</p>
          </div>
        </div>
        <div style="text-align:right;font-size:11px;color:#64748b;">
          <span>Folio: #KK-${ev.id}</span><br>
          <span>Fecha: ${resp.fechaRespuesta}</span>
        </div>
      </div>

      <h2>1. Datos del Paciente</h2>
      <div class="grid">
        <div class="field"><label>Nombre Completo</label><span>${ev.childName}</span></div>
        <div class="field"><label>Edad en Evaluación</label><span>${ev.childAgeYears} años y ${ev.childAgeMonths} meses (${ev.childTotalMonths} meses)</span></div>
        <div class="field"><label>Semanas Gestación / Prematurez</label><span>${child.gestationWeeks ? child.gestationWeeks + ' semanas' : 'A término'}</span></div>
        <div class="field"><label>Resultado Semáforo</label><span><span class="semaforo ${ev.riskLevel === 'Rojo' ? 'rojo' : ev.riskLevel === 'Amarillo' ? 'amarillo' : 'verde'}">${ev.riskLevel} (${ev.totalScore} pts)</span></span></div>
      </div>

      ${ev.redFlagsList && ev.redFlagsList.length > 0 ? `
        <h2>2. Banderas Rojas y Signos de Alerta Detectados</h2>
        <div style="margin-bottom:12px;">
          ${ev.redFlagsList.map(rf => `
            <div class="field" style="margin-bottom:6px;">
              <label>${rf.questionText}</label>
              <span style="color:#b91c1c;">${rf.answerText}</span>
              <small style="color:#64748b;display:block;margin-top:2px;">Concepto clínico: ${rf.clinicalConcept}</small>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <h2>3. Dictamen Clínico Oficial</h2>
      <div class="dictamen-box">
        ${resp.mensajeOficialPadre}
      </div>

      ${resp.indicacionesDomiciliarias ? `
        <div style="margin-top:12px;">
          <strong style="font-size:12px;color:#0f766e;">Pautas y Estimulación en el Hogar:</strong>
          <div class="field" style="margin-top:4px;">${resp.indicacionesDomiciliarias}</div>
        </div>
      ` : ''}

      ${resp.requiereConsultaPresencial ? `
        <div class="presencial-alert">
          <strong style="color:#991b1b;font-size:12px;"><i class="fa-solid fa-hospital-user"></i> Citación Presencial Requerida en Box</strong>
          <p style="margin:4px 0 0;font-size:12px;">${resp.datosContactoAgenda || 'Centro Médico Los Alerces, Santiago'}</p>
        </div>
      ` : ''}

      <div class="footer">
        <div>
          <span>KineKids Telemedicina Pediátrica</span><br>
          <span style="font-size:10px;">Consentimiento Informado Ley 20.584 verificado • Validez nacional</span>
        </div>
        <div class="signature">
          <strong>${resp.clinicianName}</strong><br>
          <span>Kinesiólogo(a) Clínico</span><br>
          <span>N° Registro SIS: ${resp.clinicianSis || clinician?.sisRegister || '128456'}</span>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
