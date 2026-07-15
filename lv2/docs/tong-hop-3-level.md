# Tổng hợp các hạng mục đã thực hiện - SPQM 3 Level

## Thông tin chung

- Tên đề tài: Quản lý phòng trọ.
- Môn học: Software Process and Quality Management.
- Mục tiêu: xây dựng hệ thống quản lý phòng trọ và nâng cấp dần theo 3 mức trưởng thành quy trình, từ nền tảng đến mở rộng và nâng cao.
- Công nghệ chính qua các level: Node.js, Express, SQLite, PostgreSQL, FastAPI, Docker Compose, Redis, Prometheus, Grafana, SonarQube, Jest, Supertest, k6, GitHub Actions.

## Level 1 - Nền tảng

### Mục tiêu Level 1

Xây dựng hệ thống REST API cơ bản để quản lý phòng trọ, có cấu trúc rõ ràng, kiểm thử tự động, lint và CI cơ bản.

### Hạng mục kỹ thuật đã làm

- Xây dựng backend bằng Node.js và Express.
- Sử dụng SQLite làm database ban đầu.
- Thiết kế REST API theo các nhóm chức năng:
  - Quản lý phòng trọ.
  - Quản lý người thuê.
  - Quản lý hợp đồng.
  - Quản lý hóa đơn.
- Tách cấu trúc thư mục rõ ràng:
  - `routes`
  - `controllers`
  - `services`
  - `models/database`
  - `tests`
- Tách logic nghiệp vụ ra khỏi route.
- Thêm validation dữ liệu đầu vào cơ bản.
- Thêm xử lý lỗi tập trung.
- Chuẩn hóa response JSON.

### Chức năng đã làm

- Thêm, xem danh sách, xem chi tiết, cập nhật, xóa phòng.
- Quản lý trạng thái phòng: trống, đã thuê, bảo trì.
- Thêm, xem danh sách, xem chi tiết, cập nhật, xóa người thuê.
- Tạo, xem danh sách, xem chi tiết, cập nhật và kết thúc hợp đồng.
- Tạo hóa đơn theo tháng.
- Tính tổng tiền hóa đơn gồm tiền phòng, điện, nước, dịch vụ.
- Cập nhật trạng thái thanh toán: chưa thanh toán, đã thanh toán.

### Kiểm thử và chất lượng

- Thêm Jest unit test cho các service chính.
- Test các logic quan trọng:
  - Tạo phòng.
  - Cập nhật trạng thái phòng.
  - Tạo hợp đồng.
  - Tính hóa đơn.
- Thêm ESLint để kiểm tra chất lượng code.
- Thêm GitHub Actions CI để chạy:
  - Install dependencies.
  - Lint.
  - Test with coverage.
- Đặt mục tiêu coverage tối thiểu 70%.

### Tài liệu SPQM Level 1

- Viết README đầy đủ:
  - Tên đề tài.
  - Mô tả hệ thống.
  - Công nghệ sử dụng.
  - Cách cài đặt.
  - Cách chạy project.
  - Cách chạy test.
  - Danh sách API.
  - SDLC.
  - Definition of Done.
  - Commit convention.
  - Thông tin coverage.
- Viết báo cáo `docs/spqm-level-1.md` gồm:
  - Quy trình SDLC của nhóm.
  - Vai trò thành viên.
  - Backlog chức năng có độ ưu tiên.
  - Mục tiêu SMART-Q.
  - Definition of Done.
  - Commit convention.
  - Baseline metrics.
  - Tự đánh giá CMMI mức 1-2.
  - Retrospective sprint đầu tiên.
  - Kế hoạch cải tiến theo PDCA.

## Level 2 - Mở rộng

### Mục tiêu Level 2

Nâng cấp hệ thống từ nền tảng đơn giản lên hệ thống có authentication, phân quyền, PostgreSQL, integration test, Docker Compose, SonarQube và quy trình Pull Request/code review.

### Hạng mục kỹ thuật đã làm

- Thêm JWT authentication.
- Thêm phân quyền người dùng theo role:
  - Admin/chủ trọ.
  - Staff/nhân viên.
  - Tenant/người thuê.
- Chuyển database từ SQLite sang PostgreSQL.
- Thiết kế schema PostgreSQL và script tạo bảng/seed data.
- Thêm Python FastAPI billing service để tính tiền hóa đơn.
- Node.js backend gọi billing service khi tạo hóa đơn.
- Thêm Docker Compose để chạy:
  - Backend Node.js.
  - PostgreSQL.
  - Billing service Python FastAPI.
  - SonarQube.
