import { Bell } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchNotifications,
  markAllReadAsync,
  markReadAsync,
  type NotificationAudience,
} from "@/features/notifications/notificationSlice";

export default function NotificationBell({ audience }: { audience: NotificationAudience }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.notifications.items);

  useEffect(() => {
    dispatch(fetchNotifications(audience));
  }, [dispatch, audience]);

  const filtered = useMemo(() => items.filter((n) => n.audience === audience), [items, audience]);
  const unread = filtered.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              className="text-xs text-primary hover:underline"
              onClick={() => dispatch(markAllReadAsync(audience))}
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filtered.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
        {filtered.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex flex-col items-start gap-1 py-2"
            onSelect={() => {
              if (!n.read) dispatch(markReadAsync(n.id));
            }}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-medium">{n.title}</span>
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">{n.message}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
