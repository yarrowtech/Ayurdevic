import express from "express";
import ExcelJS from "exceljs";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.modal.js";
import { parseRange } from "../configs/dateRange.js";

const router = express.Router();

const csvEscape = value => {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const toCsv = (rows, columns) => [
  columns.map(column => csvEscape(column.label)).join(","),
  ...rows.map(row => columns.map(column => csvEscape(column.value(row))).join(",")),
].join("\r\n");
const sendCsv = (res, filename, csv) => {
  res.set("Content-Type", "text/csv; charset=utf-8");
  res.set("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(`﻿${csv}`); // BOM so Excel opens UTF-8 correctly
};

// Builds a real .xlsx workbook (bold header row, auto-sized columns, filter).
const sendXlsx = async (res, filename, columns, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");
  sheet.columns = columns.map(column => ({ header: column.label, key: column.label, width: Math.max(12, column.label.length + 4) }));
  for (const row of rows) {
    sheet.addRow(Object.fromEntries(columns.map(column => [column.label, column.value(row)])));
  }
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7F3D3" } };
  if (columns.length) sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  res.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.set("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

// GET /api/admin/reports/summary?from=&to= — sales, product and user analytics
// for the given date range (defaults to the last 30 days).
router.get("/summary", async (req, res) => {
  try {
    const { from, to } = parseRange(req.query);
    const dateMatch = { createdAt: { $gte: from, $lte: to } };

    const [orderTotals] = await Order.aggregate([
      { $match: dateMatch },
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, totalOrders: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(
      (await Order.aggregate([{ $match: dateMatch }, { $group: { _id: "$status", count: { $sum: 1 } } }])).map(row => [row._id, row.count])
    );
    const byPaymentMethod = Object.fromEntries(
      (await Order.aggregate([{ $match: dateMatch }, { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }])).map(row => [row._id, row.count])
    );
    const daily = (await Order.aggregate([
      { $match: dateMatch },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])).map(row => ({ date: row._id, revenue: row.revenue, orders: row.orders }));
    const productSales = (await Order.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, image: { $first: "$items.image" }, quantitySold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 200 },
    ])).map(row => ({ productId: row._id, name: row.name, image: row.image, quantitySold: row.quantitySold, revenue: row.revenue }));
    const byCategory = (await Order.aggregate([
      { $match: dateMatch },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDoc" } },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$productDoc.category", "Unknown"] }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, quantitySold: { $sum: "$items.quantity" } } },
      { $sort: { revenue: -1 } },
    ])).map(row => ({ category: row._id, revenue: row.revenue, quantitySold: row.quantitySold }));

    const [totalProducts, inStockProducts] = await Promise.all([
      Product.countDocuments(), Product.countDocuments({ inStock: true }),
    ]);

    const [totalUsers, newUsersInRange, byRoleAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: from, $lte: to } }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    ]);
    const byRole = Object.fromEntries(byRoleAgg.map(row => [row._id || "user", row.count]));

    res.json({
      success: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      sales: {
        totalRevenue: orderTotals?.totalRevenue || 0,
        totalOrders: orderTotals?.totalOrders || 0,
        averageOrderValue: orderTotals?.totalOrders ? orderTotals.totalRevenue / orderTotals.totalOrders : 0,
        daily, byStatus, byPaymentMethod, byCategory,
      },
      products: {
        totalProducts, inStockProducts, outOfStockProducts: totalProducts - inStockProducts,
        productSales,
      },
      users: { totalUsers, newUsersInRange, byRole },
    });
  } catch (error) { req.log.error({ err: error }, "Unable to load reports"); res.status(500).json({ success: false, message: "Unable to load reports." }); }
});

// GET /api/admin/reports/export?type=orders|products|users|category-sales|product-sales
//   &from=&to=&format=csv|xlsx — spreadsheet download.
router.get("/export", async (req, res) => {
  try {
    const { from, to } = parseRange(req.query);
    const dateMatch = { createdAt: { $gte: from, $lte: to } };
    const format = req.query.format === "xlsx" ? "xlsx" : "csv";

    let name, columns, rows;
    if (req.query.type === "orders") {
      name = "orders-report";
      rows = await Order.find(dateMatch).sort({ createdAt: -1 }).limit(5000);
      columns = [
        { label: "Order ID", value: o => String(o._id) },
        { label: "Date", value: o => o.createdAt.toISOString() },
        { label: "Status", value: o => o.status },
        { label: "Payment Method", value: o => o.paymentMethod },
        { label: "Items", value: o => o.items.reduce((sum, item) => sum + item.quantity, 0) },
        { label: "Subtotal", value: o => o.subtotal },
        { label: "Tax", value: o => o.tax },
        { label: "Shipping", value: o => o.shippingFee },
        { label: "Total", value: o => o.total },
      ];
    } else if (req.query.type === "products") {
      name = "products-report";
      rows = await Product.find().sort({ createdAt: -1 }).limit(5000);
      columns = [
        { label: "Name", value: p => p.name },
        { label: "Category", value: p => p.category },
        { label: "Regular Price", value: p => p.price },
        { label: "Sale Price", value: p => p.offerPrice },
        { label: "In Stock", value: p => p.inStock ? "Yes" : "No" },
        { label: "Best Seller", value: p => p.isBestSeller ? "Yes" : "No" },
        { label: "Shown In Banner", value: p => p.showInBanner ? "Yes" : "No" },
        { label: "Created", value: p => p.createdAt.toISOString() },
      ];
    } else if (req.query.type === "users") {
      name = "users-report";
      rows = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(5000);
      columns = [
        { label: "Name", value: u => u.name },
        { label: "Email", value: u => u.email },
        { label: "Role", value: u => u.role },
        { label: "Joined", value: u => u.createdAt.toISOString() },
      ];
    } else if (req.query.type === "product-sales") {
      name = "product-sales-report";
      rows = await Order.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        { $group: { _id: "$items.product", name: { $first: "$items.name" }, quantitySold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { revenue: -1 } },
        { $limit: 5000 },
      ]);
      columns = [
        { label: "Product", value: r => r.name },
        { label: "Units Sold", value: r => r.quantitySold },
        { label: "Revenue", value: r => r.revenue },
      ];
    } else if (req.query.type === "category-sales") {
      name = "category-sales-report";
      rows = await Order.aggregate([
        { $match: dateMatch },
        { $unwind: "$items" },
        { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDoc" } },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$productDoc.category", "Unknown"] }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, quantitySold: { $sum: "$items.quantity" } } },
        { $sort: { revenue: -1 } },
      ]);
      columns = [
        { label: "Category", value: r => r._id },
        { label: "Units Sold", value: r => r.quantitySold },
        { label: "Revenue", value: r => r.revenue },
      ];
    } else {
      return res.status(400).json({ success: false, message: "Unknown report type." });
    }

    if (format === "xlsx") await sendXlsx(res, `${name}.xlsx`, columns, rows);
    else sendCsv(res, `${name}.csv`, toCsv(rows, columns));
  } catch (error) { req.log.error({ err: error, type: req.query.type }, "Unable to generate report export"); res.status(500).json({ success: false, message: "Unable to generate this report." }); }
});

export default router;