- Thêm `.env.example`.
- Thêm logs có cấu trúc.

### Chức năng đã mở rộng

- Auth:
  - Đăng ký tài khoản.
  - Đăng nhập.
  - Trả JWT.
  - Middleware kiểm tra token.
  - Middleware kiểm tra role.
- Workflow nghiệp vụ:
  - Tạo phòng.
  - Thêm người thuê.
  - Tạo hợp đồng.
  - Khi hợp đồng active thì phòng chuyển sang trạng thái đã thuê.
  - Ghi chỉ số điện/nước.
  - Tạo hóa đơn.
  - Gửi dữ liệu sang billing service để tính tiền.
  - Thanh toán hóa đơn.
  - Kết thúc hợp đồng và cập nhật trạng thái phòng.
- Tenant chỉ được xem:
  - Phòng đang thuê.
  - Hợp đồng của mình.
  - Hóa đơn của mình.

### Kiểm thử và chất lượng

- Giữ unit test từ Level 1.
- Thêm integration test bằng Supertest cho các API chính:
  - Login.
  - CRUD phòng.
  - Tạo hợp đồng.
  - Tạo hóa đơn.
  - Thanh toán hóa đơn.
- Nâng coverage tối thiểu lên 80%.
- Thêm SonarQube:
  - `sonar-project.properties`.
  - Hướng dẫn chạy SonarQube.
  - Giải thích bugs, vulnerabilities, code smells, coverage.
- Cập nhật GitHub Actions CI:
  - Install.
  - Lint.
  - Unit test.
  - Integration test.
  - Coverage.
  - SonarQube scan nếu có cấu hình secrets.

### Tài liệu SPQM Level 2

- Cập nhật README cho Level 2.
- Viết báo cáo `docs/spqm-level-2.md` gồm:
  - SDLC có bước Pull Request review.
  - Quy trình quản lý thay đổi.
  - Quy định mỗi thay đổi thông qua Pull Request.
  - Commit convention.
  - Bảng review code mẫu.
  - Metrics: coverage, lỗi SonarQube, lead time, CI fail rate.
  - So sánh baseline Level 1 và Level 2.
  - PDCA cho cải tiến quy trình.
  - Tự đánh giá CMMI mức 2-3.
  - Retrospective sau sprint Level 2.
  - Kế hoạch cải tiến có số liệu trước/sau.

## Level 3 - Nâng cao

### Mục tiêu Level 3

Nâng hệ thống từ backend mở rộng lên kiến trúc microservices, có cache, monitoring, load test, Quality Gate tự động và quản lý cải tiến dựa trên số liệu.

### Hạng mục kỹ thuật đã làm

- Tách hệ thống thành các service:
  - Auth Service.
  - Room Service.
  - Billing Service.
  - Report Service.
  - Billing Calculator FastAPI.
- Thêm Redis cache cho API đọc nhiều.
- Thêm endpoint `/metrics` cho các service.
- Thêm Prometheus để scrape metrics.
- Thêm Grafana dashboard để quan sát hệ thống.
- Thêm k6 load test.
- Cập nhật Docker Compose cho toàn bộ hệ thống Level 3.
- Cập nhật SonarQube và Quality Gate.
- Cập nhật logs và metrics để phục vụ đo lường.

### Kiến trúc Level 3

Các service chính:

- Auth Service: đăng ký, đăng nhập, JWT, user và role.
- Room Service: phòng, người thuê, hợp đồng, trạng thái phòng.
- Billing Service: hóa đơn, thanh toán, gọi billing calculator.
- Billing Calculator: FastAPI service tính tiền điện, nước, dịch vụ.
- Report Service: báo cáo doanh thu, hóa đơn chưa thanh toán, tỉ lệ phòng trống.

Các hạ tầng đi kèm:

- PostgreSQL: lưu dữ liệu nghiệp vụ.
- Redis: cache dữ liệu đọc nhiều.
- Prometheus: thu thập metrics.
- Grafana: hiển thị dashboard.
- SonarQube: phân tích chất lượng mã.

### Redis cache đã thêm

Các cache key chính:

- `rooms:list`: danh sách phòng.
- `report:revenue:<month>`: báo cáo doanh thu tháng.
- `report:unpaid-invoices`: danh sách hóa đơn chưa thanh toán.
- `report:room-occupancy`: tỉ lệ phòng theo trạng thái.

Cơ chế xóa cache:

- Khi tạo, cập nhật, xóa phòng.
- Khi tạo hoặc kết thúc hợp đồng.
- Khi tạo, cập nhật hoặc thanh toán hóa đơn.

