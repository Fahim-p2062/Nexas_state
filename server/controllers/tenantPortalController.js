const pool = require('../config/db');

// Get tenant's own dashboard data
const getTenantDashboard = async (req, res) => {
  try {
    const tenantId = req.user.id;

    // Get ALL leases for this tenant (active + history) with rental area details
    const [allLeases] = await pool.query(
      `SELECT 
        l.lease_id, l.unit_id, l.tenant_id, l.start_date, l.end_date, l.monthly_rent, l.security_deposit, l.status, l.created_at,
        u.unit_number, u.meter_number, u.area_sqft, u.bedrooms, u.bathrooms, u.floor,
        p.property_id, p.name as property_name, p.address as property_address, p.city, p.type
      FROM leases l
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE l.tenant_id = ?
      ORDER BY (l.status = 'Active') DESC, l.start_date DESC`,
      [tenantId]
    );

    const activeLease = allLeases.find(l => l.status === 'Active') || null;

    // Get payment history (including late_fee_amount, rent_month, rent_year)
    const [payments] = await pool.query(
      `SELECT py.* FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      WHERE l.tenant_id = ?
      ORDER BY py.due_date DESC, py.payment_date DESC LIMIT 50`,
      [tenantId]
    );

    // Summary counts for tenant
    const [paymentSummary] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN py.status = 'Paid' THEN py.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN py.status IN ('Pending','Overdue') THEN py.amount ELSE 0 END), 0) as total_due,
        COALESCE(SUM(CASE WHEN py.status = 'Paid' THEN py.late_fee_amount ELSE 0 END), 0) as total_late_fees,
        COALESCE(COUNT(*), 0) as total_payments
      FROM payments py
      JOIN leases l ON py.lease_id = l.lease_id
      WHERE l.tenant_id = ?`,
      [tenantId]
    );

    // Get maintenance requests
    const [maintenance] = await pool.query(
      `SELECT mr.*, u.unit_number FROM maintenance_requests mr
      JOIN units u ON mr.unit_id = u.unit_id
      WHERE mr.tenant_id = ?
      ORDER BY mr.submitted_at DESC LIMIT 10`,
      [tenantId]
    );

    // Get utility bills for tenant's active unit(s)
    const [utilityBills] = await pool.query(
      `SELECT ub.*, u.unit_number, p.name as property_name
       FROM utility_bills ub
       JOIN units u ON ub.unit_id = u.unit_id
       JOIN properties p ON u.property_id = p.property_id
       JOIN leases l ON l.unit_id = u.unit_id AND l.tenant_id = ?
       WHERE l.status = 'Active'
       ORDER BY ub.created_at DESC LIMIT 20`,
      [tenantId]
    );

    // Get notifications
    const [notifications] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? AND user_role = 'Tenant' ORDER BY created_at DESC LIMIT 10",
      [tenantId]
    );

    res.json({
      success: true,
      data: {
        activeLease,
        allLeases,
        recentPayments: payments,
        paymentSummary: paymentSummary[0] || { total_paid: 0, total_due: 0, total_late_fees: 0, total_payments: 0 },
        maintenanceRequests: maintenance,
        utilityBills,
        notifications
      }
    });
  } catch (err) {
    console.error('Tenant dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getTenantDashboard };
