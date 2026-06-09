<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Table;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedTables();
        $this->seedMenu();
    }

    /**
     * 5 masa: Masa 01 - Masa 05, qr_code masa-01 ... masa-05.
     */
    private function seedTables(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $num = str_pad((string) $i, 2, '0', STR_PAD_LEFT);

            Table::create([
                'name' => "Masa {$num}",
                'qr_code' => "masa-{$num}",
                'is_active' => true,
            ]);
        }
    }

    /**
     * Frontend App.jsx içindeki menuData ile birebir aynı:
     * kategoriler, ikonlar, ürünler, fiyatlar ve extralar.
     * Extra fiyatı UI mantığıyla aynı: 'sos' -> 0 TL, diğerleri -> 15 TL.
     */
    private function seedMenu(): void
    {
        $menu = [
            [
                'name' => 'Waffle',
                'icon' => '🧇',
                'products' => [
                    ['id' => 101, 'name' => 'Klasik Waffle', 'price' => 180, 'desc' => '2 Sos ve 3 Meyve ile...'],
                ],
                'extras' => [
                    ['id' => 1, 'name' => 'Sütlü Çikolata', 'type' => 'sos', 'stock' => true],
                    ['id' => 2, 'name' => 'Bitter Çikolata', 'type' => 'sos', 'stock' => true],
                    ['id' => 3, 'name' => 'Çilekli Çikolata', 'type' => 'sos', 'stock' => true],
                    ['id' => 4, 'name' => 'Portakallı Çikolata', 'type' => 'sos', 'stock' => true],
                    ['id' => 5, 'name' => 'Çilek', 'type' => 'meyve', 'stock' => true],
                    ['id' => 6, 'name' => 'Muz', 'type' => 'meyve', 'stock' => true],
                    ['id' => 7, 'name' => 'Kivi', 'type' => 'meyve', 'stock' => false],
                    ['id' => 8, 'name' => 'Ananas', 'type' => 'meyve', 'stock' => true],
                    ['id' => 9, 'name' => 'Mango', 'type' => 'meyve', 'stock' => true],
                ],
            ],
            [
                'name' => 'Kumpir',
                'icon' => '🥔',
                'products' => [
                    ['id' => 201, 'name' => 'Özel Kumpir', 'price' => 210, 'desc' => 'Tereyağı ve Kaşarlı dev patates...'],
                ],
                'extras' => [
                    ['id' => 10, 'name' => 'Mısır', 'type' => 'malzeme', 'stock' => true],
                    ['id' => 11, 'name' => 'Sosis', 'type' => 'malzeme', 'stock' => true],
                    ['id' => 12, 'name' => 'Turşu', 'type' => 'malzeme', 'stock' => true],
                    ['id' => 13, 'name' => 'Zeytin', 'type' => 'malzeme', 'stock' => false],
                    ['id' => 14, 'name' => 'Mor Lahana Turşusu', 'type' => 'malzeme', 'stock' => true],
                    ['id' => 15, 'name' => 'Mayonez', 'type' => 'sos', 'stock' => true],
                    ['id' => 16, 'name' => 'Ketçap', 'type' => 'sos', 'stock' => true],
                    ['id' => 17, 'name' => 'Ranch Sos', 'type' => 'sos', 'stock' => true],
                ],
            ],
            [
                'name' => 'Kahve',
                'icon' => '☕',
                'products' => [
                    ['id' => 301, 'name' => 'Latte', 'price' => 90, 'desc' => 'Sütlü lezzet...'],
                    ['id' => 302, 'name' => 'Türk Kahvesi', 'price' => 75, 'desc' => 'Geleneksel tat...'],
                ],
                'extras' => [
                    ['id' => 20, 'name' => 'Ekstra Şeker', 'type' => 'ekstra', 'stock' => true],
                    ['id' => 21, 'name' => 'Süt Kaymağı', 'type' => 'ekstra', 'stock' => true],
                ],
            ],
            [
                'name' => 'Soğuk İçecek',
                'icon' => '🧋',
                'products' => [
                    ['id' => 401, 'name' => 'Limonata', 'price' => 40, 'desc' => 'Taze limon...'],
                    ['id' => 402, 'name' => 'Portakal Suyu', 'price' => 45, 'desc' => 'Doğal portakal...'],
                ],
                'extras' => [
                    ['id' => 30, 'name' => 'Ekstra Buz', 'type' => 'ekstra', 'stock' => true],
                    ['id' => 31, 'name' => 'Şeker', 'type' => 'ekstra', 'stock' => true],
                ],
            ],
            [
                'name' => 'Tatlı',
                'icon' => '🍰',
                'products' => [
                    ['id' => 501, 'name' => 'Çikolata Keki', 'price' => 85, 'desc' => 'Bol çikolatalı...'],
                    ['id' => 502, 'name' => 'Cheesecake', 'price' => 95, 'desc' => 'Yumuşak ve lezzetli...'],
                ],
                'extras' => [
                    ['id' => 40, 'name' => 'Vanilyalı Dondurma', 'type' => 'ekstra', 'stock' => true],
                    ['id' => 41, 'name' => 'Çikolata Soslu', 'type' => 'ekstra', 'stock' => true],
                ],
            ],
        ];

        foreach ($menu as $index => $cat) {
            $category = Category::create([
                'name' => $cat['name'],
                'icon' => $cat['icon'],
                'sort_order' => $index + 1,
                'is_active' => true,
            ]);

            foreach ($cat['products'] as $p) {
                $product = $category->products()->make([
                    'name' => $p['name'],
                    'description' => $p['desc'],
                    'price' => $p['price'],
                    'is_active' => true,
                ]);
                $product->id = $p['id'];
                $product->save();
            }

            foreach ($cat['extras'] as $e) {
                $extra = $category->extras()->make([
                    'name' => $e['name'],
                    'type' => $e['type'],
                    'price' => $e['type'] === 'sos' ? 0 : 15,
                    'in_stock' => $e['stock'],
                ]);
                $extra->id = $e['id'];
                $extra->save();
            }
        }
    }
}
