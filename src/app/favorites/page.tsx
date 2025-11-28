import Link from 'next/link';
import { FavoriteProducts } from '@/components/profile/FavoriteProducts';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3 text-center md:text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-foreground/60">Коллекция</p>
        <h1 className="text-3xl font-semibold text-foreground">Избранные товары</h1>
        <p className="text-foreground/70">
          Сохраняйте ароматы и пигменты, чтобы вернуться к ним позже. Авторизуйтесь, чтобы синхронизировать
          список между устройствами.
        </p>
        <div className="flex justify-center gap-3 md:justify-start">
          <Link href="/products">
            <Button variant="secondary">
              Перейти к каталогу
            </Button>
          </Link>
        </div>
      </div>

      <FavoriteProducts />
    </div>
  );
}

