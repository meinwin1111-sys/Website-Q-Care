CREATE DATABASE qcare_db;
GO

USE qcare_db;
GO

/* ============================================================================
   1. BẢNG USERS — khách hàng & admin (đăng nhập chung 1 bảng, phân biệt bằng role)
   ============================================================================ */
CREATE TABLE users (
    user_id       INT IDENTITY(1,1) PRIMARY KEY,
    full_name     NVARCHAR(150) NOT NULL,
    email         NVARCHAR(150) NOT NULL,
    phone         NVARCHAR(15)  NULL,
    password      NVARCHAR(255) NOT NULL,        -- nên lưu hash (bcrypt/argon2) khi triển khai thật
    role          NVARCHAR(20)  NOT NULL DEFAULT 'customer',
    created_at    DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    updated_at    DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT uq_users_email  UNIQUE (email),
    CONSTRAINT chk_users_role  CHECK (role IN ('customer','admin')),
    CONSTRAINT chk_users_phone CHECK (phone IS NULL OR (LEN(phone) = 10 AND phone NOT LIKE '%[^0-9]%'))
);
GO

/* ============================================================================
   2. BẢNG PETS — thú cưng của khách hàng (theo PET_OPTIONS trong FE)
   ============================================================================ */
CREATE TABLE pets (
    pet_id        INT IDENTITY(1,1) PRIMARY KEY,
    owner_id      INT NOT NULL,
    name          NVARCHAR(100) NOT NULL,
    pet_type      NVARCHAR(20)  NOT NULL,
    custom_type   NVARCHAR(100) NULL,             -- dùng khi pet_type = 'other'
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_pets_type CHECK (pet_type IN ('dog','cat','bird','hamster','rabbit','other')),
    CONSTRAINT chk_pets_custom_type CHECK (pet_type <> 'other' OR custom_type IS NOT NULL)
);
GO

/* ============================================================================
   3. BẢNG SERVICE_CATEGORIES — theo CATEGORIES trong FE
   ============================================================================ */
CREATE TABLE service_categories (
    category_id   INT IDENTITY(1,1) PRIMARY KEY,
    code          NVARCHAR(30)  NOT NULL,
    name          NVARCHAR(100) NOT NULL,
    CONSTRAINT uq_category_code UNIQUE (code)
);
GO

/* ============================================================================
   4. BẢNG SERVICES — theo mảng SERVICES trong FE
   ============================================================================ */
CREATE TABLE services (
    service_id    INT IDENTITY(1,1) PRIMARY KEY,
    category_id   INT NOT NULL,
    title         NVARCHAR(150) NOT NULL,
    subtitle      NVARCHAR(255) NULL,
    price         DECIMAL(10,0) NOT NULL,
    duration      NVARCHAR(50)  NULL,
    image         NVARCHAR(500) NULL,
    description   NVARCHAR(MAX) NULL,
    is_active     BIT NOT NULL DEFAULT 1,
    created_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES service_categories(category_id),
    CONSTRAINT chk_services_price CHECK (price >= 0)
);
GO

/* Cho phép chèn ID dịch vụ tường minh (1..9) giống FE */
SET IDENTITY_INSERT services ON;
GO

/* Chi tiết bảng giá của từng dịch vụ (priceBreakdown trong FE) */
CREATE TABLE service_price_breakdown (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    service_id    INT NOT NULL,
    label         NVARCHAR(150) NOT NULL,
    price         DECIMAL(10,0) NOT NULL,
    CONSTRAINT fk_spb_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);
GO

/* Các bước quy trình thực hiện dịch vụ (steps trong FE) */
CREATE TABLE service_steps (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    service_id    INT NOT NULL,
    step_number   INT NOT NULL,
    title         NVARCHAR(150) NOT NULL,
    description   NVARCHAR(500) NULL,
    CONSTRAINT fk_steps_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE,
    CONSTRAINT uq_service_step UNIQUE (service_id, step_number)
);
GO

/* ============================================================================
   5. BẢNG TIME_SLOTS — theo TIME_SLOTS trong FE (Sáng/Chiều/Tối)
   ============================================================================ */
CREATE TABLE time_slots (
    slot_id       INT IDENTITY(1,1) PRIMARY KEY,
    period        NVARCHAR(20) NOT NULL,
    slot_time     TIME(0) NOT NULL,
    CONSTRAINT uq_slot_time UNIQUE (slot_time),
    CONSTRAINT chk_slot_period CHECK (period IN ('morning','afternoon','evening'))
);
GO

