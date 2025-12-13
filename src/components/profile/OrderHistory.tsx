'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon } from '@/components/ui';
import { ShoppingBag, Eye, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Order } from '@/types/api';
import { api, formatPrice } from '@/lib/api';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleViewOrder = (orderId: number) => {
    console.log('handleViewOrder called with orderId:', orderId);
    router.push(`/profile/orders/${orderId}`);
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
            console.log('Order:', order.id, order.status);
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
                    onClick={() => handleViewOrder(order.id)}
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

    </div>
  );
};
