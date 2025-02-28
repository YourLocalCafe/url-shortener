/*
  Warnings:

  - A unique constraint covering the columns `[shortUrl]` on the table `Urls` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Urls_shortUrl_key" ON "Urls"("shortUrl");
