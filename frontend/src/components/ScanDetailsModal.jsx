import './ScanDetailsModal.css';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Sprout, Bug, Droplets, FileText, Download, ArrowDown, CheckCircle2, CalendarDays, Leaf } from 'lucide-react';

const readText = (value) => {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').join('\n').trim();
  return typeof value?.value === 'string' ? value.value.trim() : '';
};

const preventionPoints = (text) => {
  const lines = text.split(/\r?\n|\s*•\s*/).map((line) => line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, '').trim()).filter(Boolean);
  return lines.length > 1 ? lines : text.split(/(?<=[.!?])\s+(?=[A-Z])/).map((line) => line.trim()).filter(Boolean);
};

function ReportSection({ id, icon: Icon, title, subtitle, tone = 'green', children }) {
  return (
    <section id={id} className={`report-section report-section-${tone}`} aria-labelledby={id + '-heading'}>
      <header className="report-section-heading">
        <span className="report-section-icon"><Icon size={19} strokeWidth={1.7} aria-hidden="true" /></span>
        <div><h3 id={id + '-heading'}>{title}</h3><p>{subtitle}</p></div>
      </header>
      <div className="report-section-content">{children}</div>
    </section>
  );
}

function ReportDialog({ result, onClose, imageUrl }) {
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const uniqueId = useId();
  const titleId = uniqueId + '-title';
  const description = readText(result.diseaseDescription);
  const prevention = readText(result.prevention);
  const application = readText(result.howToUse);
  const biological = readText(result.biologicalTreatment);
  const pesticide = readText(result.pesticide);
  const dosage = readText(result.dosage);
  const interval = readText(result.sprayInterval);
  const recommendation = readText(result.recommendation);
  const crop = readText(result.cropName) || 'Unidentified crop';
  const healthy = result.isHealthy === true || result.diseaseDetected === 'Healthy';
  const diagnosis = healthy ? 'No disease detected' : readText(result.diseaseDetected) || 'Assessment unavailable';
  const rawConfidence = result.confidence;
  const numericConfidence = typeof rawConfidence === 'number' || (typeof rawConfidence === 'string' && rawConfidence.trim()) ? Number(rawConfidence) : NaN;
  const confidence = Number.isFinite(numericConfidence) && numericConfidence >= 0 && numericConfidence <= 100
    ? Math.round(numericConfidence <= 1 ? numericConfidence * 100 : numericConfidence)
    : null;
  const date = result.scannedAt ? new Date(result.scannedAt) : null;
  const scanDate = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const hasCare = !!(pesticide || dosage || interval || application || recommendation);
  const sections = [
    ...(description ? [{ key: 'overview', label: 'Overview', icon: Bug }] : []),
    ...(hasCare ? [{ key: 'care', label: 'Care plan', icon: Droplets }] : []),
    ...(prevention ? [{ key: 'prevention', label: 'Prevention', icon: ShieldCheck }] : []),
    ...(biological ? [{ key: 'alternatives', label: 'Alternatives', icon: Sprout }] : []),
  ];

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function jumpToSection(key) {
    const container = bodyRef.current;
    const section = document.getElementById(uniqueId + '-' + key);
    if (!container || !section) return;
    container.scrollTo({
      top: container.scrollTop + section.getBoundingClientRect().top - container.getBoundingClientRect().top - 20,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }

  function downloadReport() {
    const lines = ['CROPPILOT — CROP HEALTH REPORT', '', 'Crop: ' + crop, 'Assessment: ' + diagnosis];
    if (confidence !== null) lines.push('Model confidence: ' + confidence + '%');
    if (scanDate) lines.push('Scan date: ' + scanDate);
    if (description) lines.push('', 'OVERVIEW', description);
    if (hasCare) {
      lines.push('', 'CARE PLAN');
      if (pesticide) lines.push('Treatment: ' + pesticide);
      if (dosage) lines.push('Dosage: ' + dosage);
      if (interval) lines.push('Spray interval: ' + interval);
      if (application) lines.push('', 'Application instructions', application);
      if (recommendation) lines.push('', 'Recommendation', recommendation);
    }
    if (prevention) lines.push('', 'PREVENTION', prevention);
    if (biological) lines.push('', 'BIOLOGICAL ALTERNATIVES', biological);
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'croppilot-' + (crop.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'crop') + '-report.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <dialog ref={dialogRef} className="report-dialog" aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
      <header className="report-header">
        <div className="report-header-title">
          <span className="report-document-icon"><FileText size={23} strokeWidth={1.6} aria-hidden="true" /></span>
          <div><p className="report-eyebrow">CropPilot / Scan insights</p><h2 id={titleId}>Crop health report</h2></div>
        </div>
        <button type="button" className="report-close" onClick={onClose} aria-label="Close crop health report" autoFocus><X size={21} /></button>
      </header>

      <div ref={bodyRef} className="report-body" tabIndex={0} aria-label="Crop health report content">
        <section className={`report-summary ${healthy ? 'report-summary-healthy' : ''}`} aria-label="Scan summary">
          <div className="report-summary-main">
            {imageUrl && <img className="report-crop-image" src={imageUrl} alt={crop + ' crop scan'} />}
            <div className="min-w-0">
              <span className="report-status">{healthy ? <CheckCircle2 size={14} /> : <Bug size={14} />}{healthy ? 'Healthy scan' : 'Crop assessment'}</span>
              <h3>{diagnosis}</h3>
              <div className="report-summary-meta"><span><Leaf size={14} />{crop}</span>{scanDate && <span><CalendarDays size={14} />{scanDate}</span>}</div>
            </div>
          </div>
          {confidence !== null && <div className="report-confidence"><p><strong>{confidence}<span>%</span></strong><span>Model confidence</span></p><div className="report-confidence-track" role="meter" aria-label="Model confidence" aria-valuenow={confidence} aria-valuemin={0} aria-valuemax={100} aria-valuetext={confidence + ' percent'}><span style={{ width: confidence + '%' }} /></div><small>Confidence in this image assessment</small></div>}
        </section>

        {sections.length > 1 && <nav className="report-jump-links" aria-label="Jump to report section">{sections.map(({ key, label, icon: Icon }) => <button type="button" key={key} onClick={() => jumpToSection(key)}><Icon size={14} />{label}<ArrowDown size={12} /></button>)}</nav>}

        <div className="report-sections">
          {description && <ReportSection id={uniqueId + '-overview'} icon={Bug} title="Understand the diagnosis" subtitle="What the assessment says about your crop"><p className="report-prose">{description}</p></ReportSection>}

          {hasCare && <ReportSection id={uniqueId + '-care'} icon={Droplets} title="Treatment & application" subtitle="Care details returned with your scan" tone="amber">
            {(pesticide || dosage || interval) && <dl className="report-treatment-grid">{[
              ['Recommended treatment', pesticide], ['Application dosage', dosage], ['Spray interval', interval],
            ].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
            {application && <div className="report-text-block"><h4>How to apply</h4><p className="report-prose">{application}</p></div>}
            {recommendation && recommendation !== pesticide && <div className="report-recommendation"><h4>Recommendation</h4><p className="report-prose">{recommendation}</p></div>}
          </ReportSection>}

          {prevention && <ReportSection id={uniqueId + '-prevention'} icon={ShieldCheck} title="Prevent it from coming back" subtitle="Practical prevention notes for ongoing crop care">
            <ul className="report-prevention-list">{preventionPoints(prevention).map((tip, index) => <li key={index}><span className="report-tip-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p className="report-prose">{tip}</p></li>)}</ul>
          </ReportSection>}

          {biological && <ReportSection id={uniqueId + '-alternatives'} icon={Sprout} title="Biological alternatives" subtitle="Additional treatment options included in the assessment"><p className="report-prose">{biological}</p></ReportSection>}

          {!sections.length && <div className="report-empty"><FileText size={30} strokeWidth={1.5} /><h3>No additional notes for this scan</h3><p>Your crop assessment is shown above. Extra care and prevention details were not included.</p></div>}
        </div>
        <p className="report-source"><Sprout size={14} /> CropPilot · Crop scan insights</p>
      </div>

      <footer className="report-footer">
        <p>Keep a copy for your crop records.</p>
        <div className="report-footer-actions"><button type="button" className="report-download" onClick={downloadReport}><Download size={16} /> Download report</button><button type="button" className="report-done" onClick={onClose}>Done <CheckCircle2 size={16} /></button></div>
      </footer>
    </dialog>
  );
}

export default function ScanDetailsModal({ result, onClose, imageUrl }) {
  if (!result) return null;
  return createPortal(<ReportDialog result={result} onClose={onClose} imageUrl={imageUrl || result.imageUrl} />, document.body);
}