/* ============================================================================
   6. BẢNG APPOINTMENTS — lịch hẹn (Appointment / AdminAppt trong FE)
   ============================================================================ */
CREATE TABLE appointments (
    appointment_id    VARCHAR(10) PRIMARY KEY,        -- định dạng QC-XXXXXX
    customer_id       INT NOT NULL,
    pet_id            INT NOT NULL,
    service_id        INT NOT NULL,
    appointment_date  DATE NOT NULL,
    slot_id           INT NOT NULL,
    status            NVARCHAR(20) NOT NULL DEFAULT 'success',
    price             DECIMAL(10,0) NOT NULL,
    address           NVARCHAR(255) NOT NULL,
    vet_name          NVARCHAR(150) NULL,
    cancel_reason     NVARCHAR(255) NULL,
    created_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at        DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_appt_customer FOREIGN KEY (customer_id) REFERENCES users(user_id),
    CONSTRAINT fk_appt_pet      FOREIGN KEY (pet_id)      REFERENCES pets(pet_id),
    CONSTRAINT fk_appt_service  FOREIGN KEY (service_id)  REFERENCES services(service_id),
    CONSTRAINT fk_appt_slot     FOREIGN KEY (slot_id)     REFERENCES time_slots(slot_id),
    CONSTRAINT chk_appt_status  CHECK (status IN ('success','cancelled')),
    CONSTRAINT chk_appt_cancel_reason
        CHECK (status = 'success' OR (status = 'cancelled' AND cancel_reason IS NOT NULL))
);
GO

CREATE INDEX idx_appt_customer ON appointments(customer_id);
CREATE INDEX idx_appt_service  ON appointments(service_id);
CREATE INDEX idx_appt_date     ON appointments(appointment_date);
CREATE INDEX idx_appt_date_slot_status ON appointments(appointment_date, slot_id, status);
GO


/* ============================================================================
   7. RÀNG BUỘC CHỐNG TRÙNG LỊCH HẸN (business rule quan trọng nhất)
   ============================================================================ */
