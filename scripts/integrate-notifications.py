import re

def update_file(filepath, is_dine_in=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    text = text.replace('\r\n', '\n')
    
    print(f'\n=== Updating {filepath} ===')
    
    # 1. Add imports
    if 'NotificationDrawer' not in text:
        text = text.replace(
            'import { requestRestaurant } from "@/lib/restaurant-api";',
            'import { requestRestaurant } from "@/lib/restaurant-api";\nimport NotificationDrawer from "@/components/notification-drawer";\nimport { useOrderNotifications } from "@/lib/use-order-notifications";'
        )
        print('  Added NotificationDrawer & useOrderNotifications imports')
    
    # 2. Add hook inside component
    component_name = "DineInPage" if is_dine_in else "TakeawayPage"
    old_state_start = f'export default function {component_name}() {{\n'
    new_state_start = f'''export default function {component_name}() {{
  // Real-time order notifications + push notification
  const {{
    notifications,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    enablePush,
    permissionStatus,
  }} = useOrderNotifications();
'''
    text = text.replace(old_state_start, new_state_start)
    print('  Added useOrderNotifications hook call')
    
    # 3. Replace bell button onClick and badge count
    # Find the bell button pattern:
    # onClick={() => setIsNotificationOpen(true)} -> onClick={() => { setIsDrawerOpen(true); markAllAsRead(); }}
    text = text.replace(
        'onClick={() => setIsNotificationOpen(true)}',
        'onClick={() => { setIsDrawerOpen(true); markAllAsRead(); }}'
    )
    
    # Replace the hardcoded "3" badge with dynamic unreadCount
    # Look for: <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD400] text-gray-950 text-[9px] font-extrabold flex items-center justify-center shadow-xs">\n                    3\n                  </span>
    old_badge = '''                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD400] text-gray-950 text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    3
                  </span>'''
    
    new_badge = '''                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD400] text-gray-950 text-[9px] font-extrabold flex items-center justify-center shadow-xs animate-in zoom-in duration-150">
                      {unreadCount}
                    </span>
                  )}'''
    
    text = text.replace(old_badge, new_badge)
    print('  Replaced badge counter with dynamic unreadCount')
    
    # 4. Replace old isNotificationOpen modal with NotificationDrawer component
    # Find the old modal block and replace it
    old_modal_comment = '{/* MODAL NOTIFIKASI PROMO */}'
    old_modal_start = '{isNotificationOpen && ('
    
    # Add NotificationDrawer before the closing </main> or at the bottom
    drawer_jsx = '''
      {/* DRAWER NOTIFIKASI PESANAN (REAL-TIME STATUS DARI PEMBAYARAN - SIAP SAJI) */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onClearAll={clearAll}
        onNotificationClick={(item) => {
          markAsRead(item.id);
          setIsDrawerOpen(false);
          if (item.url) setView("tracking");
        }}
      />
'''
    
    # Replace the old notification modal block
    if '{isNotificationOpen && (' in text:
        # Find where it ends
        start_idx = text.find('{isNotificationOpen && (')
        # Find the matching closing block
        end_idx = text.find(')}', start_idx)
        if end_idx != -1:
            # Look for the outer )}
            # The modal ends with </div>\n          </div>\n        )}
            target = text[start_idx:end_idx + 2]
            # Verify it contains "Notifikasi Promo" or similar
            if 'Notifikasi' in target:
                text = text.replace(target, drawer_jsx)
                print('  Replaced old notification modal with NotificationDrawer')
    
    # 5. Hook into order stage updates to add notifications:
    # When payment is confirmed (handleConfirmPayment or similar)
    # Search for tracking / stage simulation
    # Let's add notification triggers to kitchenStage updates:
    # kitchenStage 1: 'paid' -> Pesanan diterima
    # kitchenStage 2: 'cooking' -> Sedang dimasak
    # kitchenStage 3: 'ready' -> Siap disajikan
    
    old_stage_1 = 'setKitchenStage(1);'
    new_stage_1 = '''setKitchenStage(1);
    addNotification({
      type: "paid",
      title: "Pembayaran Diterima!",
      message: "Pesanan kamu sudah masuk ke sistem antrean dapur.",
      orderNumber: activeOrderNumber || "001",
      url: "''' + ('/dine-in' if is_dine_in else '/takeaway') + '''",
    });
    enablePush();'''
    
    old_stage_2 = 'setKitchenStage(2);'
    new_stage_2 = '''setKitchenStage(2);
    addNotification({
      type: "cooking",
      title: "Pesanan Sedang Dimasak",
      message: "Chef sedang menyiapkan mie dan menu pesananmu.",
      orderNumber: activeOrderNumber || "001",
      url: "''' + ('/dine-in' if is_dine_in else '/takeaway') + '''",
    });'''
    
    old_stage_3 = 'setKitchenStage(3);'
    new_stage_3 = '''setKitchenStage(3);
    addNotification({
      type: "ready",
      title: "Pesanan Siap Saji!",
      message: "Pesanan kamu sudah matang dan siap diambil di counter!",
      orderNumber: activeOrderNumber || "001",
      url: "''' + ('/dine-in' if is_dine_in else '/takeaway') + '''",
    });'''
    
    text = text.replace(old_stage_1, new_stage_1)
    text = text.replace(old_stage_2, new_stage_2)
    text = text.replace(old_stage_3, new_stage_3)
    print('  Added notification triggers to kitchen stages (paid, cooking, ready)')
    
    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print(f'  Saved {filepath}')

update_file('src/app/takeaway/page.jsx', False)
update_file('src/app/dine-in/page.jsx', True)
