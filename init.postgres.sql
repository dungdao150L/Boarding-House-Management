-- ============================================
-- INIT DATABASE - QUẢN LÝ PHÒNG TRỌ / CHUNG CƯ MINI
-- PostgreSQL
-- Gồm: Schema + Index + Ràng buộc hợp đồng active + Seed data
-- ============================================

-- ============================================
-- RESET DATABASE TABLES
-- ============================================

DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS utility_readings CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 1. USERS
-- Quản lý tài khoản đăng nhập
-- Role: admin, staff, tenant
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'staff', 'tenant')),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. ROOMS
-- Quản lý phòng
-- ============================================

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    floor INTEGER,
    area DECIMAL(10, 2),
    base_price DECIMAL(12, 2) NOT NULL CHECK (base_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'maintenance')),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. TENANTS
-- Quản lý khách thuê
-- ============================================

CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    identity_number VARCHAR(30) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenants_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- ============================================
-- 4. CONTRACTS
-- Quản lý hợp đồng thuê phòng
-- ============================================

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    deposit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
    monthly_rent DECIMAL(12, 2) NOT NULL CHECK (monthly_rent >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'ended', 'cancelled')),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_contracts_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_contracts_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_contract_dates
        CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================
-- 5. UTILITY_READINGS
-- Quản lý chỉ số điện nước theo phòng và tháng
-- ============================================

CREATE TABLE utility_readings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    month VARCHAR(7) NOT NULL,
    electricity_old DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (electricity_old >= 0),
    electricity_new DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (electricity_new >= 0),
    water_old DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (water_old >= 0),
    water_new DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (water_new >= 0),
    electricity_unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (electricity_unit_price >= 0),
    water_unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (water_unit_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_utility_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_utility_room_month
        UNIQUE (room_id, month),

    CONSTRAINT chk_electricity_reading
        CHECK (electricity_new >= electricity_old),

    CONSTRAINT chk_water_reading
        CHECK (water_new >= water_old)
);

-- ============================================
-- 6. INVOICES
-- Quản lý hóa đơn tổng
-- ============================================

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL,
    contract_id INTEGER NOT NULL,
    month VARCHAR(7) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid'
        CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue', 'cancelled')),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_invoices_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_invoices_contract
        FOREIGN KEY (contract_id)
        REFERENCES contracts(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_invoice_contract_month
        UNIQUE (contract_id, month),

    CONSTRAINT chk_invoice_paid_amount
        CHECK (paid_amount <= total_amount),

    CONSTRAINT chk_invoice_due_date
        CHECK (due_date IS NULL OR due_date >= issue_date)
);

-- ============================================
-- 7. INVOICE_ITEMS
-- Chi tiết từng khoản trong hóa đơn
-- ============================================

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    item_type VARCHAR(30) NOT NULL
        CHECK (item_type IN ('rent', 'electricity', 'water', 'service', 'other')),
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),

    CONSTRAINT fk_invoice_items_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE
);

-- ============================================
-- 8. PAYMENTS
-- Quản lý thanh toán hóa đơn
-- ============================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    method VARCHAR(30) NOT NULL DEFAULT 'cash'
        CHECK (method IN ('cash', 'bank_transfer', 'momo', 'other')),
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payments_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE
);

-- ============================================
-- 9. MAINTENANCE_REQUESTS
-- Quản lý yêu cầu sửa chữa / bảo trì
-- ============================================

CREATE TABLE maintenance_requests (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    tenant_id INTEGER,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'done', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_room
        FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_maintenance_tenant
        FOREIGN KEY (tenant_id)
        REFERENCES tenants(id)
        ON DELETE SET NULL
);

-- ============================================
-- INDEX
-- Dùng để tối ưu tìm kiếm, lọc, load test Level 2 / Level 3
-- ============================================

CREATE INDEX idx_rooms_status ON rooms(status);

CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_tenants_identity_number ON tenants(identity_number);

CREATE INDEX idx_contracts_room_id ON contracts(room_id);
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);

CREATE INDEX idx_utility_room_month ON utility_readings(room_id, month);

