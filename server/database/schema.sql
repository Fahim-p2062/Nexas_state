CREATE DATABASE IF NOT EXISTS nexasestate;
USE nexasestate;

CREATE TABLE landlords (
  landlord_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE properties (
  property_id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL,
  name VARCHAR(100),
  address TEXT NOT NULL,
  city VARCHAR(60),
  type ENUM('Residential','Commercial','Mixed') DEFAULT 'Residential',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES landlords(landlord_id)
);

CREATE TABLE units (
  unit_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  unit_number VARCHAR(20) NOT NULL,
  meter_number VARCHAR(50),
  floor INT,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  area_sqft DECIMAL(8,2),
  rent_amount DECIMAL(10,2) NOT NULL,
  status ENUM('Vacant','Occupied','Under Maintenance') DEFAULT 'Vacant',
  FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

CREATE TABLE tenants (
  tenant_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nid VARCHAR(30) UNIQUE,
  phone VARCHAR(20),
  emergency_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leases (
  lease_id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  tenant_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  status ENUM('Active','Expired','Terminated') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(unit_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  lease_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  late_fee_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_date DATE,
  due_date DATE,
  rent_month VARCHAR(20),
  rent_year INT,
  method ENUM('Cash','Bank Transfer','Mobile Banking','Card') DEFAULT 'Cash',
  status ENUM('Paid','Pending','Overdue') DEFAULT 'Pending',
  reference_no VARCHAR(60),
  notes TEXT,
  FOREIGN KEY (lease_id) REFERENCES leases(lease_id)
);

CREATE TABLE maintenance_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  tenant_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  priority ENUM('Low','Medium','High','Emergency') DEFAULT 'Medium',
  status ENUM('Pending','In Progress','Resolved','Closed') DEFAULT 'Pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (unit_id) REFERENCES units(unit_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
);

CREATE TABLE staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  landlord_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(60),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES landlords(landlord_id)
);

CREATE TABLE maintenance_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  staff_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (request_id) REFERENCES maintenance_requests(request_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

CREATE TABLE documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  lease_id INT NOT NULL,
  property_id INT,
  file_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(150),
  type ENUM('Lease Agreement','NID Copy','Photo','Other') DEFAULT 'Other',
  uploaded_by_role ENUM('Landlord','Tenant') DEFAULT 'Landlord',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(lease_id),
  FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

CREATE TABLE expenses (
  expense_id INT AUTO_INCREMENT PRIMARY KEY,
  property_id INT NOT NULL,
  category ENUM('Repair','Utility','Tax','Insurance','Salary','Other'),
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  FOREIGN KEY (property_id) REFERENCES properties(property_id)
);

CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_role ENUM('Landlord','Tenant','Staff','Admin'),
  message TEXT NOT NULL,
  type ENUM('Payment','Maintenance','Lease','General') DEFAULT 'General',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(60),
  record_id INT,
  performed_by INT,
  performed_by_role ENUM('Landlord','Tenant','Staff','Admin'),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT
);

CREATE TABLE utility_bills (
  bill_id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  utility_type ENUM('Electricity', 'Gas', 'Water', 'Service Charge', 'Other') NOT NULL,
  billing_month VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(unit_id)
);

CREATE TABLE amenities (
  amenity_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE property_amenities (
  property_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (property_id, amenity_id),
  FOREIGN KEY (property_id) REFERENCES properties(property_id),
  FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id)
);

CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  sender_role ENUM('Landlord', 'Tenant', 'Staff') NOT NULL,
  receiver_role ENUM('Landlord', 'Tenant', 'Staff') NOT NULL,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS objections (
  objection_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  against_role ENUM('Landlord', 'Staff') NOT NULL,
  against_id INT NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('Open', 'Under Review', 'Resolved', 'Dismissed') DEFAULT 'Open',
  admin_note TEXT NULL,
  reviewed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
  FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action VARCHAR(150) NOT NULL,
  target_table VARCHAR(60),
  target_id INT,
  details TEXT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(admin_id)
);

CREATE TABLE IF NOT EXISTS property_bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  property_id INT NOT NULL,
  unit_id INT,
  booking_type ENUM('Rent','Buy') DEFAULT 'Rent',
  message TEXT,
  status ENUM('Pending','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(unit_id) ON DELETE SET NULL
);

CREATE VIEW landlord_revenue_summary AS
SELECT
    l.landlord_id,
    l.name AS Landlord_Name,
    COUNT(DISTINCT p.property_id) AS Total_Properties,
    SUM(pay.amount) AS Total_Revenue_Collected
FROM landlords l
LEFT JOIN properties p ON l.landlord_id = p.landlord_id
LEFT JOIN units u ON p.property_id = u.property_id
LEFT JOIN leases le ON u.unit_id = le.unit_id
LEFT JOIN payments pay ON le.lease_id = pay.lease_id AND pay.status = 'Paid'
GROUP BY l.landlord_id, l.name;

CREATE VIEW overdue_rent_list AS
SELECT
    t.name AS Tenant_Name,
    t.phone AS Contact_Number,
    u.unit_number,
    p.name AS Property_Name,
    pay.amount AS Due_Amount,
    pay.late_fee_amount,
    pay.rent_month,
    pay.rent_year
FROM tenants t
JOIN leases le ON t.tenant_id = le.tenant_id
JOIN payments pay ON le.lease_id = pay.lease_id
JOIN units u ON le.unit_id = u.unit_id
JOIN properties p ON u.property_id = p.property_id
WHERE pay.status = 'Overdue' OR pay.status = 'Pending';

CREATE VIEW property_occupancy_status AS
SELECT
    p.name AS Property_Name,
    COUNT(u.unit_id) AS Total_Units,
    SUM(CASE WHEN u.status = 'Occupied' THEN 1 ELSE 0 END) AS Occupied_Units,
    SUM(CASE WHEN u.status = 'Vacant' THEN 1 ELSE 0 END) AS Vacant_Units,
    SUM(CASE WHEN u.status = 'Under Maintenance' THEN 1 ELSE 0 END) AS Maintenance_Units
FROM properties p
LEFT JOIN units u ON p.property_id = u.property_id
GROUP BY p.property_id, p.name;

CREATE VIEW maintenance_tracker AS
SELECT
    mr.request_id,
    mr.title AS Issue,
    mr.priority,
    mr.status AS Resolution_Status,
    u.unit_number,
    t.name AS Reported_By,
    s.name AS Assigned_Staff,
    s.role AS Staff_Role
FROM maintenance_requests mr
JOIN units u ON mr.unit_id = u.unit_id
JOIN tenants t ON mr.tenant_id = t.tenant_id
LEFT JOIN maintenance_assignments ma ON mr.request_id = ma.request_id
LEFT JOIN staff s ON ma.staff_id = s.staff_id;

CREATE TABLE IF NOT EXISTS staff_reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);
