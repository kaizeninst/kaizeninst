// apps/api/src/utils/categoryTree.js
import { QueryTypes } from "sequelize";
import { sequelize } from "../db/sequelize.js";

// MariaDB 10.4 รองรับ WITH RECURSIVE
export async function getSelfAndDescendantIds(rootId) {
  const rows = await sequelize.query(
    `
    WITH RECURSIVE cte AS (
      SELECT id, parent_id
      FROM categories
      WHERE id = :rootId
      UNION ALL
      SELECT c.id, c.parent_id
      FROM categories c
      INNER JOIN cte ON c.parent_id = cte.id
    )
    SELECT id FROM cte
    `,
    { replacements: { rootId }, type: QueryTypes.SELECT }
  );
  return rows.map((r) => r.id);
}
