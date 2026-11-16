-- =============================================================================
-- Règles Row-Level Security (Supabase / PostgreSQL) & Contraintes Base de Données
-- STARTBILL Canada — Conformité RBAC & LPRPDE (PIPEDA)
-- =============================================================================

-- 1. Trigger PostgreSQL interdisant la suppression ou la rétrogradation du Super Admin
CREATE OR REPLACE FUNCTION prevent_super_admin_deletion_or_downgrade()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF OLD.email = 'contact.startbill@gmail.com' OR OLD.role = 'super_admin' OR OLD.immutable = TRUE THEN
      RAISE EXCEPTION 'Protection critique : le compte Super Administrateur (%) est unique et non supprimable.', OLD.email;
    END IF;
    RETURN OLD;
  END IF;

  IF (TG_OP = 'UPDATE') THEN
    IF OLD.email = 'contact.startbill@gmail.com' AND (NEW.role <> 'super_admin' OR NEW.email <> 'contact.startbill@gmail.com') THEN
      RAISE EXCEPTION 'Protection critique : impossible de modifier l''email ou de rétrograder le rôle du Super Administrateur.';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_super_admin ON users;
CREATE TRIGGER trg_protect_super_admin
  BEFORE UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_super_admin_deletion_or_downgrade();

-- 2. Activation RLS sur les tables sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Fonction helper vérifiant strictement l'email et le rôle
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND email = 'contact.startbill@gmail.com'
      AND role = 'super_admin'
      AND email_verified = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Politiques Utilisateurs
CREATE POLICY "users_read_own_or_admin" ON users
  FOR SELECT USING (auth.uid() = id OR is_super_admin());

CREATE POLICY "users_update_own_non_privileged_or_admin" ON users
  FOR UPDATE USING (auth.uid() = id OR is_super_admin())
  WITH CHECK (
    is_super_admin()
    OR (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "users_delete_admin_only_non_immutable" ON users
  FOR DELETE USING (
    is_super_admin()
    AND email <> 'contact.startbill@gmail.com'
    AND role <> 'super_admin'
    AND immutable = FALSE
  );

-- Politiques Audit Logs (Append-only pour Super Admin)
CREATE POLICY "audit_logs_admin_read" ON admin_audit_logs
  FOR SELECT USING (is_super_admin());

CREATE POLICY "audit_logs_admin_insert" ON admin_audit_logs
  FOR INSERT WITH CHECK (is_super_admin());
