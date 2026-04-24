export async function resolveIdempotency<T>(
	idempotencyKey: string | undefined,
	findExisting: (key: string) => Promise<T | null>
): Promise<T | null> {
	if (!idempotencyKey) return null;
	return findExisting(idempotencyKey);
}
