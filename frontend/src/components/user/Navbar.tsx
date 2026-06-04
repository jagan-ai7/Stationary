import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
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
import { logout } from "@/features/auth/authSlice";
import ThemeToggle from "@/components/common/ThemeToggle";
import NotificationBell from "@/components/common/NotificationBell";
import { useEffect } from "react";
import { fetchCart } from "@/features/cart/cartSlice";

export default function Navbar() {
  const { user, token } = useAppSelector((s) => s.auth);
  const cartCount = useAppSelector((s) => s.cart.items.length);
  const dispatch = useAppDispatch();
  const nav = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors ${isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`;

  useEffect(() => {
    if (token) {
      dispatch(fetchCart());
    }
  }, [dispatch, token]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Inkwell
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkCls}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkCls}>
            Shop
          </NavLink>
          {token && (
            <>
              <NavLink to="/orders" className={linkCls}>
                Orders
              </NavLink>
              <NavLink to="/chat" className={linkCls}>
                Help
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {token && <NotificationBell audience="user" />}
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Cart">
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Profile">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user ? `${user.firstName} ${user.lastName}` : "Account"}
                  {user && (
                    <div className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => nav("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => nav("/orders")}>My orders</DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => nav("/admin")}>Admin portal</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    dispatch(logout());
                    nav("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