### Monitoring và metrics

- Mỗi Node.js service expose endpoint `/metrics`.
- Billing Calculator FastAPI cũng expose `/metrics`.
- Prometheus scrape metrics từ các service.
- Grafana dashboard theo dõi:
  - Số request.
  - Response time.
  - p95 response time.
  - Error rate.
  - Trạng thái service.

### Load test k6

Đã thêm script load test tại `load-tests/boarding-house.js`.

Các API được test:

- Login.
- Xem danh sách phòng.
- Tạo hóa đơn.
- Xem báo cáo doanh thu.

Các chỉ số cần đo:

- Average response time.
- p95 response time.
- Request per second.
- Error rate.
- So sánh trước và sau khi bật Redis.

### Quality Gate Level 3

CI được cấu hình fail nếu:

- ESLint fail.
- Unit test fail.
- Integration test fail.
- Coverage dưới 80%.
- SonarQube Quality Gate fail khi có `SONAR_TOKEN` và `SONAR_HOST_URL`.

### Kết quả kiểm tra hiện tại

Kết quả chạy kiểm tra gần nhất:

- ESLint: pass.
- Jest unit/integration test: pass.
- Test suites: 7 passed.
- Tests: 35 passed.
- Statements coverage: 93.76%.
- Branches coverage: 80.33%.
- Functions coverage: 96.39%.
- Lines coverage: 93.63%.

### Tài liệu SPQM Level 3

- Cập nhật `README.md` cho Level 3:
  - Kiến trúc microservices.
  - Sơ đồ service.
  - Cách chạy bằng Docker Compose.
  - Cách chạy test.
  - Cách chạy k6.
  - Cách xem Prometheus.
  - Cách xem Grafana.
  - Cách kiểm tra SonarQube Quality Gate.
  - Các chỉ số đo lường Level 3.
  - Link video demo placeholder.
- Viết báo cáo `docs/spqm-level-3.md` gồm:
  - Phân tích nâng cấp từ Level 2 lên Level 3.
  - Thiết kế giao tiếp microservices.
  - Thiết kế schema theo service.
  - Redis cache và invalidation.
  - Monitoring bằng Prometheus/Grafana.
  - Load test k6.
  - Quality Gate.
  - DORA metrics.
  - SLO.
  - Retrospective dựa trên dữ liệu.
  - Tự đánh giá CMMI mức 3.
  - Kế hoạch cải tiến theo ODA/PDCA.

## Tổng kết tiến hóa qua 3 level

| Nội dung | Level 1 | Level 2 | Level 3 |
| --- | --- | --- | --- |
| Kiến trúc | Monolith REST API | Backend mở rộng + service phụ | Microservices |
| Database | SQLite | PostgreSQL | PostgreSQL theo miền service |
| Auth/RBAC | Chưa có | JWT + role | Auth Service riêng |
| Billing | Tính trong backend | FastAPI billing service | Billing Service + Billing Calculator |
| Cache | Chưa có | Chưa có | Redis |
| Test | Jest unit test | Jest + Supertest | Unit, integration, k6 load test |
| Coverage gate | 70% | 80% | 80% |
| CI | Install, lint, test | Thêm coverage, integration, Sonar | Quality Gate tự động |
| Monitoring | Chưa có | Logs có cấu trúc | Metrics, Prometheus, Grafana |
| Process | SDLC cơ bản | Pull Request, code review | DORA, SLO, cải tiến dựa trên số liệu |
| CMMI | Mức 1-2 | Mức 2-3 | Hướng mức 3 |

## Các file quan trọng

- `README.md`: hướng dẫn tổng thể Level 3.
- `docs/spqm-level-1.md`: báo cáo Level 1.
- `docs/spqm-level-2.md`: báo cáo Level 2.
- `docs/spqm-level-3.md`: báo cáo Level 3.
- `docker-compose.yml`: cấu hình chạy hệ thống Level 3.
- `.github/workflows/ci.yml`: CI và Quality Gate.
- `sonar-project.properties`: cấu hình SonarQube.
- `load-tests/boarding-house.js`: k6 load test.
- `monitoring/prometheus.yml`: cấu hình Prometheus.
- `monitoring/grafana/dashboards/boarding-house-overview.json`: dashboard Grafana.

## Ghi chú bàn giao

- Project đã đạt yêu cầu coverage Level 3 trên môi trường kiểm thử local.
- Docker Compose đã được cấu hình nhưng cần máy có Docker để chạy kiểm tra thực tế.
- Sau khi quay demo, cần thay link video placeholder trong README bằng link video thật.
