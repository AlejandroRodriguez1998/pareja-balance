export type LocalBallot = { choice: number; salt: string };
export function ballotStorageKey(pairId: string, pollId: string, uid: string) {
  return `pareja-ballot-v1:${pairId}:${pollId}:${uid}`;
}
export async function ballotHash(pollId: string, uid: string, ballot: LocalBallot) {
  const input = new TextEncoder().encode(JSON.stringify([pollId, uid, ballot.choice, ballot.salt]));
  const hash = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
