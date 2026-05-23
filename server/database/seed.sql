USE nexasestate;

INSERT INTO admins (name, email, password_hash, role) VALUES
('Fahim Bin Zaman', 'fahim@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'super_admin'),
('Safin', 'safin@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'admin'),
('System Support', 'support@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'admin'),
('Bossman', 'bossman9@gmail.com', '$2b$10$TvGQVGX39FZZUPyqhSNxA.0/rIsXozKswkOwqfOW2J9307323vpKS', 'super_admin');

INSERT INTO landlords (name, email, password_hash, contact) VALUES
('Rahman Chowdhury', 'rahman@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '01711-223344'),
('Fatema Begum', 'fatema@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '01812-334455'),
('Kamal Hossain', 'kamal@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '01913-445566'),
('Fahim Landlord', 'fahim123@gmail.com', '$2b$10$0lFaWA4cSkJTrA8pPQiNPeEqhIm9Pkm0I.pcC.AKQi/2R687bVfqG', '01234-567890');

INSERT INTO properties (landlord_id, name, address, city, type) VALUES
(1, 'Gulshan Heights', 'Road 12, Block C, Gulshan-2', 'Dhaka', 'Residential'),
(1, 'Banani Tower', '27 Banani C/A, Road 17', 'Dhaka', 'Commercial'),
(1, 'Mirpur Residency', 'Section-10, Block-A, Mirpur', 'Dhaka', 'Residential'),
(2, 'Dhanmondi Plaza', 'Road 27, Dhanmondi R/A', 'Dhaka', 'Mixed'),
(2, 'Uttara Garden View', 'Sector-7, Road 5, Uttara', 'Dhaka', 'Residential'),
(3, 'Chittagong Bay Towers', 'Agrabad C/A, Plot 44', 'Chittagong', 'Commercial'),
(3, 'Sylhet Green Residency', 'Zindabazar, Sylhet Sadar', 'Sylhet', 'Residential'),
(3, 'Khulna Suites', 'KDA Avenue, Khulna City', 'Khulna', 'Residential');

INSERT INTO units (property_id, unit_number, meter_number, floor, bedrooms, bathrooms, area_sqft, rent_amount, status) VALUES
(1, 'A-101', 'MTR-G001', 1, 3, 2, 1800.00, 55000.00, 'Occupied'),
(1, 'A-102', 'MTR-G002', 1, 2, 1, 1200.00, 38000.00, 'Occupied'),
(1, 'A-201', 'MTR-G003', 2, 3, 2, 1800.00, 57000.00, 'Vacant'),
(1, 'A-202', 'MTR-G004', 2, 4, 3, 2400.00, 75000.00, 'Occupied'),
(1, 'A-301', 'MTR-G005', 3, 2, 2, 1400.00, 45000.00, 'Under Maintenance'),
(2, 'Office-1A', 'MTR-B001', 1, 0, 1, 800.00, 35000.00, 'Occupied'),
(2, 'Office-2A', 'MTR-B002', 2, 0, 1, 1000.00, 42000.00, 'Occupied'),
(2, 'Office-3A', 'MTR-B003', 3, 0, 2, 1500.00, 60000.00, 'Vacant'),
(3, 'B-101', 'MTR-M001', 1, 2, 1, 950.00, 22000.00, 'Occupied'),
(3, 'B-102', 'MTR-M002', 1, 3, 2, 1300.00, 30000.00, 'Occupied'),
(3, 'B-201', 'MTR-M003', 2, 2, 1, 950.00, 23000.00, 'Vacant'),
(3, 'B-202', 'MTR-M004', 2, 3, 2, 1300.00, 31000.00, 'Occupied'),
(4, 'C-GF1', 'MTR-D001', 0, 0, 1, 600.00, 28000.00, 'Occupied'),
(4, 'C-101', 'MTR-D002', 1, 2, 1, 1100.00, 35000.00, 'Occupied'),
(4, 'C-102', 'MTR-D003', 1, 3, 2, 1600.00, 48000.00, 'Occupied'),
(5, 'D-101', 'MTR-U001', 1, 3, 2, 1700.00, 40000.00, 'Occupied'),
(5, 'D-102', 'MTR-U002', 1, 2, 1, 1050.00, 25000.00, 'Vacant'),
(5, 'D-201', 'MTR-U003', 2, 4, 3, 2200.00, 62000.00, 'Occupied'),
(6, 'E-101', 'MTR-C001', 1, 0, 1, 750.00, 30000.00, 'Occupied'),
(6, 'E-201', 'MTR-C002', 2, 0, 1, 900.00, 36000.00, 'Vacant'),
(7, 'F-101', 'MTR-S001', 1, 2, 1, 1000.00, 18000.00, 'Occupied'),
(7, 'F-102', 'MTR-S002', 1, 3, 2, 1400.00, 26000.00, 'Occupied'),
(8, 'G-101', 'MTR-K001', 1, 2, 1, 900.00, 16000.00, 'Occupied'),
(8, 'G-102', 'MTR-K002', 1, 2, 1, 900.00, 16000.00, 'Vacant');

INSERT INTO tenants (name, email, password_hash, nid, phone, emergency_contact) VALUES
('Arif Mahmud', 'arif@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1990123456789', '01711-001122', '01811-001133'),
('Sumaiya Islam', 'sumaiya@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1992234567890', '01812-002233', '01912-002244'),
('Nabil Hasan', 'nabil@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1988345678901', '01913-003344', '01713-003355'),
('Tania Akter', 'tania@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1995456789012', '01611-004455', '01511-004466'),
('Jahangir Alam', 'jahangir@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1985567890123', '01712-005566', '01812-005577'),
('Roksana Khanam', 'roksana@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1991678901234', '01813-006677', '01913-006688'),
('Shakil Ahmed', 'shakil@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1993789012345', '01914-007788', '01714-007799'),
('Lamia Chowdhury', 'lamia@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1997890123456', '01715-008899', '01815-008810'),
('Imran Khan', 'imran@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1989901234567', '01816-009900', '01916-009911'),
('Nusrat Jahan', 'nusrat@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1994012345678', '01617-010011', '01517-010022'),
('Raihan Uddin', 'raihan@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1986123450001', '01718-011122', '01818-011133'),
('Sabrina Akter', 'sabrina@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1998234560002', '01819-012233', '01919-012244'),
('Mehedi Hassan', 'mehedi@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1990345670003', '01920-013344', '01720-013355'),
('Farhana Sultana', 'farhana@gmail.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', '1993456780004', '01621-014455', '01521-014466'),
('Arif Testing', 'arif123@gmail.com', '$2b$10$0lFaWA4cSkJTrA8pPQiNPeEqhIm9Pkm0I.pcC.AKQi/2R687bVfqG', '9999999999999', '01711-122233', '01811-122233');

INSERT INTO staff (landlord_id, name, email, password_hash, role, phone) VALUES
(1, 'Ahon Staff', 'ahon123@gmail.com', '$2b$10$0lFaWA4cSkJTrA8pPQiNPeEqhIm9Pkm0I.pcC.AKQi/2R687bVfqG', 'Manager', '01700-112233');

INSERT INTO leases (unit_id, tenant_id, start_date, end_date, monthly_rent, security_deposit, status) VALUES
(1, 1, '2024-01-01', '2025-12-31', 55000.00, 110000.00, 'Active'),
(2, 2, '2024-03-01', '2025-02-28', 38000.00, 76000.00, 'Active'),
(4, 3, '2023-07-01', '2025-06-30', 75000.00, 150000.00, 'Active'),
(6, 4, '2024-06-01', '2025-05-31', 35000.00, 70000.00, 'Active'),
(7, 5, '2024-02-01', '2026-01-31', 42000.00, 84000.00, 'Active'),
(9, 6, '2024-04-01', '2025-03-31', 22000.00, 44000.00, 'Active'),
(10, 7, '2023-11-01', '2025-10-31', 30000.00, 60000.00, 'Active'),
(12, 8, '2024-05-01', '2025-04-30', 31000.00, 62000.00, 'Active'),
(13, 9, '2024-01-01', '2024-12-31', 28000.00, 56000.00, 'Expired'),
(14, 10, '2024-07-01', '2026-06-30', 35000.00, 70000.00, 'Active'),
(15, 11, '2024-03-01', '2025-02-28', 48000.00, 96000.00, 'Active'),
(16, 12, '2024-08-01', '2026-07-31', 40000.00, 80000.00, 'Active'),
(18, 13, '2024-02-01', '2025-01-31', 62000.00, 124000.00, 'Active'),
(19, 14, '2024-09-01', '2025-08-31', 30000.00, 60000.00, 'Active'),
(21, 1, '2023-01-01', '2023-12-31', 17000.00, 34000.00, 'Expired'),
(22, 6, '2024-06-01', '2025-05-31', 26000.00, 52000.00, 'Active'),
(23, 7, '2024-01-01', '2025-12-31', 16000.00, 32000.00, 'Active');

INSERT INTO payments (lease_id, amount, late_fee_amount, payment_date, due_date, rent_month, rent_year, method, status, reference_no, notes) VALUES
(1, 55000.00, 0.00, '2024-01-05', '2024-01-05', 'January', 2024, 'Bank Transfer', 'Paid', 'TXN-20240105-001', NULL),
(1, 55000.00, 0.00, '2024-02-04', '2024-02-05', 'February', 2024, 'Bank Transfer', 'Paid', 'TXN-20240204-001', NULL),
(1, 55000.00, 0.00, '2024-03-06', '2024-03-05', 'March', 2024, 'Mobile Banking', 'Paid', 'TXN-20240306-001', 'Paid via bKash'),
(1, 55000.00, 0.00, '2024-04-05', '2024-04-05', 'April', 2024, 'Bank Transfer', 'Paid', 'TXN-20240405-001', NULL),
(1, 55000.00, 0.00, '2024-05-05', '2024-05-05', 'May', 2024, 'Bank Transfer', 'Paid', 'TXN-20240505-001', NULL),
(1, 55000.00, 0.00, '2024-06-05', '2024-06-05', 'June', 2024, 'Cash', 'Paid', 'TXN-20240605-001', NULL),
(1, 55000.00, 0.00, '2024-07-04', '2024-07-05', 'July', 2024, 'Bank Transfer', 'Paid', 'TXN-20240704-001', NULL),
(1, 55000.00, 0.00, '2024-08-05', '2024-08-05', 'August', 2024, 'Bank Transfer', 'Paid', 'TXN-20240805-001', NULL),
(1, 55000.00, 500.00,'2024-09-10','2024-09-05', 'September',2024, 'Mobile Banking', 'Paid', 'TXN-20240910-001', 'Late — 5 days'),
(1, 55000.00, 0.00, '2024-10-05', '2024-10-05', 'October', 2024, 'Bank Transfer', 'Paid', 'TXN-20241005-001', NULL),
(1, 55000.00, 0.00, '2024-11-05', '2024-11-05', 'November', 2024, 'Bank Transfer', 'Paid', 'TXN-20241105-001', NULL),
(1, 55000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Bank Transfer', 'Paid', 'TXN-20241205-001', NULL),
(1, 55000.00, 0.00, NULL, '2025-01-05', 'January', 2025, 'Cash', 'Pending', 'TXN-20250105-001', NULL),
(2, 38000.00, 0.00, '2024-03-05', '2024-03-05', 'March', 2024, 'Mobile Banking', 'Paid', 'TXN-20240305-002', 'bKash'),
(2, 38000.00, 0.00, '2024-04-05', '2024-04-05', 'April', 2024, 'Mobile Banking', 'Paid', 'TXN-20240405-002', NULL),
(2, 38000.00, 0.00, '2024-05-06', '2024-05-05', 'May', 2024, 'Mobile Banking', 'Paid', 'TXN-20240506-002', NULL),
(2, 38000.00, 0.00, '2024-06-05', '2024-06-05', 'June', 2024, 'Mobile Banking', 'Paid', 'TXN-20240605-002', NULL),
(2, 38000.00, 0.00, '2024-07-05', '2024-07-05', 'July', 2024, 'Mobile Banking', 'Paid', 'TXN-20240705-002', NULL),
(2, 38000.00, 0.00, '2024-08-05', '2024-08-05', 'August', 2024, 'Cash', 'Paid', 'TXN-20240805-002', NULL),
(2, 38000.00, 0.00, '2024-09-05', '2024-09-05', 'September', 2024, 'Mobile Banking', 'Paid', 'TXN-20240905-002', NULL),
(2, 38000.00, 0.00, '2024-10-05', '2024-10-05', 'October', 2024, 'Mobile Banking', 'Paid', 'TXN-20241005-002', NULL),
(2, 38000.00, 0.00, '2024-11-05', '2024-11-05', 'November', 2024, 'Mobile Banking', 'Paid', 'TXN-20241105-002', NULL),
(2, 38000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Mobile Banking', 'Paid', 'TXN-20241205-002', NULL),
(2, 38000.00, 0.00, NULL, '2025-01-05', 'January', 2025, 'Mobile Banking', 'Pending', 'TXN-20250105-002', NULL),
(3, 75000.00, 0.00, '2023-07-05', '2023-07-05', 'July', 2023, 'Bank Transfer', 'Paid', 'TXN-20230705-003', NULL),
(3, 75000.00, 0.00, '2023-08-05', '2023-08-05', 'August', 2023, 'Bank Transfer', 'Paid', 'TXN-20230805-003', NULL),
(3, 75000.00, 0.00, '2023-09-05', '2023-09-05', 'September', 2023, 'Bank Transfer', 'Paid', 'TXN-20230905-003', NULL),
(3, 75000.00, 0.00, '2023-10-05', '2023-10-05', 'October', 2023, 'Bank Transfer', 'Paid', 'TXN-20231005-003', NULL),
(3, 75000.00, 0.00, '2023-11-05', '2023-11-05', 'November', 2023, 'Bank Transfer', 'Paid', 'TXN-20231105-003', NULL),
(3, 75000.00, 0.00, '2023-12-05', '2023-12-05', 'December', 2023, 'Bank Transfer', 'Paid', 'TXN-20231205-003', NULL),
(3, 75000.00, 0.00, '2024-01-05', '2024-01-05', 'January', 2024, 'Bank Transfer', 'Paid', 'TXN-20240105-003', NULL),
(3, 75000.00, 0.00, '2024-02-05', '2024-02-05', 'February', 2024, 'Bank Transfer', 'Paid', 'TXN-20240205-003', NULL),
(3, 75000.00, 1000.00,'2024-03-12','2024-03-05','March', 2024, 'Bank Transfer', 'Paid', 'TXN-20240312-003', 'Late fee applied'),
(3, 75000.00, 0.00, NULL, '2025-01-05', 'January', 2025, 'Card', 'Pending', 'TXN-20250105-003', NULL),
(4, 35000.00, 1500.00, NULL, '2024-12-05', 'December', 2024, 'Cash', 'Overdue', 'TXN-20241205-004', 'Tenant was travelling'),
(5, 42000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Bank Transfer', 'Paid', 'TXN-20241205-005', NULL),
(6, 22000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Mobile Banking', 'Paid', 'TXN-20241205-006', NULL),
(7, 30000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Cash', 'Paid', 'TXN-20241205-007', NULL),
(8, 31000.00, 800.00, NULL, '2025-01-05', 'January', 2025, 'Mobile Banking', 'Overdue', 'TXN-20250105-008', 'Reminder sent'),
(10,35000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Bank Transfer', 'Paid', 'TXN-20241205-010', NULL),
(11,48000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Card', 'Paid', 'TXN-20241205-011', NULL),
(12,40000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Bank Transfer', 'Paid', 'TXN-20241205-012', NULL),
(13,62000.00, 0.00, '2024-12-05', '2024-12-05', 'December', 2024, 'Bank Transfer', 'Paid', 'TXN-20241205-013', NULL),
(14,30000.00, 0.00, NULL, '2025-01-05', 'January', 2025, 'Cash', 'Pending', 'TXN-20250105-014', NULL);

INSERT INTO staff (landlord_id, name, email, password_hash, role, phone) VALUES
(1, 'Habib Mia', 'habib@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Plumber', '01711-101010'),
(1, 'Selim Reza', 'selim@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Electrician', '01812-202020'),
(1, 'Dulal Babu', 'dulal@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Security', '01913-303030'),
(2, 'Milon Sheikh', 'milon@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Cleaner', '01611-404040'),
(2, 'Rahim Sarkar', 'rahi.sarkar@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Carpenter', '01712-505050'),
(3, 'Anis Ahmed', 'anis@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Electrician', '01813-606060'),
(3, 'Karim Ullah', 'karim.u@nexasestate.com', '$2b$10$KIXkD3y1mZ9vQwXe7Lp8OuN2sT5aB6cD4eF7gH8iJ9kL0mN1oP2qR', 'Maintenance', '01914-707070');

INSERT INTO maintenance_requests (unit_id, tenant_id, title, description, priority, status, submitted_at, resolved_at) VALUES
(1, 1, 'AC not cooling', 'The living room AC stopped cooling.', 'High', 'Resolved', '2024-06-10 09:30:00', '2024-06-12 14:00:00'),
(2, 2, 'Water pipe leakage', 'Kitchen sink pipe is leaking.', 'High', 'Resolved', '2024-07-15 11:00:00', '2024-07-16 10:30:00'),
(4, 3, 'Electrical short circuit', 'Bedroom light switch sparks.', 'Emergency', 'Resolved', '2024-08-01 08:00:00', '2024-08-01 16:00:00'),
(5, 1, 'Ceiling fan broken', 'Bedroom ceiling fan blades cracked.', 'Medium', 'In Progress', '2024-10-20 10:00:00', NULL),
(9, 6, 'Door lock jammed', 'Main entrance door lock is stuck.', 'High', 'Resolved', '2024-09-05 15:00:00', '2024-09-06 11:00:00'),
(10, 7, 'Bathroom tile cracked', 'Two tiles in the bathroom cracked.', 'Medium', 'Pending', '2024-11-20 12:00:00', NULL),
(12, 8, 'Gas stove not working', 'All burners stopped working.', 'High', 'In Progress', '2024-12-01 09:00:00', NULL),
(14, 10, 'Paint peeling off walls', 'Living room walls have paint peeling.', 'Low', 'Pending', '2024-12-10 14:00:00', NULL),
(15, 11, 'Water heater broken', 'Hot water not working.', 'Medium', 'Pending', '2024-12-18 08:30:00', NULL),
(16, 12, 'Window glass cracked', 'Bedroom window glass has a crack.', 'High', 'In Progress', '2025-01-02 10:00:00', NULL),
(18, 13, 'Lift not working', 'Building lift on floor 2 out of order.', 'Emergency', 'In Progress', '2025-01-05 07:00:00', NULL),
(19, 14, 'Pest infestation', 'Cockroaches found in kitchen.', 'High', 'Pending', '2025-01-08 11:00:00', NULL),
(21, 1, 'Drainage blockage', 'Bathroom drain is completely blocked.', 'High', 'Resolved', '2024-05-14 13:00:00', '2024-05-15 10:00:00'),
(22, 6, 'Noisy water pump', 'Water pump makes loud noise.', 'Low', 'Pending', '2025-01-10 22:00:00', NULL),
(23, 7, 'Broken gate lock', 'Main gate lock broken.', 'High', 'Pending', '2025-01-11 09:00:00', NULL);

INSERT INTO maintenance_assignments (request_id, staff_id, assigned_at, notes) VALUES
(1, 2, '2024-06-10 11:00:00', 'AC technician dispatched'),
(2, 1, '2024-07-15 13:00:00', 'Plumber assigned'),
(3, 2, '2024-08-01 09:00:00', 'Emergency electrical work'),
(4, 2, '2024-10-20 12:00:00', 'Fan replacement ordered'),
(5, 5, '2024-09-05 16:00:00', 'Door lock replacement'),
(7, 6, '2024-12-01 11:00:00', 'Gas stove inspection'),
(10, 2, '2025-01-03 09:00:00', 'Window replacement'),
(11, 6, '2025-01-05 08:00:00', 'Lift technician called'),
(13, 1, '2024-05-14 14:00:00', 'Drain cleaning assigned');

INSERT INTO utility_bills (unit_id, utility_type, billing_month, amount, due_date, status) VALUES
(1, 'Electricity', 'December 2024', 3200.00, '2025-01-10', 'Unpaid'),
(1, 'Gas', 'December 2024', 800.00, '2025-01-10', 'Paid'),
(1, 'Water', 'December 2024', 500.00, '2025-01-10', 'Paid'),
(2, 'Electricity', 'December 2024', 2100.00, '2025-01-10', 'Paid'),
(2, 'Water', 'December 2024', 450.00, '2025-01-10', 'Paid'),
(4, 'Electricity', 'December 2024', 4500.00, '2025-01-10', 'Unpaid'),
(4, 'Gas', 'December 2024', 1200.00, '2025-01-10', 'Paid'),
(6, 'Electricity', 'December 2024', 2800.00, '2025-01-10', 'Paid'),
(6, 'Service Charge', 'December 2024', 2000.00, '2025-01-10', 'Unpaid'),
(9, 'Electricity', 'December 2024', 1400.00, '2025-01-10', 'Paid'),
(9, 'Gas', 'December 2024', 600.00, '2025-01-10', 'Paid'),
(10, 'Electricity', 'December 2024', 1800.00, '2025-01-10', 'Unpaid'),
(12, 'Electricity', 'December 2024', 1950.00, '2025-01-10', 'Paid'),
(14, 'Electricity', 'December 2024', 2200.00, '2025-01-10', 'Paid'),
(16, 'Electricity', 'December 2024', 2600.00, '2025-01-10', 'Unpaid'),
(18, 'Electricity', 'December 2024', 3800.00, '2025-01-10', 'Paid'),
(19, 'Electricity', 'December 2024', 2100.00, '2025-01-10', 'Paid');

INSERT INTO expenses (property_id, category, amount, expense_date, description) VALUES
(1, 'Repair', 15000.00, '2024-06-12', 'AC repair'),
(1, 'Utility', 8500.00, '2024-07-01', 'Common area electricity'),
(1, 'Salary', 18000.00, '2024-07-31', 'Security guard salary'),
(2, 'Tax', 25000.00, '2024-04-15', 'Annual holding tax'),
(2, 'Insurance', 12000.00, '2024-01-20', 'Building insurance premium'),
(3, 'Repair', 9500.00, '2024-10-22', 'Plumbing repair'),
(3, 'Salary', 15000.00, '2024-11-30', 'Staff salary'),
(4, 'Utility', 6000.00, '2024-09-01', 'Common area utility'),
(4, 'Repair', 22000.00, '2024-08-01', 'Electrical wiring fix'),
(5, 'Utility', 5500.00, '2024-10-01', 'Water pump servicing'),
(5, 'Repair', 7800.00, '2024-11-15', 'Gate motor repair'),
(6, 'Tax', 30000.00, '2024-03-31', 'Annual tax'),
(6, 'Insurance', 18000.00, '2024-01-15', 'Commercial insurance'),
(7, 'Repair', 4500.00, '2024-12-10', 'Roof waterproofing'),
(8, 'Utility', 3200.00, '2024-12-01', 'Common area utility'),
(1, 'Repair', 35000.00, '2025-01-05', 'Lift maintenance'),
(1, 'Salary', 18000.00, '2024-12-31', 'Security guard salary'),
(3, 'Other', 2500.00, '2024-12-20', 'Pest control');

INSERT INTO amenities (name) VALUES
('24/7 Security'), ('Parking'), ('Generator Backup'), ('Elevator / Lift'), ('Rooftop Access'),
('CCTV Surveillance'), ('Swimming Pool'), ('Gym / Fitness Center'), ('Children Play Area'),
('Prayer Room'), ('Laundry Room'), ('Intercom System'), ('Fire Safety System'),
('Garbage Disposal'), ('High-Speed Internet');

INSERT INTO property_amenities (property_id, amenity_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,8),(1,12),(1,13),(1,14),(1,15),
(2,1),(2,2),(2,3),(2,4),(2,6),(2,12),(2,13),(2,14),
(3,1),(3,2),(3,3),(3,6),(3,10),(3,13),(3,14),
(4,1),(4,2),(4,3),(4,4),(4,6),(4,10),(4,12),(4,13),(4,14),(4,15),
(5,1),(5,2),(5,3),(5,5),(5,6),(5,7),(5,8),(5,9),(5,13),(5,14),
(6,1),(6,2),(6,3),(6,4),(6,6),(6,13),(6,14),
(7,1),(7,2),(7,6),(7,10),(7,14),
(8,1),(8,2),(8,6),(8,14);

INSERT INTO documents (lease_id, property_id, file_url, file_name, type, uploaded_by_role) VALUES
(1, 1, '/uploads/docs/lease_arif.pdf', 'lease_arif.pdf', 'Lease Agreement', 'Landlord'),
(1, 1, '/uploads/docs/nid_arif.pdf', 'nid_arif.pdf', 'NID Copy', 'Tenant'),
(2, 1, '/uploads/docs/lease_sumaiya.pdf', 'lease_sumaiya.pdf', 'Lease Agreement', 'Landlord'),
(3, 1, '/uploads/docs/lease_nabil.pdf', 'lease_nabil.pdf', 'Lease Agreement', 'Landlord'),
(3, 1, '/uploads/docs/nid_nabil.pdf', 'nid_nabil.pdf', 'NID Copy', 'Tenant'),
(4, 2, '/uploads/docs/lease_tania.pdf', 'lease_tania.pdf', 'Lease Agreement', 'Landlord'),
(5, 2, '/uploads/docs/lease_jahangir.pdf', 'lease_jahangir.pdf', 'Lease Agreement', 'Landlord'),
(6, 3, '/uploads/docs/lease_roksana.pdf', 'lease_roksana.pdf', 'Lease Agreement', 'Landlord'),
(10, 4, '/uploads/docs/lease_nusrat.pdf', 'lease_nusrat.pdf', 'Lease Agreement', 'Landlord'),
(12, 5, '/uploads/docs/lease_sabrina.pdf', 'lease_sabrina.pdf', 'Lease Agreement', 'Landlord');

INSERT INTO notifications (user_id, user_role, message, type, is_read) VALUES
(1, 'Landlord', 'Payment received from Arif Mahmud.', 'Payment', FALSE),
(1, 'Landlord', 'Lift not working marked as In Progress.', 'Maintenance', FALSE),
(1, 'Landlord', 'Lease expiring in 30 days.', 'Lease', FALSE),
(1, 'Landlord', 'Overdue rent alert.', 'Payment', FALSE),
(1, 'Landlord', 'New maintenance request.', 'Maintenance', TRUE),
(2, 'Landlord', 'Payment received from Nusrat Jahan.', 'Payment', FALSE),
(2, 'Landlord', 'Utility bill unpaid.', 'General', FALSE),
(3, 'Landlord', 'Staff assigned to Lift repair.', 'Maintenance', TRUE),
(1, 'Tenant', 'Rent due on 5th Jan.', 'Payment', FALSE),
(2, 'Tenant', 'Rent confirmed.', 'Payment', TRUE),
(3, 'Tenant', 'Request resolved.', 'Maintenance', TRUE),
(6, 'Tenant', 'Request resolved.', 'Maintenance', TRUE),
(7, 'Tenant', 'Rent pending.', 'Payment', FALSE),
(8, 'Tenant', 'Overdue notice.', 'Payment', FALSE),
(12, 'Tenant', 'Request In Progress.', 'Maintenance', FALSE),
(13, 'Tenant', 'Lift repair underway.', 'General', FALSE),
(2, 'Staff', 'New assignment assigned.', 'Maintenance', FALSE),
(6, 'Staff', 'New assignment.', 'Maintenance', FALSE),
(7, 'Staff', 'Assignment updated.', 'Maintenance', TRUE);

INSERT INTO messages (sender_id, receiver_id, sender_role, receiver_role, message_text, sent_at) VALUES
(1, 1, 'Tenant', 'Landlord', 'AC repair status?', '2024-06-10 10:00:00'),
(1, 1, 'Landlord', 'Tenant', 'Technician visiting tomorrow.', '2024-06-10 11:30:00'),
(1, 1, 'Tenant', 'Landlord', 'Thank you.', '2024-06-10 12:00:00'),
(2, 1, 'Tenant', 'Landlord', 'Pipe leaking badly.', '2024-07-15 11:15:00'),
(1, 2, 'Landlord', 'Tenant', 'Plumber dispatched.', '2024-07-15 11:45:00'),
(3, 1, 'Tenant', 'Landlord', 'Switch sparks.', '2024-08-01 08:15:00'),
(1, 3, 'Landlord', 'Tenant', 'Emergency team dispatched.', '2024-08-01 08:30:00'),
(8, 2, 'Tenant', 'Landlord', 'Rent will be late.', '2025-01-03 09:00:00'),
(2, 8, 'Landlord', 'Tenant', 'Pay by 10th Jan.', '2025-01-03 10:00:00'),
(1, 1, 'Landlord', 'Staff', 'Check water supply.', '2025-01-08 08:00:00'),
(1, 1, 'Staff', 'Landlord', 'I will be there.', '2025-01-08 08:30:00');

INSERT INTO audit_logs (action, table_name, record_id, performed_by, performed_by_role, details) VALUES
('CREATE', 'leases', 1, 1, 'Landlord', 'Lease created for Arif.'),
('CREATE', 'leases', 2, 1, 'Landlord', 'Lease created for Sumaiya.'),
('UPDATE', 'units', 5, 1, 'Landlord', 'Unit A-301 maintenance.'),
('CREATE', 'payments', 1, 1, 'Landlord', 'Payment recorded.'),
('UPDATE', 'maintenance_requests', 1, 2, 'Staff', 'Request resolved.'),
('UPDATE', 'maintenance_requests', 3, 2, 'Staff', 'Electrical resolved.'),
('CREATE', 'tenants', 1, 1, 'Landlord', 'Arif registered.'),
('UPDATE', 'leases', 9, 1, 'Landlord', 'Lease expired.'),
('CREATE', 'expenses', 1, 1, 'Landlord', 'Expense recorded.'),
('CREATE', 'staff', 1, 1, 'Landlord', 'Staff added.'),
('UPDATE', 'payments', 29, 1, 'Landlord', 'Payment Overdue.'),
('UPDATE', 'maintenance_requests', 11, 3, 'Staff', 'Lift assigned.');

-- -------------------------------------------------------------
-- Testing Users
-- -------------------------------------------------------------
INSERT INTO admins (name, email, password_hash, role) VALUES
('Bossman Admin', 'bossman9@gmail.com', '$2b$10$s8Kj797b8O0nrKJaEoPbUe0KEco27CqtlGD1YweOtgL2S.mo8ozR6', 'super_admin');

INSERT INTO landlords (name, email, password_hash, contact) VALUES
('Fahim Landlord', 'fahim123@gmail.com', '$2b$10$94UWcESBi6YQIFHKYRrdleT4Hguf7dwz7ZufHKPJfAoHEuvMBYu7m', '01911-111111');

INSERT INTO tenants (name, email, password_hash, nid, phone, emergency_contact) VALUES
('Arif Testing', 'arif123@gmail.com', '$2b$10$94UWcESBi6YQIFHKYRrdleT4Hguf7dwz7ZufHKPJfAoHEuvMBYu7m', '1999123456789', '01700-111111', '01800-222222');

INSERT INTO staff (landlord_id, name, email, password_hash, role, phone) VALUES
(1, 'Ahon Staff', 'ahon123@gmail.com', '$2b$10$94UWcESBi6YQIFHKYRrdleT4Hguf7dwz7ZufHKPJfAoHEuvMBYu7m', 'Maintenance', '01600-333333');
