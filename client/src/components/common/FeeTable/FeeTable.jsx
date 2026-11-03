import React from 'react';

/**
 * Reusable FeeTable Component
 * Displays transparent grade tiers, annual tuition, term installments, and activity fees.
 */
export default function FeeTable({ tiers = [], currency = '₹', className = '' }) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className={`table-card ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            <th>Grade Level</th>
            <th>Stage</th>
            <th>Annual Tuition</th>
            <th>Term Installment</th>
            <th>Activity & Term Fee</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, idx) => (
            <tr key={idx}>
              <td><strong>{tier.gradeLevel}</strong></td>
              <td>{tier.stage}</td>
              <td>{currency} {tier.annualTuition?.toLocaleString('en-IN')}</td>
              <td>{currency} {tier.termInstallment?.toLocaleString('en-IN')}</td>
              <td>{currency} {tier.labFee?.toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