CREATE INDEX idx_invoices_room_id ON invoices(room_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_contract_id ON invoices(contract_id);
CREATE INDEX idx_invoices_month ON invoices(month);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

CREATE INDEX idx_maintenance_room_id ON maintenance_requests(room_id);
CREATE INDEX idx_maintenance_tenant_id ON maintenance_requests(tenant_id);
CREATE INDEX idx_maintenance_status ON maintenance_requests(status);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- RÀNG BUỘC ĐẶC BIỆT CHO HỢP ĐỒNG ACTIVE
-- Một phòng chỉ được có một hợp đồng active cùng lúc
-- ============================================

CREATE UNIQUE INDEX uq_active_contract_per_room
ON contracts(room_id)
WHERE status = 'active';

-- ============================================
-- SEED DATA MẪU
-- ============================================

-- USERS
INSERT INTO users (username, password_hash, role, full_name, email, phone)
VALUES
('admin', '$2b$10$example_admin_hash', 'admin', 'Quản trị viên', 'admin@example.com', '0900000000'),
('staff01', '$2b$10$example_staff_hash', 'staff', 'Nhân viên 01', 'staff01@example.com', '0900000001'),
('tenant01', '$2b$10$example_tenant_hash', 'tenant', 'Nguyễn Văn An', 'tenant01@example.com', '0901234567');

-- ROOMS
INSERT INTO rooms (room_number, floor, area, base_price, status, description)
VALUES
('A101', 1, 25.00, 2500000, 'available', 'Phòng tầng 1, có cửa sổ'),
('A102', 1, 28.00, 2800000, 'available', 'Phòng tầng 1, có ban công'),
('B201', 2, 30.00, 3200000, 'maintenance', 'Phòng đang sửa máy lạnh'),
('B202', 2, 32.00, 3500000, 'available', 'Phòng rộng, đầy đủ nội thất');

-- TENANTS
INSERT INTO tenants (
    user_id,
    full_name,
    phone,
    email,
    identity_number,
    date_of_birth,
    address
)
VALUES
(3, 'Nguyễn Văn An', '0901234567', 'tenant01@example.com', '079201000001', '2001-05-12', 'TP.HCM'),
(NULL, 'Trần Thị Bình', '0912345678', 'binh@example.com', '079202000002', '2002-08-20', 'Đồng Nai');

-- CONTRACTS
INSERT INTO contracts (
    room_id,
    tenant_id,
    start_date,
    end_date,
    deposit_amount,
    monthly_rent,
    status,
    note
)
VALUES
(1, 1, '2026-07-01', '2027-07-01', 2500000, 2500000, 'active', 'Hợp đồng thuê phòng A101 trong 1 năm');

-- Cập nhật trạng thái phòng A101 thành đang thuê
UPDATE rooms
SET status = 'occupied'
WHERE id = 1;

-- UTILITY_READINGS
INSERT INTO utility_readings (
    room_id,
    month,
    electricity_old,
    electricity_new,
    water_old,
    water_new,
    electricity_unit_price,
    water_unit_price
)
VALUES
(1, '2026-07', 100, 150, 20, 30, 3500, 15000);

-- INVOICES
INSERT INTO invoices (
    room_id,
    tenant_id,
    contract_id,
    month,
    issue_date,
    due_date,
    total_amount,
    paid_amount,
    status,
    note
)
VALUES
(1, 1, 1, '2026-07', '2026-07-01', '2026-07-10', 2925000, 0, 'unpaid', 'Hóa đơn tháng 07/2026');

-- INVOICE_ITEMS
INSERT INTO invoice_items (
    invoice_id,
    item_type,
    description,
    quantity,
    unit_price,
    amount
)
VALUES
(1, 'rent', 'Tiền phòng tháng 07/2026', 1, 2500000, 2500000),
(1, 'electricity', 'Tiền điện tháng 07/2026', 50, 3500, 175000),
(1, 'water', 'Tiền nước tháng 07/2026', 10, 15000, 150000),
(1, 'service', 'Phí dịch vụ tháng 07/2026', 1, 100000, 100000);

-- MAINTENANCE_REQUESTS
INSERT INTO maintenance_requests (
    room_id,
    tenant_id,
    title,
    description,
    status,
    priority
)
VALUES
(1, 1, 'Máy lạnh không hoạt động', 'Máy lạnh phòng A101 không lạnh từ tối qua', 'pending', 'high');
