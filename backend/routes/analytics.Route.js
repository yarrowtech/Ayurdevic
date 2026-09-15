import express from "express";
import Visit from "../model/Visit.js";
import { parseRange } from "../configs/dateRange.js";

const router = express.Router();

// GET /api/admin/analytics/summary?from=&to= — logins, guest vs signed-in
// visits, top viewed products/pages, and a recent activity log.
router.get("/summary", async (req, res) => {
  try {
    const { from, to } = parseRange(req.query);
    const dateMatch = { createdAt: { $gte: from, $lte: to } };
    const viewMatch = { ...dateMatch, type: { $in: ["page_view", "product_view"] } };

    const [pageViews, productViews, logins, loggedInVisits, anonymousVisits] = await Promise.all([
      Visit.countDocuments({ ...dateMatch, type: "page_view" }),
      Visit.countDocuments({ ...dateMatch, type: "product_view" }),
      Visit.countDocuments({ ...dateMatch, type: "login" }),
      Visit.countDocuments({ ...viewMatch, user: { $ne: null } }),
      Visit.countDocuments({ ...viewMatch, user: null }),
    ]);

    const [uniqueVisitorAgg] = await Visit.aggregate([
      { $match: viewMatch },
      { $group: { _id: "$visitorId" } },
      { $count: "count" },
    ]);

    const daily = (await Visit.aggregate([
      { $match: { ...dateMatch, type: { $in: ["page_view", "product_view", "login"] } } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        visits: { $sum: { $cond: [{ $in: ["$type", ["page_view", "product_view"]] }, 1, 0] } },
        logins: { $sum: { $cond: [{ $eq: ["$type", "login"] }, 1, 0] } },
      } },
      { $sort: { _id: 1 } },
    ])).map(row => ({ date: row._id, visits: row.visits, logins: row.logins }));

    const topProducts = (await Visit.aggregate([
      { $match: { ...dateMatch, type: "product_view", product: { $ne: null } } },
      { $group: { _id: "$product", name: { $first: "$productName" }, views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ])).map(row => ({ productId: row._id, name: row.name || "Deleted product", views: row.views }));

    const topPages = (await Visit.aggregate([
      { $match: { ...dateMatch, type: "page_view", path: { $ne: "" } } },
      { $group: { _id: "$path", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
    ])).map(row => ({ path: row._id, views: row.views }));

    const recent = (await Visit.find(dateMatch).sort({ createdAt: -1 }).limit(50))
      .map(v => ({ id: v._id, type: v.type, path: v.path, productName: v.productName, userName: v.userName, createdAt: v.createdAt }));

    res.json({
      success: true,
      range: { from: from.toISOString(), to: to.toISOString() },
      totals: {
        pageViews, productViews, logins,
        uniqueVisitors: uniqueVisitorAgg?.count || 0,
        loggedInVisits, anonymousVisits,
      },
      daily, topProducts, topPages, recent,
    });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: "Unable to load analytics." }); }
});

export default router;
