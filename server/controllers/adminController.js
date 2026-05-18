const pool = require('../config/db');

// Admin Dashboard — Full overview with revenue, profit, costing
const getAdminDashboard = async (req, res) => {
  try {
    // Total properties
    const [propCount] = await pool.query('SELECT COUNT(*) as total FROM properties');

    // Total units & occupancy
    const [unitStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN status = 'Vacant' THEN 1 ELSE 0 END) as vacant_units,
        SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_units,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance_units
      FROM units`
    );

    // Total landlords
    const [landlordCount] = await pool.query('SELECT COUNT(*) as total FROM landlords');

    // Total tenants
    const [tenantCount] = await pool.query('SELECT COUNT(*) as total FROM tenants');

    // Total staff
    const [staffCount] = await pool.query('SELECT COUNT(*) as total FROM staff');

    // Total active leases
    const [activeLeases] = await pool.query(
      "SELECT COUNT(*) as total FROM leases WHERE status = 'Active'"
    );

    // ── REVENUE: all payments received (Paid) ──
    const [totalRevenue] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Paid'"
    );

    // Revenue this month
    const [revenueThisMonth] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments 
       WHERE status = 'Paid' 
       AND MONTH(payment_date) = MONTH(CURRENT_DATE()) 
       AND YEAR(payment_date) = YEAR(CURRENT_DATE())`
    );

    // Revenue last month
    const [revenueLastMonth] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments 
       WHERE status = 'Paid' 
       AND MONTH(payment_date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH)) 
       AND YEAR(payment_date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
    );

    // ── Late fees collected ──
    const [totalLateFees] = await pool.query(
      "SELECT COALESCE(SUM(late_fee_amount), 0) as total FROM payments WHERE status = 'Paid'"
    );

    // ── EXPENSES: total costs ──
    const [totalExpenses] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM expenses'
    );

    // Expenses this month
    const [expensesThisMonth] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
       WHERE MONTH(expense_date) = MONTH(CURRENT_DATE()) 
       AND YEAR(expense_date) = YEAR(CURRENT_DATE())`
    );

    // ── PROFIT ──
    const profit = parseFloat(totalRevenue[0].total) - parseFloat(totalExpenses[0].total);
    const profitThisMonth = parseFloat(revenueThisMonth[0].total) - parseFloat(expensesThisMonth[0].total);

    // ── Overdue payments ──
    const [overdueCount] = await pool.query(
      "SELECT COUNT(*) as total FROM payments WHERE status = 'Overdue'"
    );
    const [overdueAmount] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Overdue'"
    );

    // ── Pending payments ──
    const [pendingAmount] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'Pending'"
    );

    // ── Open maintenance requests ──
    const [openMaintenance] = await pool.query(
      "SELECT COUNT(*) as total FROM maintenance_requests WHERE status IN ('Pending', 'In Progress')"
    );

    // ── Open objections ──
    const [openObjections] = await pool.query(
      "SELECT COUNT(*) as total FROM objections WHERE status IN ('Open', 'Under Review')"
    );

    // ── Unpaid utility bills ──
    const [unpaidUtilities] = await pool.query(
      "SELECT COUNT(*) as total, COALESCE(SUM(amount), 0) as total_amount FROM utility_bills WHERE status = 'Unpaid'"
    );

    // ── Monthly revenue for last 6 months (for chart) ──
    const [monthlyRevenue] = await pool.query(
      `SELECT DATE_FORMAT(payment_date, '%Y-%m') as month, 
              COALESCE(SUM(amount), 0) as revenue
       FROM payments WHERE status = 'Paid' 
       AND payment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
       ORDER BY month ASC`
    );

    // ── Monthly expenses for last 6 months ──
    const [monthlyExpenses] = await pool.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') as month, 
              COALESCE(SUM(amount), 0) as expense
       FROM expenses 
       WHERE expense_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
       ORDER BY month ASC`
    );

    // ── Expense breakdown by category ──
    const [expenseByCategory] = await pool.query(
      `SELECT category, COALESCE(SUM(amount), 0) as total 
       FROM expenses GROUP BY category ORDER BY total DESC`
    );

    // ── Recent payments (last 10) ──
    const [recentPayments] = await pool.query(
      `SELECT py.*, t.name as tenant_name, u.unit_number, p.name as property_name, ll.name as landlord_name
       FROM payments py
       JOIN leases l ON py.lease_id = l.lease_id
       JOIN tenants t ON l.tenant_id = t.tenant_id
       JOIN units u ON l.unit_id = u.unit_id
       JOIN properties p ON u.property_id = p.property_id
       JOIN landlords ll ON p.landlord_id = ll.landlord_id
       ORDER BY py.payment_date DESC LIMIT 10`
    );

    // ── Recent expenses (last 10) ──
    const [recentExpenses] = await pool.query(
      `SELECT e.*, p.name as property_name 
       FROM expenses e 
       JOIN properties p ON e.property_id = p.property_id 
       ORDER BY e.expense_date DESC LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        // Counts
        totalProperties: propCount[0].total,
        totalUnits: unitStats[0].total_units || 0,
        vacantUnits: unitStats[0].vacant_units || 0,
        occupiedUnits: unitStats[0].occupied_units || 0,
        maintenanceUnits: unitStats[0].maintenance_units || 0,
        totalLandlords: landlordCount[0].total,
        totalTenants: tenantCount[0].total,
        totalStaff: staffCount[0].total,
        activeLeases: activeLeases[0].total,

        // Financials
        totalRevenue: parseFloat(totalRevenue[0].total),
        revenueThisMonth: parseFloat(revenueThisMonth[0].total),
        revenueLastMonth: parseFloat(revenueLastMonth[0].total),
        totalLateFees: parseFloat(totalLateFees[0].total),
        totalExpenses: parseFloat(totalExpenses[0].total),
        expensesThisMonth: parseFloat(expensesThisMonth[0].total),
        totalProfit: profit,
        profitThisMonth: profitThisMonth,
        overduePayments: overdueCount[0].total,
        overdueAmount: parseFloat(overdueAmount[0].total),
        pendingAmount: parseFloat(pendingAmount[0].total),
        openMaintenanceRequests: openMaintenance[0].total,
        openObjections: openObjections[0].total,
        unpaidUtilities: unpaidUtilities[0].total,
        unpaidUtilityAmount: parseFloat(unpaidUtilities[0].total_amount),

        // Charts
        monthlyRevenue,
        monthlyExpenses,
        expenseByCategory,

        // Recent activity
        recentPayments,
        recentExpenses,
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all landlords (admin only)
const getAllLandlords = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.landlord_id, l.name, l.email, l.contact, l.created_at,
        (SELECT COUNT(*) FROM properties WHERE landlord_id = l.landlord_id) as property_count
       FROM landlords l ORDER BY l.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all landlords error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all tenants (admin only)
const getAllTenants = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.tenant_id, t.name, t.email, t.phone, t.nid, t.created_at,
        (SELECT COUNT(*) FROM leases WHERE tenant_id = t.tenant_id AND status = 'Active') as active_leases
       FROM tenants t ORDER BY t.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all tenants error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all properties (admin only)
const getAllProperties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, ll.name as landlord_name,
        (SELECT COUNT(*) FROM units WHERE property_id = p.property_id) as unit_count,
        (SELECT COUNT(*) FROM units WHERE property_id = p.property_id AND status = 'Vacant') as vacant_count
       FROM properties p
       JOIN landlords ll ON p.landlord_id = ll.landlord_id
       ORDER BY p.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all properties error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all staff (admin only)
const getAllStaff = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.staff_id, s.name, s.email, s.role, s.phone, s.created_at,
        ll.name as landlord_name
       FROM staff s
       JOIN landlords ll ON s.landlord_id = ll.landlord_id
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all staff error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all objections (admin only)
const getAllObjections = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.*,
        t.name as tenant_name, t.email as tenant_email,
        CASE 
          WHEN o.against_role = 'Landlord' THEN (SELECT name FROM landlords WHERE landlord_id = o.against_id)
          WHEN o.against_role = 'Staff' THEN (SELECT name FROM staff WHERE staff_id = o.against_id)
        END as against_name,
        a.name as reviewer_name
      FROM objections o
      JOIN tenants t ON o.tenant_id = t.tenant_id
      LEFT JOIN admins a ON o.reviewed_by = a.admin_id
      WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND o.status = ?'; params.push(status); }

    query += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all objections error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all payments (admin view)
const getAllPayments = async (req, res) => {
  try {
    const { status, landlord_id } = req.query;
    let query = `
      SELECT py.*, t.name as tenant_name, u.unit_number, p.name as property_name, ll.name as landlord_name
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      JOIN landlords ll ON p.landlord_id = ll.landlord_id
      WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND py.status = ?'; params.push(status); }
    if (landlord_id) { query += ' AND ll.landlord_id = ?'; params.push(landlord_id); }

    query += ' ORDER BY py.due_date DESC LIMIT 100';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all payments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Get all maintenance requests (admin view)
const getAllMaintenance = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT mr.*, u.unit_number, p.name as property_name, t.name as tenant_name,
        ll.name as landlord_name,
        (SELECT s.name FROM maintenance_assignments ma JOIN staff s ON ma.staff_id = s.staff_id 
         WHERE ma.request_id = mr.request_id LIMIT 1) as assigned_staff
      FROM maintenance_requests mr
      JOIN units u ON mr.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      JOIN tenants t ON mr.tenant_id = t.tenant_id
      JOIN landlords ll ON p.landlord_id = ll.landlord_id
      WHERE 1=1`;
    const params = [];

    if (status) { query += ' AND mr.status = ?'; params.push(status); }

    query += ' ORDER BY mr.submitted_at DESC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get all maintenance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { 
  getAdminDashboard, getAllLandlords, getAllTenants, getAllProperties, 
  getAllStaff, getAllObjections, getAllPayments, getAllMaintenance 
};
