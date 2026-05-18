const pool = require('../config/db');

const getDashboardSummary = async (req, res) => {
  try {
    const landlordId = req.user.id;

    // Total properties
    const [propCount] = await pool.query(
      'SELECT COUNT(*) as total FROM properties WHERE landlord_id = ?', [landlordId]
    );

    // Total units & vacant units
    const [unitStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN u.status = 'Vacant' THEN 1 ELSE 0 END) as vacant_units,
        SUM(CASE WHEN u.status = 'Occupied' THEN 1 ELSE 0 END) as occupied_units,
        SUM(CASE WHEN u.status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance_units
      FROM units u 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ?`, [landlordId]
    );

    // Total tenants (with active leases on landlord's properties)
    const [tenantCount] = await pool.query(
      `SELECT COUNT(DISTINCT l.tenant_id) as total 
      FROM leases l 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND l.status = 'Active'`, [landlordId]
    );

    // Rent collected this month
    const [rentCollected] = await pool.query(
      `SELECT COALESCE(SUM(py.amount), 0) as total 
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND py.status = 'Paid' 
      AND MONTH(py.payment_date) = MONTH(CURRENT_DATE()) 
      AND YEAR(py.payment_date) = YEAR(CURRENT_DATE())`, [landlordId]
    );

    // Total revenue all time
    const [totalRevenue] = await pool.query(
      `SELECT COALESCE(SUM(py.amount), 0) as total 
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND py.status = 'Paid'`, [landlordId]
    );

    // Total late fees collected
    const [lateFees] = await pool.query(
      `SELECT COALESCE(SUM(py.late_fee_amount), 0) as total 
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND py.status = 'Paid'`, [landlordId]
    );

    // Total expenses
    const [totalExpenses] = await pool.query(
      `SELECT COALESCE(SUM(e.amount), 0) as total 
      FROM expenses e 
      JOIN properties p ON e.property_id = p.property_id 
      WHERE p.landlord_id = ?`, [landlordId]
    );

    // Overdue payments count
    const [overdueCount] = await pool.query(
      `SELECT COUNT(*) as total 
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND py.status = 'Overdue'`, [landlordId]
    );

    // Pending payments count
    const [pendingCount] = await pool.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(py.amount), 0) as total_amount
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN units u ON l.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND py.status = 'Pending'`, [landlordId]
    );

    // Open maintenance requests
    const [maintenanceCount] = await pool.query(
      `SELECT COUNT(*) as total 
      FROM maintenance_requests mr 
      JOIN units u ON mr.unit_id = u.unit_id 
      JOIN properties p ON u.property_id = p.property_id 
      WHERE p.landlord_id = ? AND mr.status IN ('Pending', 'In Progress')`, [landlordId]
    );

    // Unpaid utility bills
    const [unpaidUtilities] = await pool.query(
      `SELECT COUNT(*) as total, COALESCE(SUM(ub.amount), 0) as total_amount
      FROM utility_bills ub
      JOIN units u ON ub.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE p.landlord_id = ? AND ub.status = 'Unpaid'`, [landlordId]
    );

    // Recent payments (last 5)
    const [recentPayments] = await pool.query(
      `SELECT py.*, t.name as tenant_name, un.unit_number, pr.name as property_name
      FROM payments py 
      JOIN leases l ON py.lease_id = l.lease_id 
      JOIN tenants t ON l.tenant_id = t.tenant_id
      JOIN units un ON l.unit_id = un.unit_id 
      JOIN properties pr ON un.property_id = pr.property_id 
      WHERE pr.landlord_id = ? 
      ORDER BY py.due_date DESC, py.payment_date DESC LIMIT 5`, [landlordId]
    );

    // Recent maintenance requests (last 5)
    const [recentMaintenance] = await pool.query(
      `SELECT mr.*, t.name as tenant_name, un.unit_number, pr.name as property_name
      FROM maintenance_requests mr 
      JOIN tenants t ON mr.tenant_id = t.tenant_id
      JOIN units un ON mr.unit_id = un.unit_id 
      JOIN properties pr ON un.property_id = pr.property_id 
      WHERE pr.landlord_id = ? 
      ORDER BY mr.submitted_at DESC LIMIT 5`, [landlordId]
    );

    res.json({
      success: true,
      data: {
        totalProperties: propCount[0].total,
        totalUnits: unitStats[0].total_units || 0,
        vacantUnits: unitStats[0].vacant_units || 0,
        occupiedUnits: unitStats[0].occupied_units || 0,
        maintenanceUnits: unitStats[0].maintenance_units || 0,
        totalTenants: tenantCount[0].total,
        rentCollectedThisMonth: rentCollected[0].total,
        totalRevenue: parseFloat(totalRevenue[0].total),
        totalLateFees: parseFloat(lateFees[0].total),
        totalExpenses: parseFloat(totalExpenses[0].total),
        overduePayments: overdueCount[0].total,
        pendingPayments: pendingCount[0].total,
        pendingAmount: parseFloat(pendingCount[0].total_amount),
        openMaintenanceRequests: maintenanceCount[0].total,
        unpaidUtilities: unpaidUtilities[0].total,
        unpaidUtilityAmount: parseFloat(unpaidUtilities[0].total_amount),
        recentPayments,
        recentMaintenance
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getDashboardSummary };
