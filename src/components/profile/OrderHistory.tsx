'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { ShoppingBag, Eye, Package, Truck, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { Order } from '@/types/api';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/api';

const statusConfig = {
  pending: {
    label: 'Ожидает оплаты',
    icon: Clock,
    color: 'text-yellow-600 bg-yellow-100',
  },
  paid: {
    label: 'Оплачен',
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-100',
  },
  processing: {
    label: 'В обработке',
    icon: Package,
    color: 'text-purple-600 bg-purple-100',
  },
  shipped: {
    label: 'Отправлен',
    icon: Truck,
    color: 'text-orange-600 bg-orange-100',
  },
  delivered: {
    label: 'Доставлен',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
  },
  cancelled: {
    label: 'Отменен',
    icon: XCircle,
    color: 'text-red-600 bg-red-100',
  },
};

export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.orders.getAll();
      if (response.data) {
        setOrders(Array.isArray(response.data) ? response.data : (response.data as {results?: any[]}).results || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <Icon icon={ShoppingBag} size={48} className="text-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            У вас пока нет заказов
          </h3>
          <p className="text-foreground/70 mb-6">
            Ваши будущие заказы будут отображаться здесь
          </p>
          <Button>
            Начать покупки
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon icon={ShoppingBag} size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-foreground">
              История заказов
            </h2>
            <p className="text-sm text-foreground/70">
              Все ваши заказы в одном месте
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;

            return (
              <div
                key={order.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status.color}`}>
                      <StatusIcon size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Заказ #{order.id}
                      </p>
                      <p className="text-sm text-foreground/70">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatPrice(order.total)}
                    </p>
                    <p className={`text-sm px-2 py-1 rounded-full inline-block ${status.color}`}>
                      {status.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-foreground/70">
                    {order.items.length} {order.items.length === 1 ? 'товар' :
                      order.items.length < 5 ? 'товара' : 'товаров'}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center space-x-2"
                  >
                    <Icon icon={Eye} size={14} />
                    <span>Подробнее</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-xl">
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Заказ #{selectedOrder.id}
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <Icon icon={X} size={16} />
                </Button>
              </div>

              {/* Order Status */}
              <div className="mb-6">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${statusConfig[selectedOrder.status].color}`}>
                  {React.createElement(statusConfig[selectedOrder.status].icon, { size: 14 })}
                  <span>{statusConfig[selectedOrder.status].label}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-3">Товары</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-foreground/70">
                          {formatPrice(item.unit_price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {formatPrice(item.total_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Сумма товаров:</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70">Доставка:</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.delivery_cost)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">Итого:</span>
                  <span className="text-foreground">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Информация о доставке</h4>
                <div className="space-y-2 text-sm text-foreground/70">
                  <p><strong>Адрес:</strong> {selectedOrder.delivery_address}</p>
                  <p><strong>Город:</strong> {selectedOrder.delivery_city}</p>
                  <p><strong>Индекс:</strong> {selectedOrder.delivery_postal_code}</p>
                  <p><strong>Телефон:</strong> {selectedOrder.delivery_phone}</p>
                </div>
              </div>

              {/* Order Dates */}
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Даты</h4>
                <div className="space-y-2 text-sm text-foreground/70">
                  <p><strong>Создан:</strong> {new Date(selectedOrder.created_at).toLocaleString('ru-RU')}</p>
                  {selectedOrder.paid_at && (
                    <p><strong>Оплачен:</strong> {new Date(selectedOrder.paid_at).toLocaleString('ru-RU')}</p>
                  )}
                  {selectedOrder.shipped_at && (
                    <p><strong>Отправлен:</strong> {new Date(selectedOrder.shipped_at).toLocaleString('ru-RU')}</p>
                  )}
                  {selectedOrder.delivered_at && (
                    <p><strong>Доставлен:</strong> {new Date(selectedOrder.delivered_at).toLocaleString('ru-RU')}</p>
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customer_notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-2">Комментарий</h4>
                  <p className="text-sm text-foreground/70">{selectedOrder.customer_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
