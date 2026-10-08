import React from 'react';
import { Link } from 'react-router-dom';
import useAppStore from '../../store/appStore.js';
import styles from './BusinessDashboard.module.css';

const SEGMENT_COLORS = {
  first_time:           'badge-teal',
  returning_customer:   'badge-green',
  inactive:             'badge-amber',
  replenishment:        'badge-coral',
  unresolved_issue:     'badge-red',
  opted_out:            'badge-violet',
};

export default function BusinessDashboard() {
  const { merchantProfile, customers, journeys, catalogue, supportHandovers, purchaseHistory } = useAppStore();

  const activeJourneys  = journeys.filter(j => j.status === 'active').length;
  const closedJourneys  = journeys.filter(j => j.status === 'closed').length;
  const purchases       = journeys.filter(j => j.outcome === 'purchased').length;
  const openHandovers   = supportHandovers.filter(h => !h.resolved).length;
  const convToPurchase  = closedJourneys > 0 ? Math.round((purchases / closedJourneys) * 100) : 0;

  const segmentCounts = customers.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="page-title">{merchantProfile?.name ?? 'Business'} Dashboard</h1>
      <p className="page-sub">Goal: <strong>{merchantProfile?.goal?.replace(/_/g, ' ') ?? 'Not set'}</strong></p>

      {/* KPI row */}
      <div className={styles.kpiRow}>
        <div className="card">
          <div className={styles.kpiVal}>{customers.length}</div>
          <div className={styles.kpiLabel}>Customers</div>
          <Link to="/business/customers" className={styles.kpiLink}>View →</Link>
        </div>
        <div className="card">
          <div className={styles.kpiVal}>{activeJourneys}</div>
          <div className={styles.kpiLabel}>Active journeys</div>
          <Link to="/business/journeys" className={styles.kpiLink}>View →</Link>
        </div>
        <div className={`card ${purchases > 0 ? styles.kpiHighlight : ''}`}>
          <div className={styles.kpiVal}>{purchases}</div>
          <div className={styles.kpiLabel}>Verified purchases</div>
        </div>
        <div className="card">
          <div className={styles.kpiVal}>{convToPurchase}%</div>
          <div className={styles.kpiLabel}>Conv-to-purchase rate</div>
          <p className={styles.kpiNote}>estimated</p>
        </div>
        <div className={`card ${openHandovers > 0 ? styles.kpiUrgent : ''}`}>
          <div className={styles.kpiVal}>{openHandovers}</div>
          <div className={styles.kpiLabel}>Open support cases</div>
          <Link to="/business/support" className={styles.kpiLink}>Review →</Link>
        </div>
      </div>

      {/* Segment breakdown */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Customer segments</h2>
      {customers.length === 0 ? (
        <div className={`card ${styles.empty}`}>No customers yet. Import records during onboarding or add them on the Customers page.</div>
      ) : (
        <div className={styles.segmentGrid}>
          {Object.entries(segmentCounts).map(([seg, count]) => (
            <div key={seg} className={`card ${styles.segCard}`}>
              <div className={styles.segCount}>{count}</div>
              <span className={`badge ${SEGMENT_COLORS[seg] ?? 'badge-coral'}`}>{seg.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent journeys */}
      <h2 className="section-title" style={{ marginTop: 28 }}>Recent journeys</h2>
      {journeys.length === 0 ? (
        <div className={`card ${styles.empty}`}>No journeys started yet. Go to <Link to="/business/journeys">Journeys</Link> to begin.</div>
      ) : (
        <div className={styles.journeyList}>
          {journeys.slice(0, 5).map(j => (
            <div key={j.id} className={`card ${styles.journeyRow}`}>
              <div>
                <div className={styles.journeyTitle}>{j.customerName ?? 'Customer'} — {j.productName ?? 'Product'}</div>
                <div className={styles.journeyMeta}>{j.events?.length ?? 0} events · Started {fmtDate(j.createdAt)}</div>
              </div>
              <span className={`badge ${j.status === 'active' ? 'badge-green' : j.outcome === 'purchased' ? 'badge-teal' : 'badge-amber'}`}>
                {j.status === 'closed' ? (j.outcome ?? 'closed') : j.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pilotNote}>
        <strong>Hackathon note:</strong> Sample data demonstrates the reporting process. Figures do not prove real increases in retention or customer lifetime value.
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
