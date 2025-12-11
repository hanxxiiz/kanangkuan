export type Notification = {
  id: number;
  created_at: string | null;
  user_id: string | null;
  type: string | null;
  message: string | null;
  read: boolean | null;
};

export type NotificationFilter = "newest" | "oldest" | "unread" | "read";