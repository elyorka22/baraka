-- Включение Realtime для таблицы orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Включение Realtime для таблицы order_assignments
ALTER PUBLICATION supabase_realtime ADD TABLE order_assignments;

-- Включение Realtime для таблицы notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

