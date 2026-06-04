import api from "@/api/axios";
import type {
  Notification,
  NotificationAudience,
} from "@/features/notifications/notificationSlice";

type CreateNotificationPayload = Omit<Notification, "id" | "createdAt" | "read">;

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    return err.response?.data?.message || err.message || "Something went wrong";
  }
  return "Something went wrong";
};

export const notificationService = {
  async getAll(audience?: NotificationAudience): Promise<Notification[]> {
    try {
      const { data } = await api.get<Notification[]>("/notifications", {
        params: audience ? { audience } : undefined,
      });
      return data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(payload: CreateNotificationPayload): Promise<Notification> {
    try {
      const res = await api.post<Notification>("/notifications", payload);
      return res.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async markRead(id: number): Promise<number> {
    try {
      await api.patch(`/notifications/${id}/read`);
      return id;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },

  async markAllRead(audience: NotificationAudience): Promise<NotificationAudience> {
    try {
      await api.patch("/notifications/read-all", { audience });
      return audience;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error));
    }
  },
};

export default notificationService;