GO
CREATE TRIGGER trg_appt_no_double_booking_insert
ON appointments
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN appointments a
          ON a.appointment_date = i.appointment_date
         AND a.slot_id          = i.slot_id
         AND a.status            = 'success'
         AND a.appointment_id  <> i.appointment_id
        WHERE i.status = 'success'
    )
    BEGIN
        RAISERROR (N'Khung gio nay da co khach hang khac dat lich. Vui long chon ngay/gio khac.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO

CREATE TRIGGER trg_appt_no_double_booking_update
ON appointments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Tự động cập nhật updated_at khi có sửa lịch hẹn
    UPDATE a
    SET updated_at = SYSDATETIME()
    FROM appointments a
    JOIN inserted i ON i.appointment_id = a.appointment_id;

    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE i.status = 'success'
          AND EXISTS (
              SELECT 1
              FROM appointments a
              WHERE a.appointment_date = i.appointment_date
                AND a.slot_id          = i.slot_id
                AND a.status            = 'success'
                AND a.appointment_id  <> i.appointment_id
          )
    )
    BEGIN
        RAISERROR (N'Khung gio nay da co khach hang khac dat lich. Vui long chon ngay/gio khac.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END
GO


/* ============================================================================
   8. DỮ LIỆU MẪU — INSERT
   ============================================================================ */

/* ---- 8.1 Tài khoản ADMIN ----
   Sau khi tạo schema, cấu hình ADMIN_PASSWORD trong backend/.env
   rồi chạy: npm run seed:admin
*/
GO

-- Web mới đưa vào vận hành: KHÔNG seed sẵn tài khoản khách hàng / thú cưng.
-- Bảng "users" (role='customer') và "pets" giữ nguyên cấu trúc, sẽ được
-- điền dữ liệu tự động khi người dùng thật đăng ký (Register) và thêm thú cưng
-- qua ứng dụng. Xem lại phần 1 và 2 phía trên để biết cấu trúc bảng.

/* ---- 8.4 Danh mục dịch vụ (theo CATEGORIES trong FE) ---- */
INSERT INTO service_categories (code, name) VALUES
(N'spa',      N'Tắm & Spa'),
(N'trimming', N'Cắt Tỉa Lông'),
(N'hygiene',  N'Vệ Sinh'),
(N'health',   N'Sức Khỏe');
GO

/* ---- 8.5 Dịch vụ (theo mảng SERVICES trong FE, id giữ nguyên 1..9) ---- */
INSERT INTO services (service_id, category_id, title, subtitle, price, duration, image, description) VALUES
(1, (SELECT category_id FROM service_categories WHERE code = N'spa'),
   N'Tắm Spa Premium', N'Tắm, sấy và massage thư giãn', 250000, N'60–90 phút',
   N'https://images.unsplash.com/photo-1611173622933-91942d394b04?w=900&h=520&fit=crop&auto=format',
   N'Dịch vụ tắm spa cao cấp dành cho thú cưng, sử dụng sản phẩm organic an toàn kết hợp massage thư giãn và sấy tạo kiểu chuyên nghiệp.'),
(2, (SELECT category_id FROM service_categories WHERE code = N'trimming'),
   N'Cắt Tỉa Lông', N'Tạo kiểu và cắt tỉa chuyên nghiệp', 180000, N'45–60 phút',
   N'https://images.unsplash.com/photo-1581887936036-3f4f7f0b6679?w=900&h=520&fit=crop&auto=format',
   N'Cắt tỉa lông theo yêu cầu với nhiều kiểu dáng đa dạng phù hợp từng giống loài. Thợ tạo kiểu được huấn luyện chuyên sâu.'),
(3, (SELECT category_id FROM service_categories WHERE code = N'hygiene'),
   N'Vệ Sinh Tai & Móng', N'Làm sạch tai và cắt móng an toàn', 120000, N'20–30 phút',
   N'https://images.unsplash.com/photo-1597595735781-6a57fb8e3e3d?w=900&h=520&fit=crop&auto=format',
   N'Vệ sinh tai và cắt móng định kỳ giúp phòng ngừa viêm nhiễm, giữ thú cưng luôn khỏe mạnh và thoải mái.'),
(4, (SELECT category_id FROM service_categories WHERE code = N'health'),
   N'Khám Sức Khỏe Tại Nhà', N'Bác sĩ thú y đến tận nơi kiểm tra', 350000, N'45–60 phút',
   N'https://images.unsplash.com/photo-1668979323445-11d84f1be907?w=900&h=520&fit=crop&auto=format',
   N'Bác sĩ thú y có chứng chỉ hành nghề đến tận nhà khám toàn diện, giúp thú cưng không bị stress. Bao gồm tư vấn dinh dưỡng và kê đơn.'),
(5, (SELECT category_id FROM service_categories WHERE code = N'spa'),
   N'Tắm & Thơm Toàn Thân', N'Tắm sạch kết hợp nước hoa cao cấp', 160000, N'30–45 phút',
   N'https://images.unsplash.com/photo-1597603413826-cd1c06b05222?w=900&h=520&fit=crop&auto=format',
   N'Tắm sạch chuyên nghiệp kết hợp nước hoa thú cưng cao cấp, an toàn và dịu nhẹ với da.'),
(6, (SELECT category_id FROM service_categories WHERE code = N'health'),
   N'Tiêm Vaccine Định Kỳ', N'Tiêm phòng đầy đủ tại nhà bởi bác sĩ', 220000, N'15–20 phút',
   N'https://images.unsplash.com/photo-1668979323481-e5d03e2bdbb2?w=900&h=520&fit=crop&auto=format',
   N'Dịch vụ tiêm vaccine định kỳ tại nhà. Vaccine nhập khẩu chính hãng, bảo quản đúng chuẩn lạnh.'),
(7, (SELECT category_id FROM service_categories WHERE code = N'health'),
   N'Tẩy Giun & Ký Sinh Trùng', N'Xử lý giun sán và ve rận toàn thân', 180000, N'20–30 phút',
   N'https://images.unsplash.com/photo-1521391553259-3fd6729dafad?w=900&h=520&fit=crop&auto=format',
   N'Phác đồ tẩy giun và diệt ký sinh trùng ngoài da toàn diện, sử dụng thuốc thú y nhập khẩu an toàn.'),
(8, (SELECT category_id FROM service_categories WHERE code = N'health'),
   N'Siêu Âm & Xét Nghiệm', N'Chẩn đoán hình ảnh và xét nghiệm máu', 450000, N'30–45 phút',
   N'https://images.unsplash.com/photo-1668979323481-e5d03e2bdbb2?w=900&h=520&fit=crop&auto=format',
   N'Siêu âm ổ bụng và xét nghiệm máu cơ bản tại nhà với thiết bị di động chuyên dụng.'),
(9, (SELECT category_id FROM service_categories WHERE code = N'health'),
   N'Chăm Sóc Sau Phẫu Thuật', N'Theo dõi và thay băng hậu phẫu tại nhà', 280000, N'30–40 phút',
   N'https://images.unsplash.com/photo-1675430426271-d74b542f21e4?w=900&h=520&fit=crop&auto=format',
   N'Chăm sóc chuyên biệt sau phẫu thuật tại nhà, bao gồm thay băng vô trùng và theo dõi hồi phục.');
GO

SET IDENTITY_INSERT services OFF;
GO

/* ---- 8.6 Bảng giá chi tiết từng dịch vụ (priceBreakdown) ---- */
INSERT INTO service_price_breakdown (service_id, label, price) VALUES
(1, N'Tắm & sấy cơ bản', 150000), (1, N'Massage thư giãn', 70000), (1, N'Nước hoa thú cưng', 30000),
(2, N'Cắt lông cơ bản', 120000), (2, N'Tạo kiểu nâng cao', 40000), (2, N'Chải & dưỡng lông', 20000),
(3, N'Vệ sinh tai', 60000), (3, N'Cắt móng', 50000), (3, N'Dũa & làm mịn móng', 10000),
(4, N'Khám tổng quát', 200000), (4, N'Phí di chuyển', 50000), (4, N'Tư vấn dinh dưỡng', 100000),
(5, N'Tắm & sấy', 120000), (5, N'Nước hoa premium', 40000),
(6, N'Vaccine phòng bệnh dại', 100000), (6, N'Vaccine đa giá (5 bệnh)', 90000), (6, N'Phí tiêm & di chuyển', 30000),
(7, N'Thuốc tẩy giun nội ký sinh', 80000), (7, N'Thuốc xịt ve, bọ chét', 70000), (7, N'Phí khám & di chuyển', 30000),
(8, N'Siêu âm ổ bụng', 200000), (8, N'Xét nghiệm máu tổng quát', 180000), (8, N'Phí di chuyển & thiết bị', 70000),
(9, N'Thay băng & sát trùng vết mổ', 120000), (9, N'Kiểm tra và theo dõi hồi phục', 100000), (9, N'Phí di chuyển', 60000);
GO

/* ---- 8.7 Các bước quy trình dịch vụ (steps) ---- */
INSERT INTO service_steps (service_id, step_number, title, description) VALUES
(1,1,N'Kiểm tra sức khỏe ban đầu',N'Kiểm tra da, lông và tình trạng sức khỏe tổng quát'),
(1,2,N'Tắm với sản phẩm organic',N'Shampoo và conditioner chuyên dụng theo loại lông'),
(1,3,N'Massage thư giãn',N'Massage toàn thân nhẹ nhàng, kích thích tuần hoàn'),
(1,4,N'Sấy & tạo kiểu',N'Sấy khô hoàn toàn, chải và tạo kiểu lông'),
(1,5,N'Hoàn thiện & kiểm tra',N'Kiểm tra lại và xịt nước hoa nhẹ nhàng'),
(2,1,N'Tư vấn kiểu dáng',N'Trao đổi và chọn kiểu phù hợp với giống loài'),
(2,2,N'Chải rối và làm mềm lông',N'Gỡ rối, làm mềm lông trước khi cắt'),
(2,3,N'Cắt tỉa chính xác',N'Cắt theo kiểu đã chọn với kéo chuyên dụng'),
(2,4,N'Hoàn thiện chi tiết',N'Tỉa vùng nhỏ: tai, chân, quanh mắt, đuôi'),
(3,1,N'Kiểm tra tai',N'Phát hiện sớm viêm nhiễm, nấm hoặc ký sinh'),
(3,2,N'Làm sạch tai',N'Dùng dung dịch chuyên dụng, làm sạch nhẹ nhàng'),
(3,3,N'Cắt móng đúng kỹ thuật',N'Cắt tránh phần mạch máu, không gây đau'),
(3,4,N'Dũa & hoàn thiện',N'Dũa nhẵn móng để tránh trầy xước đồ vật'),
(4,1,N'Xác nhận & chuẩn bị',N'Bác sĩ xác nhận thời gian và chuẩn bị dụng cụ'),
(4,2,N'Khám tổng quát toàn thân',N'Kiểm tra tim, phổi, da, lông, mắt, tai, bụng'),
(4,3,N'Chẩn đoán & tư vấn',N'Phân tích kết quả và tư vấn phác đồ chăm sóc'),
(4,4,N'Kê đơn & hướng dẫn',N'Kê đơn thuốc và hướng dẫn chăm sóc tại nhà'),
(5,1,N'Ướt lông và làm mềm',N'Làm ướt đều và thoa conditioner dưỡng lông'),
(5,2,N'Tắm sạch kỹ càng',N'Shampoo phù hợp loại lông, massage da đầu'),
(5,3,N'Sấy khô hoàn toàn',N'Sấy khô, chải mượt và tạo phồng lông'),
(5,4,N'Xịt thơm cao cấp',N'Nước hoa riêng cho thú cưng, an toàn, thơm lâu'),
(6,1,N'Kiểm tra sức khỏe trước tiêm',N'Đảm bảo thú cưng đủ điều kiện sức khỏe'),
(6,2,N'Tư vấn loại vaccine phù hợp',N'Lựa chọn vaccine theo độ tuổi và lịch sử tiêm'),
(6,3,N'Thực hiện tiêm chủng',N'Tiêm đúng kỹ thuật, giảm thiểu khó chịu'),
(6,4,N'Theo dõi phản ứng sau tiêm',N'Quan sát 15–20 phút, xử lý ngay nếu có dị ứng'),
(6,5,N'Cấp sổ tiêm chủng',N'Ghi nhận và lên lịch tiêm cho lần tiếp theo'),
(7,1,N'Kiểm tra mức độ nhiễm ký sinh',N'Quan sát lông, da và kiểm tra phân cơ bản'),
(7,2,N'Chọn phác đồ điều trị',N'Lựa chọn thuốc phù hợp theo cân nặng và loài'),
(7,3,N'Tẩy giun nội ký sinh',N'Cho uống hoặc nhỏ gáy thuốc tẩy giun'),
(7,4,N'Xịt diệt ngoại ký sinh',N'Xịt toàn thân, đặc biệt vùng tai, bẹn, đuôi'),
(7,5,N'Tư vấn phòng ngừa tái nhiễm',N'Hướng dẫn vệ sinh môi trường sống cho thú'),
(8,1,N'Chuẩn bị & nhịn ăn',N'Hướng dẫn chuẩn bị trước siêu âm (nhịn 4–6h)'),
(8,2,N'Lấy mẫu máu xét nghiệm',N'Lấy máu tĩnh mạch nhanh, ít đau'),
(8,3,N'Thực hiện siêu âm',N'Siêu âm gan, thận, bàng quang, tử cung/tinh hoàn'),
(8,4,N'Đọc kết quả & chẩn đoán',N'Phân tích hình ảnh và chỉ số máu ngay tại chỗ'),
(8,5,N'Tư vấn phác đồ điều trị',N'Đưa ra hướng điều trị hoặc theo dõi định kỳ'),
(9,1,N'Đánh giá tình trạng vết thương',N'Kiểm tra nhiễm trùng, sưng tấy, chảy dịch'),
(9,2,N'Tháo băng cũ và làm sạch',N'Rửa vết mổ bằng nước muối sinh lý'),
(9,3,N'Sát trùng và bôi thuốc',N'Sát trùng và bôi thuốc kháng sinh tại chỗ'),
(9,4,N'Băng bó lại vô trùng',N'Băng lại bằng vật liệu vô khuẩn chuyên dụng'),
(9,5,N'Báo cáo tiến trình hồi phục',N'Ghi nhận và tư vấn lịch tái khám tiếp theo');
GO

/* ---- 8.8 Khung giờ (theo TIME_SLOTS trong FE) ---- */
INSERT INTO time_slots (period, slot_time) VALUES
(N'morning','07:30'), (N'morning','08:00'), (N'morning','08:30'), (N'morning','09:00'),
(N'morning','09:30'), (N'morning','10:00'), (N'morning','10:30'), (N'morning','11:00'),
(N'afternoon','13:00'), (N'afternoon','13:30'), (N'afternoon','14:00'), (N'afternoon','14:30'),
(N'afternoon','15:00'), (N'afternoon','15:30'), (N'afternoon','16:00'), (N'afternoon','16:30'),
(N'evening','17:00'), (N'evening','17:30'), (N'evening','18:00'), (N'evening','18:30'),
(N'evening','19:00'), (N'evening','19:30'), (N'evening','20:00');
GO

-- Web mới đưa vào vận hành: KHÔNG seed sẵn lịch hẹn mẫu.
-- Bảng "appointments" giữ nguyên cấu trúc + TRIGGER chống trùng lịch (mục 7),
-- sẽ được điền dữ liệu khi khách hàng thật đặt lịch qua ứng dụng.


/* ============================================================================
   9. VIEW HỖ TRỢ FE
   ============================================================================ */

/* Danh sách lịch hẹn đầy đủ — dùng cho trang "Lịch hẹn của tôi" (khách hàng) */
CREATE VIEW v_customer_appointments AS
SELECT
    a.appointment_id, a.customer_id, u.full_name AS customer_name,
    s.title AS service, p.name AS pet, p.pet_type,
    a.appointment_date, t.slot_time, a.status, a.price, a.address, a.vet_name, a.cancel_reason
FROM appointments a
JOIN users u      ON u.user_id     = a.customer_id
JOIN pets  p      ON p.pet_id      = a.pet_id
JOIN services s   ON s.service_id  = a.service_id
JOIN time_slots t ON t.slot_id     = a.slot_id;
GO

/* Danh sách lịch hẹn cho trang quản trị (admin overview) */
CREATE VIEW v_admin_appointments AS
SELECT
    a.appointment_id, u.full_name AS customer, p.name AS pet, s.title AS service,
    a.appointment_date AS date, t.slot_time AS time, a.status
FROM appointments a
JOIN users u      ON u.user_id     = a.customer_id
JOIN pets  p      ON p.pet_id      = a.pet_id
JOIN services s   ON s.service_id  = a.service_id
JOIN time_slots t ON t.slot_id     = a.slot_id;
GO

-- Ví dụ dùng view (không bắt buộc chạy):
-- SELECT * FROM v_admin_appointments ORDER BY date DESC, time DESC;


/* ============================================================================
   10. KIỂM TRA RÀNG BUỘC CHỐNG TRÙNG LỊCH (ví dụ minh họa — không bắt buộc chạy)
   ============================================================================
   -- Ví dụ: sau khi có 2 khách hàng thật đăng ký (A và B) và mỗi người có
   -- 1 thú cưng, giả sử khách A đặt lịch thành công lúc 09:00 ngày 2026-08-10:
   --
   -- INSERT INTO appointments (appointment_id, customer_id, pet_id, service_id,
   --   appointment_date, slot_id, status, price, address, vet_name)
   -- VALUES (N'QC-000001', <user_id của A>, <pet_id của A>, 1,
   --   '2026-08-10', (SELECT slot_id FROM time_slots WHERE slot_time='09:00'),
   --   N'success', 250000, N'Đà Nẵng', N'Bác sĩ: Nguyễn Văn Quang');
   --
   -- Nếu khách B cố đặt CÙNG ngày, CÙNG khung giờ 09:00 đó:
   --
   -- INSERT INTO appointments (appointment_id, customer_id, pet_id, service_id,
   --   appointment_date, slot_id, status, price, address, vet_name)
   -- VALUES (N'QC-000002', <user_id của B>, <pet_id của B>, 2,
   --   '2026-08-10', (SELECT slot_id FROM time_slots WHERE slot_time='09:00'),
   --   N'success', 180000, N'Đà Nẵng', N'Bác sĩ: Nguyễn Văn Quang');
   --
   -- => TRIGGER sẽ chặn lại (ROLLBACK TRANSACTION) và báo lỗi:
   --    "Khung gio nay da co khach hang khac dat lich. Vui long chon ngay/gio khac."
   --
   -- Nếu lịch của A được HỦY trước đó (UPDATE ... SET status='cancelled'),
   -- khung giờ 09:00 ngày 2026-08-10 sẽ tự do trở lại và B đặt được bình thường.
   ============================================================================ */
GO
