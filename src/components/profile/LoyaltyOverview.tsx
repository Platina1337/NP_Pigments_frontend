import React, { useEffect, useState } from 'react'
import { api, formatPrice } from '@/lib/api'
import { LoyaltyAccount, LoyaltyTransaction } from '@/types'
import { Card, Button } from '@/components/ui'

export const LoyaltyOverview: React.FC = () => {
  const [account, setAccount] = useState<LoyaltyAccount | null>(null)
  const [history, setHistory] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const [accountRes, txRes] = await Promise.all([
        api.loyalty.account(),
        api.loyalty.transactions(),
      ])

      if (accountRes.data && typeof accountRes.data === 'object') {
        setAccount(accountRes.data as LoyaltyAccount)
      }
      if (Array.isArray(txRes.data)) {
        setHistory((txRes.data as LoyaltyTransaction[]).slice(0, 5))
      } else if ((txRes.data as any)?.results) {
        setHistory(((txRes.data as any).results as LoyaltyTransaction[]).slice(0, 5))
      }
      setLoading(false)
    }

    void fetchData()
  }, [])

  const tierTitle: Record<string, string> = {
    bronze: 'Бронза',
    silver: 'Серебро',
    gold: 'Золото',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-foreground/60">Программа лояльности</p>
          <h3 className="text-xl font-semibold">Баланс и бонусы</h3>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {account ? tierTitle[account.tier] || account.tier : '—'}
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/60">Загружаем баланс...</p>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-primary">{account?.balance ?? 0} баллов</p>
              <p className="text-sm text-foreground/60">
                Можно оплатить до 20% заказа · {formatPrice(account ? account.balance : 0)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-foreground/50">Всего начислено</p>
              <p className="text-sm font-semibold">{account?.lifetime_earned ?? 0} баллов</p>
              <p className="text-xs text-foreground/50">Всего потрачено</p>
              <p className="text-sm font-semibold">{account?.lifetime_redeemed ?? 0} баллов</p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-foreground/70">
              Начисляем 5% баллами за оплаченные заказы. Баллами можно покрыть до 20% суммы корзины.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">Последние операции</h4>
              <Button
                variant="secondary"
                size="sm"
                className="bg-transparent border-0 shadow-none hover:bg-transparent text-primary"
                onClick={async () => {
                const res = await api.loyalty.transactions()
                if (Array.isArray(res.data)) {
                  setHistory(res.data as LoyaltyTransaction[])
                } else if ((res.data as any)?.results) {
                  setHistory((res.data as any).results as LoyaltyTransaction[])
                }
              }}>
                Обновить
              </Button>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-foreground/60">Операций пока нет.</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-sm border-b border-border/60 pb-2">
                    <div>
                      <p className="font-medium">
                        {tx.transaction_type === 'earn' && 'Начисление'}
                        {tx.transaction_type === 'redeem' && 'Списание'}
                        {tx.transaction_type === 'refund' && 'Возврат'}
                        {tx.transaction_type === 'adjust' && 'Корректировка'}
                        {tx.order_id ? ` · Заказ #${tx.order_id}` : ''}
                      </p>
                      {tx.description && (
                        <p className="text-foreground/60 text-xs">{tx.description}</p>
                      )}
                    </div>
                    <span className={`font-semibold ${tx.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  )
}

