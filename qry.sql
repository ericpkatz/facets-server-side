SELECT
  "block"."sizeId", count(*), sizes.name
FROM
  "blocks" AS "block"
JOIN
  "sizes"
ON
  "sizes".id = "block"."sizeId"
--WHERE 
-- "block"."colorId" = 1 AND "block"."shapeId" = 2
GROUP BY "block"."sizeId", sizes.name
HAVING count(*) > 120
