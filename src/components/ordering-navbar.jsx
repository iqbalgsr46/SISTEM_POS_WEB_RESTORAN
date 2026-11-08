"use client";

import { useRef } from "react";
import { Bell, Search, ShoppingCart, X } from "lucide-react";
import styles from "./ordering-navbar.module.css";

/** One navbar for both ordering channels and every viewport. */
export default function OrderingNavbar({
  greeting,
  searchQuery,
  onSearchChange,
  unreadCount,
  totalCartItems,
  onNotifications,
  onCart,
}) {
  const inputRef = useRef(null);

  return (
    <header data-ordering="menu-header" className={styles.header}>
      <div data-ordering="navbar-content" className={styles.content}>
        <div className={styles.identity}>
          <span suppressHydrationWarning className={styles.greeting}>{greeting}</span>
          <h1>Craving Elon Musk?</h1>
          <p>Delicious favorites, delivered fast.</p>
        </div>

        <div className={styles.toolbar}>
          <div role="search" aria-label="Pencarian menu" className={styles.search}>
            <Search size={19} strokeWidth={1.8} aria-hidden="true" className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="search"
              aria-label="Cari menu"
              placeholder="Cari menu favoritmu"
              autoComplete="off"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                className={styles.clear}
                onClick={() => {
                  onSearchChange("");
                  inputRef.current?.focus();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              data-ordering-action="notifications"
              aria-label="Lihat notifikasi promo"
              className={styles.action}
              onClick={onNotifications}
            >
              <Bell size={24} strokeWidth={1.8} aria-hidden="true" />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </button>
            <button
              type="button"
              data-ordering-action="cart"
              aria-label="Buka keranjang belanja"
              className={styles.action}
              onClick={onCart}
            >
              <ShoppingCart size={25} strokeWidth={1.8} aria-hidden="true" />
              {totalCartItems > 0 && <span className={styles.badge}>{totalCartItems > 99 ? "99+" : totalCartItems}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
