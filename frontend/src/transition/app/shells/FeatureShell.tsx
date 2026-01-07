/**
 * FeatureShell - Feature-level skeleton
 * Tables, charts, forms placeholders
 * This shell appears while feature-specific data is loading
 */

export function FeatureShell({ variant = 'table' }: FeatureShellProps) {
  if (variant === 'table') {
    return <TableSkeleton />;
  }

  if (variant === 'chart') {
    return <ChartSkeleton />;
  }

  if (variant === 'form') {
    return <FormSkeleton />;
  }

  return <GenericSkeleton />;
}

interface FeatureShellProps {
  variant?: 'table' | 'chart' | 'form' | 'generic';
}

function TableSkeleton() {
  return (
    <div className="feature-shell feature-shell--table">
      <div className="skeleton skeleton--toolbar" />

      <div className="table-skeleton">
        <div className="table-skeleton__header">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton skeleton--table-header" />
          ))}
        </div>

        {[1, 2, 3, 4, 5, 6, 7, 8].map(row => (
          <div key={row} className="table-skeleton__row">
            {[1, 2, 3, 4, 5].map(col => (
              <div key={col} className="skeleton skeleton--table-cell" />
            ))}
          </div>
        ))}
      </div>

      <div className="skeleton skeleton--pagination" />

      <style>{`
        .feature-shell {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton--toolbar {
          height: 48px;
        }

        .table-skeleton {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-skeleton__header,
        .table-skeleton__row {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1px;
          background: var(--color-border);
        }

        .table-skeleton__header {
          background: var(--color-muted-100);
        }

        .skeleton--table-header,
        .skeleton--table-cell {
          height: 48px;
          background: var(--color-surface);
          margin: 1px;
        }

        .skeleton--pagination {
          height: 40px;
          width: 300px;
          margin-left: auto;
        }
      `}</style>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="feature-shell feature-shell--chart">
      <div className="skeleton skeleton--chart-header" />
      <div className="skeleton skeleton--chart-body" />
      <div className="skeleton skeleton--chart-legend" />

      <style>{`
        .feature-shell--chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .skeleton--chart-header {
          height: 40px;
          width: 50%;
        }

        .skeleton--chart-body {
          height: 400px;
        }

        .skeleton--chart-legend {
          height: 32px;
          width: 300px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="feature-shell feature-shell--form">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="form-field">
          <div className="skeleton skeleton--label" />
          <div className="skeleton skeleton--input" />
        </div>
      ))}

      <div className="form-actions">
        <div className="skeleton skeleton--button" />
        <div className="skeleton skeleton--button" />
      </div>

      <style>{`
        .feature-shell--form {
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton--label {
          height: 20px;
          width: 120px;
        }

        .skeleton--input {
          height: 40px;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .skeleton--button {
          height: 40px;
          width: 120px;
        }
      `}</style>
    </div>
  );
}

function GenericSkeleton() {
  return (
    <div className="feature-shell feature-shell--generic">
      <div className="skeleton skeleton--block" />
      <div className="skeleton skeleton--block" />
      <div className="skeleton skeleton--block" />

      <style>{`
        .feature-shell--generic {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .skeleton--block {
          height: 200px;
        }
      `}</style>
    </div>
  );
}
