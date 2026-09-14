const action = (label, to) => ({ label, to });
const contact = action("Contact the store", "/contact");
const ordersLink = action("View my orders", "/account?tab=orders");

export async function getSupportReply(message, { getOrders }) {
  const text = message.toLowerCase();
  if (/\b(refund|return|cancel|damaged|broken|missing|wrong item)\b/.test(text)) {
    return { text: "For a return, refund, cancellation, or a problem with an item, contact the store with your order details. I can help you find your orders, but I can't make changes or approve requests here.", actions: [ordersLink, contact] };
  }
  if (/\b(address|location|postcode|postal|pincode)\b/.test(text)) {
    return { text: 'Open Addresses to add or edit a delivery address. Select "Use current location" to fill available details, then check your house number and postal code before saving. For an address change on an existing order, contact the store.', actions: [action("Manage addresses", "/account?tab=addresses"), contact] };
  }
  if (/\b(order|orders|track|tracking|delivery|shipping|shipped|status)\b/.test(text)) {
    try {
      const data = await getOrders();
      if (!Array.isArray(data.orders)) throw new Error("Invalid order response");
      if (!data.orders.length) return { text: "You don't have any orders yet. Once you place an order, you can check its status here.", actions: [action("Browse products", "/products")] };
      const latest = [...data.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const items = latest.items?.map(item => item.name).filter(Boolean).join(", ");
      return { text: `Your latest order${items ? ` (${items})` : ""} has status: ${latest.status || "Not available"}. Open your orders for all the details. I don't have a delivery estimate or live courier tracking.`, actions: [ordersLink, contact] };
    } catch {
      return { text: "I couldn't load your orders right now. Please try again, or open My Orders to check your order details.", actions: [ordersLink] };
    }
  }
  if (/\b(product|products|ingredient|ingredients|price|stock|buy|shop)\b/.test(text)) {
    return { text: "You can browse our products and open an item to see its listed price and details. For information that isn't listed, contact the store with the product name.", actions: [action("Browse products", "/products"), contact] };
  }
  if (/\b(payment|pay|paid|cod|checkout|cash)\b/.test(text)) {
    return { text: "Open your cart to review your items, choose a saved address, and see the available payment options at checkout. For a payment issue, contact the store with your order details. Please don't share card details or OTPs in this chat.", actions: [action("Open cart", "/cart"), contact] };
  }
  if (/\b(contact|human|agent|person|email|phone|call|support)\b/.test(text)) {
    return { text: "You can find the store's available contact details on the contact page. This is an automated helper; messages here aren't sent to a support agent.", actions: [contact] };
  }
  if (/\b(hi|hello|hey|help)\b/.test(text)) {
    return { text: "Hi! I can help you check your latest order, manage addresses, find products, or contact the store. What would you like help with?" };
  }
  if (/\b(thanks|thank you)\b/.test(text)) return { text: "You're welcome! Let me know if you need help with anything else in the store." };
  return { text: "I'm an automated store helper with answers for common shopping questions. Try asking about order status, addresses, products, or payments. For anything else, contact the store.", actions: [contact] };
}
