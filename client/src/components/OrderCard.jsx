import { STATUS_LABELS, STATUS_COLORS } from '../constants/orderStatus';
const OrderCard = ({ order, formatDate, adminFooter }) => (
  <article className="order-card">
    <div className="order-card-header">
      <div>
        <span className="order-date">{formatDate(order.createdAt)}</span>
        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
        {order.userId?.email && (
          <span className="order-user-email"> · {order.userId.email}</span>
        )}
      </div>
      <span
        className="order-status-badge"
        style={{ background: STATUS_COLORS[order.status] }}
      >
        {STATUS_LABELS[order.status]}
      </span>
    </div>
    {order.customer && (
      <div className="order-customer-info">
        <strong>{order.customer.name}</strong> · {order.customer.phone}
        {order.delivery.type === 'delivery'
          ? ` · 🚚 ${order.delivery.address}`
          : ' · 🏪 איסוף עצמי'}
      </div>
    )}
    {!order.customer && (
      <div className="order-delivery-info">
        {order.delivery.type === 'pickup'
          ? '🏪 איסוף עצמי'
          : `🚚 משלוח לבית — ${order.delivery.address}`}
      </div>
    )}
    <div className="order-items-list">
      {order.items.map((item, i) => (
        <div key={i} className="order-item-row">
          <span>{item.name} × {item.quantity}</span>
          <span>₪{item.price * item.quantity}</span>
        </div>
      ))}
    </div>
    <div className="order-card-footer">
      <strong>סה״כ: ₪{order.total}</strong>
      {adminFooter && adminFooter(order)}
    </div>
  </article>
);
export default OrderCard;