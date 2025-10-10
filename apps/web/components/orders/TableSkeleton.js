"use client";

/* ============================================================
   TABLE SKELETON (LOADING PLACEHOLDER)
   ============================================================ */
export default function TableSkeleton() {
  return (
    <div className="table-container w-full animate-pulse">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: 8 }).map((_, index) => (
              <th key={index}>
                <div className="h-4 w-16 rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="h-5 w-full rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
