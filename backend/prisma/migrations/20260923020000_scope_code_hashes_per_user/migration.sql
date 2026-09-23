-- DropIndex
DROP INDEX "email_verification_tokens_token_hash_key";

-- DropIndex
DROP INDEX "password_reset_tokens_token_hash_key";

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_token_hash_idx" ON "email_verification_tokens"("user_id", "token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_token_hash_idx" ON "password_reset_tokens"("user_id", "token_hash");
