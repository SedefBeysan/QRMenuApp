import React, { useState, useEffect } from 'react';

const API_BASE = "http://127.0.0.1:8000";

const STATUS_LABELS = {
  beklemede: 'Beklemede',
  hazirlaniyor: 'Hazırlanıyor',
  tamamlandi: 'Tamamlandı',
  iptal: 'İptal',
};

const STATUS_BADGE = {
  beklemede: 'bg-gray-100 text-gray-600',
  hazirlaniyor: 'bg-yellow-100 text-yellow-700',
  tamamlandi: 'bg-green-100 text-green-700',
  iptal: 'bg-red-100 text-red-700',
};

function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  // Açılışta ve her 15 saniyede bir siparişleri çek
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchOrders();
      } else {
        alert('Durum güncellenemedi.');
      }
    } catch {
      alert('Sunucuya bağlanılamadı.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
      {/* HEADER */}
      <header className="bg-[#63445d] text-white px-4 py-4 sticky top-0 z-50 shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black tracking-tight">Mutfak Ekranı</h1>
          <p className="text-[11px] text-white/70 font-medium">
            Aktif siparişler • 15 sn'de bir yenilenir
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          ↻ Yenile
        </button>
      </header>

      <main className="p-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center text-gray-400 font-bold py-20">Yükleniyor...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-400 font-bold py-20">Aktif sipariş yok 🎉</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
              >
                {/* Kart başlık: masa + saat + durum */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div>
                    <p className="font-black text-[#63445d] text-base">
                      {order.table?.name || 'Masa ?'}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {formatTime(order.created_at)} • #{order.id}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {/* Ürünler: isim + adet */}
                <div className="px-4 py-3 space-y-1.5 flex-1">
                  {order.items?.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">
                          {item.product?.name || 'Ürün'}
                        </span>
                        <span className="text-gray-500 font-bold">x{item.quantity}</span>
                      </div>
                      {item.note && (
                        <p className="text-[11px] text-gray-500 italic mt-0.5">Not: {item.note}</p>
                      )}
                    </div>
                  ))}
                  {order.note && (
                    <p className="text-[11px] text-gray-500 italic pt-1">Not: {order.note}</p>
                  )}
                </div>

                {/* Toplam tutar */}
                <div className="flex justify-between items-center px-4 py-2 bg-gray-50/60">
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
                    Toplam
                  </span>
                  <span className="font-black text-[#63445d]">
                    {Number(order.total).toFixed(2)} TL
                  </span>
                </div>

                {/* Durum güncelleme butonları */}
                <div className="flex gap-2 p-3">
                  {order.status === 'beklemede' && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, 'hazirlaniyor')}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-60"
                    >
                      Hazırlanıyor
                    </button>
                  )}
                  {order.status === 'hazirlaniyor' && (
                    <button
                      disabled={updatingId === order.id}
                      onClick={() => updateStatus(order.id, 'tamamlandi')}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide bg-green-500 text-white hover:bg-green-600 transition-all active:scale-95 disabled:opacity-60"
                    >
                      Tamamlandı
                    </button>
                  )}
                  <button
                    disabled={updatingId === order.id}
                    onClick={() => updateStatus(order.id, 'iptal')}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 disabled:opacity-60"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Kitchen;
