-- Migration pour ajouter la gestion de stock global

-- Ajouter les champs de stock global au modèle Product
ALTER TABLE "Product" ADD COLUMN "globalStock" INTEGER DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "baseUnitId" TEXT;
ALTER TABLE "Product" ADD COLUMN "baseQuantity" DOUBLE PRECISION DEFAULT 1;

-- Ajouter une contrainte de clé étrangère pour baseUnitId
ALTER TABLE "Product" ADD CONSTRAINT "Product_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Créer un index pour améliorer les performances
CREATE INDEX "Product_baseUnitId_idx" ON "Product"("baseUnitId");

-- Mettre à jour les produits existants avec un stock global basé sur la somme des stocks des variants
UPDATE "Product" 
SET "globalStock" = (
    SELECT COALESCE(SUM(pv."stock" * COALESCE(pv."quantity", 1)), 0)
    FROM "ProductVariant" pv 
    WHERE pv."productId" = "Product"."id"
);

-- Mettre à jour baseUnitId avec l'unité du premier variant qui a une unité
UPDATE "Product" 
SET "baseUnitId" = (
    SELECT pv."unitId"
    FROM "ProductVariant" pv 
    WHERE pv."productId" = "Product"."id" 
    AND pv."unitId" IS NOT NULL
    LIMIT 1
);

-- Mettre à jour baseQuantity avec la plus petite quantité des variants
UPDATE "Product" 
SET "baseQuantity" = (
    SELECT COALESCE(MIN(pv."quantity"), 1)
    FROM "ProductVariant" pv 
    WHERE pv."productId" = "Product"."id" 
    AND pv."quantity" IS NOT NULL
    AND pv."quantity" > 0
);