export interface PresenceEntry {
  user_id: string;
  ready: boolean;
  online_at: string;
}

export interface RealtimeProps {
  challengeId: string;
  user: { id: string };
  challenge: { id: string; host_id: string };
}