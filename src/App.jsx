import React, { useState, useEffect } from 'react';

const API_BASE = "http://127.0.0.1:8000";

function App() {
  // URL'den masa numarasını oku: ?masa=masa-01
  const params = new URLSearchParams(window.location.search);
  const masaQr = params.get('masa'); // "masa-01"
  const initialCustomerName = masaQr ? `Masa ${masaQr.replace('masa-', '')}` : "Misafir";

  const [step, setStep] = useState(0); // 0: Giriş, 1: Menü, 2: Sepet, 3: Teşekkür
  const [showModal, setShowModal] = useState(false);
  const [activeCat, setActiveCat] = useState("Waffle");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState("0500 000 00 00");
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tableId, setTableId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Modal açıldığında quantity'i 1'e, extra seçimini sıfırla
  useEffect(() => {
    if (showModal) {
      setQuantity(1);
      setSelectedExtras([]);
    }
  }, [showModal, selectedProduct]);

  // Extra fiyatı (mevcut mantıkla aynı): sos -> 0, diğerleri -> 15
  const extraPrice = (extra) => (extra.type === 'sos' ? 0 : 15);

  // Extra seç/kaldır (toggle)
  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  // Seçili extraların toplam fiyatı
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + extraPrice(e), 0);

  // Uygulama açılınca menüyü çek (/api/menu) ve object formatına dönüştür
  useEffect(() => {
    fetch(`${API_BASE}/api/menu`)
      .then((res) => res.json())
      .then((categories) => {
        // API array dönüyor; kategori name'i key olacak şekilde object'e çevir
        const formatted = {};
        categories.forEach((cat) => {
          formatted[cat.name] = {
            icon: cat.icon,
            items: cat.products.map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              desc: p.description,
            })),
            extras: cat.extras.map((e) => ({
              id: e.id,
              name: e.name,
              type: e.type,
              stock: e.in_stock,
            })),
          };
        });
        setMenuData(formatted);
        const firstCat = Object.keys(formatted)[0];
        if (firstCat) setActiveCat(firstCat);
      })
      .catch((err) => console.error('Menü yüklenemedi:', err))
      .finally(() => setLoading(false));
  }, []);

  // Masa QR'ından table_id çek (/api/tables?qr_code=masa-01)
  useEffect(() => {
    if (!masaQr) return;
    fetch(`${API_BASE}/api/tables?qr_code=${encodeURIComponent(masaQr)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((table) => {
        if (table) setTableId(table.id);
      })
      .catch((err) => console.error('Masa bulunamadı:', err));
  }, [masaQr]);

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans text-gray-800">
      {/* --- ADIM 0: GİRİŞ EKRANI (WELCOME) --- */}
      {step === 0 && (
        <div className="min-h-screen flex flex-col animate-in fade-in duration-500">
          {/* Üst Karşılama Alanı */}
          <div className="h-[45vh] bg-[#63445d] relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1573821663912-6df460f9c684?q=80&w=1000')] bg-cover bg-center"></div>
            <div className="relative z-10 text-center">
              <h1 className="text-white text-5xl font-black tracking-tighter italic">WELCOME</h1>
              <p className="text-white/80 font-bold mt-2 tracking-widest text-xs uppercase">Location Waffle & Coffee</p>
            </div>
          </div>

          {/* Teslimat Seçenekleri */}
          <div className="flex-1 bg-white -mt-10 rounded-t-[40px] px-6 pt-10 shadow-2xl z-20">
            <h2 className="text-center font-black text-[#4a332d] mb-8 text-lg">Lütfen Hizmet Tipini Seçiniz</h2>
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pb-10">
              {/* Seçenek 1: Teslimat */}
              <button 
                onClick={() => setStep(1)}
                className="bg-white border-2 border-gray-50 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 active:scale-95"
              >
                <span className="text-4xl">🛍️</span>
                <div className="text-center">
                  <span className="block font-black text-[#4a332d]">Sipariş Teslimatı</span>
                  <span className="text-[10px] text-gray-400 font-medium">Evine gelene kadar bekle</span>
                </div>
              </button>

              {/* Seçenek 2: Mağazadan Al */}
              <button 
                onClick={() => setStep(1)}
                className="bg-white border-2 border-gray-50 p-6 rounded-[32px] shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 active:scale-95"
              >
                <span className="text-4xl">🏪</span>
                <div className="text-center">
                  <span className="block font-black text-[#4a332d]">Sipariş Teslimi</span>
                  <span className="text-[10px] text-gray-400 font-medium">Mağazadan al</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADIM 1: ANA MENÜ EKRANI (SOL BAR AÇIK) --- */}
      {step === 1 && (
        <div className="animate-in slide-in-from-right duration-500 pb-28">
          {/* ÜST HEADER */}
          <header className="bg-white p-4 shadow-sm sticky top-0 z-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div onClick={() => setStep(0)} className="w-10 h-10 bg-[#63445d] rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg cursor-pointer">L</div>
                <div>
                  <h1 className="font-extrabold text-sm text-[#4a332d]">Location Waffle</h1>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider leading-none mt-1">{customerName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (showSearch) setSearchQuery('');
                  setShowSearch(!showSearch);
                }}
                className="bg-gray-50 p-2 rounded-xl text-[#63445d] border border-gray-100 transition-all active:scale-90"
              >
                {showSearch ? '✕' : '🔍'}
              </button>
            </div>
            {showSearch && (
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full mt-3 px-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#63445d] focus:ring-1 focus:ring-[#63445d]"
              />
            )}
          </header>

          <div className="flex">
            {/* SOL KATEGORİ BARI */}
            <aside className="w-20 bg-white border-r border-gray-100 min-h-[calc(100vh-73px)] sticky top-[73px] z-40">
              <nav className="flex flex-col">
                {Object.keys(menuData).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCat(cat);
                      document.getElementById(cat)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`py-5 px-1 text-[10px] font-black uppercase transition-all border-b border-gray-50 flex flex-col items-center gap-1 ${activeCat === cat ? 'bg-[#63445d]/5 text-[#63445d] border-r-4 border-r-[#63445d]' : 'text-gray-400'}`}
                  >
                    <span className="text-xl">{menuData[cat].icon}</span>{cat}
                  </button>
                ))}
              </nav>
            </aside>

            {/* ANA ÜRÜN LİSTESİ - TÜM KATEGORİLER ARK ARKAYA */}
            <main className="flex-1 p-4">
              {loading && (
                <div className="text-center text-gray-400 font-bold py-20 text-sm">Menü yükleniyor...</div>
              )}
              {!loading && Object.keys(menuData).map((cat) => {
                const q = searchQuery.trim().toLowerCase();
                const items = q
                  ? menuData[cat].items.filter(item => item.name.toLowerCase().includes(q))
                  : menuData[cat].items;
                if (items.length === 0) return null;
                return (
                  <div key={cat} id={cat} className="mb-8 scroll-mt-20">
                    <h2 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest ml-2">{cat} Ürünleri</h2>
                    {items.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedProduct(item); setShowModal(true); setActiveCat(cat); }}
                        className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 flex gap-4 active:scale-[0.98] transition-all cursor-pointer mb-4"
                      >
                        <div className="w-20 h-20 bg-orange-50 rounded-[20px] flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
                          {menuData[cat].icon}
                        </div>
                        <div className="flex flex-col justify-between py-0.5 w-full">
                          <div>
                            <h3 className="font-black text-sm text-[#4a332d]">{item.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{item.desc}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-black text-[#63445d] text-base italic">{item.price}.00 TL</span>
                            <div className="bg-[#63445d] text-white w-7 h-7 rounded-xl flex items-center justify-center text-xl font-bold shadow-md shadow-[#63445d]/30">+</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {!loading && searchQuery.trim() &&
                !Object.keys(menuData).some(cat =>
                  menuData[cat].items.some(item =>
                    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
                  )
                ) && (
                  <div className="text-center text-gray-400 font-bold py-20 text-sm">"{searchQuery}" için sonuç bulunamadı</div>
                )}
            </main>
          </div>

          {/* SABİT ALT NAVİGASYON */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 px-8 flex justify-between items-center z-[100] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <button onClick={() => setStep(0)} className="flex flex-col items-center gap-1 text-[#63445d]">
              <span className="text-2xl">🏠</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Ana Sayfa</span>
            </button>
            <button 
              onClick={() => setStep(2)}
              className="bg-[#63445d] text-white pl-6 pr-3 py-2.5 rounded-[22px] flex items-center gap-5 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[9px] opacity-70 font-black uppercase mb-1">Sepetim</span>
                <span className="text-base font-black italic text-white">{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} TL</span>
              </div>
              <div className="w-[1px] h-8 bg-white/20"></div>
              <div className="bg-white text-[#63445d] w-10 h-10 rounded-[18px] flex items-center justify-center text-xl shadow-inner">🛒</div>
            </button>
          </div>

          {/* ÜRÜN ÖZELLEŞTİRME MODALI */}
          {showModal && selectedProduct && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
              <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
                <div className="relative h-48 bg-orange-50 flex items-center justify-center text-7xl">
                  {menuData[activeCat].icon}
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#4a332d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 max-h-[50vh] overflow-y-auto">
                  <h2 className="text-xl font-black text-[#4a332d]">{selectedProduct.name}</h2>
                  <p className="text-[11px] text-gray-400 font-medium italic mb-6">{selectedProduct.desc}</p>

                  <div className="grid grid-cols-2 gap-3">
                    {menuData[activeCat].extras.map(extra => {
                      const isSelected = selectedExtras.some(e => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          disabled={!extra.stock}
                          onClick={() => toggleExtra(extra)}
                          className={`flex justify-between items-center p-4 rounded-[20px] border-2 transition-all text-[11px] font-bold ${
                            !extra.stock
                              ? 'bg-gray-50 text-gray-300 border-gray-50 opacity-60'
                              : isSelected
                                ? 'border-[#63445d] bg-[#63445d]/5 text-[#4a332d] shadow-sm'
                                : 'border-gray-50 hover:border-[#63445d] text-gray-700 shadow-sm'
                          }`}
                        >
                          <span className="flex flex-col items-start leading-tight">
                            {extra.name}
                            {!extra.stock && <span className="text-[8px] uppercase tracking-tighter text-red-400">Tükendi</span>}
                          </span>
                          {extra.stock && <span className="text-[#63445d] font-black">+ {extraPrice(extra)} TL</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ADET SEÇİCİ */}
                <div className="p-2 bg-white border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Adet Seçimi</h3>
                    <div className="flex items-center gap-1 border-2 border-gray-200 rounded-[10px] bg-white p-1">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-red-500 font-black text-base hover:bg-red-50 px-3 py-0.5 rounded transition-all active:scale-90"
                      >
                        −
                      </button>
                      <span className="text-base font-black text-gray-800 min-w-[22px] text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-red-500 font-black text-base hover:bg-red-50 px-3 py-0.5 rounded transition-all active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-gray-50 flex gap-2 sm:gap-3">
                  <button
                    disabled={submitting}
                    onClick={async () => {
                      if (!tableId) { alert('Masa bilgisi bulunamadı.'); return; }
                      setSubmitting(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/orders`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                          body: JSON.stringify({
                            table_id: tableId,
                            items: [{ product_id: selectedProduct.id, quantity, selected_extras: selectedExtras.map(e => ({ id: e.id })), note: '' }]
                          })
                        });
                        if (res.ok) { setShowModal(false); setQuantity(1); setStep(3); }
                        else { alert('Sipariş oluşturulamadı.'); }
                      } catch { alert('Sunucuya bağlanılamadı.'); }
                      finally { setSubmitting(false); }
                    }}
                    className="flex-1 py-2 sm:py-3 bg-white text-[#63445d] border-2 border-[#63445d] rounded-[18px] font-bold sm:font-black text-xs sm:text-sm shadow-md hover:bg-[#63445d]/5 transition-all disabled:opacity-60"
                  >
                    <span className="uppercase tracking-tighter sm:tracking-widest">{submitting ? 'Gönderiliyor...' : 'Şimdi Sipariş Ver'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCartItems([...cartItems, {
                        id: selectedProduct.id,
                        name: selectedProduct.name,
                        price: selectedProduct.price + extrasTotal,
                        quantity,
                        selectedExtras: selectedExtras.map(e => ({ id: e.id })),
                        note: '',
                      }]);
                      setShowModal(false);
                      setQuantity(1);
                    }}
                    className="flex-1 py-2 sm:py-3 bg-[#63445d] text-white rounded-[18px] font-bold sm:font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1 sm:gap-2"
                  >
                    <span className="uppercase tracking-tighter sm:tracking-widest">Sepete Ekle</span>
                    <div className="w-[1px] h-4 sm:h-6 bg-white/20"></div>
                    <span className="italic">{((selectedProduct.price + extrasTotal) * quantity).toFixed(2)} TL</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADIM 2: SEPET SAYFASI --- */}
      {step === 2 && (
        <div className="min-h-screen flex flex-col pt-20 pb-96 animate-in fade-in duration-500 bg-[#f8f9fa]">
          {/* BAŞLIK */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 z-50">
            <button 
              onClick={() => setStep(1)}
              className="text-[#63445d] hover:bg-gray-100 p-2 rounded-full transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="flex-1 text-center text-[#4a332d] text-xl font-black tracking-tight">SİPARİŞ ÖZETİ</h1>
            <div className="w-10"></div>
          </div>



          {/* İLETİŞİM BİLGİLERİ */}
          <div className="flex gap-3 px-4 mt-4">
            <div className="flex-1 bg-white rounded-[15px] p-3 border border-gray-50">
              <p className="text-[10px] text-gray-500 font-black uppercase mb-1">İsim</p>
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-sm font-bold text-[#4a332d] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* ÜRÜN LİSTESİ */}
          <div className="px-4 mt-6">
            <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-3">Seçilen Ürünler</h3>
            
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-[15px] p-8 text-center">
                <p className="text-gray-500 text-sm">Sepetinizde ürün bulunmamaktadır</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-[15px] overflow-hidden border border-gray-50 shadow-sm">
                    {/* Ürün Satırı */}
                    <div className="p-3 flex gap-3">
                      <div className="w-16 h-16 bg-orange-50 rounded-[12px] flex items-center justify-center flex-shrink-0 text-2xl">
                        {menuData[Object.keys(menuData).find(cat => menuData[cat].items.some(prod => prod.id === item.id))]?.icon || '🍴'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#4a332d] text-sm">{item.name}</p>
                        <div className="flex items-start justify-between mt-1">
                          <p className="text-[11px] text-gray-600 flex-1">Seçili Malzemeler:</p>
                          <p className="font-black text-[#63445d] text-sm ml-2">{(item.price * item.quantity).toFixed(2)} TL</p>
                        </div>
                      </div>
                    </div>

                    {/* Adet Sayacı */}
                    <div className="px-3 pb-3 flex items-center justify-between">
                      <button
                        onClick={() => setCartItems(cartItems.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-[10px] transition-all active:scale-90"
                        aria-label="Ürünü sil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-1 border-2 border-gray-200 rounded-[10px] bg-white p-1">
                        <button 
                          onClick={() => {
                            const newItems = [...cartItems];
                            if (newItems[index].quantity > 1) {
                              newItems[index].quantity--;
                              setCartItems(newItems);
                            }
                          }}
                          className="text-red-500 font-black text-base hover:bg-red-50 px-1 py-0.5 rounded transition-all active:scale-90"
                        >
                          −
                        </button>
                        <span className="text-base font-black text-gray-800 min-w-[22px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            const newItems = [...cartItems];
                            newItems[index].quantity++;
                            setCartItems(newItems);
                          }}
                          className="text-red-500 font-black text-base hover:bg-red-50 px-1 py-0.5 rounded transition-all active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Not Ekle */}
                    <div className="px-3 pb-3 border-t border-gray-50 pt-2">
                      <textarea
                        placeholder="Özel isteklerinizi yazınız..."
                        value={item.note || ''}
                        onChange={(e) => {
                          const newItems = [...cartItems];
                          newItems[index] = { ...newItems[index], note: e.target.value };
                          setCartItems(newItems);
                        }}
                        className="w-full text-[11px] text-gray-600 placeholder-gray-400 bg-gray-50 rounded-[8px] p-2 border border-gray-100 resize-none outline-none focus:border-[#63445d] focus:ring-1 focus:ring-[#63445d]"
                        rows="2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SABİT ALT PANEL */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-2xl">
            <div className="max-w-md mx-auto">
              {/* Toplam Tutar */}
              <div className="text-center mb-3 pb-3 border-b border-gray-100">
                <p className="text-[11px] text-gray-500 font-black uppercase mb-1">Toplam Tutar</p>
                <p className="text-3xl font-black text-[#63445d]">{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} TL</p>
              </div>

              {/* SİPARİŞ VER Butonu */}
              <button
                disabled={submitting || cartItems.length === 0}
                onClick={async () => {
                  if (!tableId) { alert('Masa bilgisi bulunamadı.'); return; }
                  setSubmitting(true);
                  try {
                    const res = await fetch(`${API_BASE}/api/orders`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                      body: JSON.stringify({
                        table_id: tableId,
                        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity, selected_extras: item.selectedExtras || [], note: item.note || '' }))
                      })
                    });
                    if (res.ok) { setCartItems([]); setStep(3); }
                    else { alert('Sipariş oluşturulamadı.'); }
                  } catch { alert('Sunucuya bağlanılamadı.'); }
                  finally { setSubmitting(false); }
                }}
                className="w-full bg-[#63445d] text-white py-3 sm:py-4 rounded-[18px] font-black text-sm sm:text-base uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-60"
              >
                {submitting ? 'GÖNDERİLİYOR...' : 'SİPARİŞ VER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADIM 3: TEŞEKKÜR EKRANI --- */}
      {step === 3 && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] px-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[32px] p-10 shadow-2xl max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6">✅</div>
            <h1 className="text-2xl font-black text-[#4a332d] mb-2">Siparişiniz Alındı!</h1>
            <p className="text-sm text-gray-500 font-medium mb-1">{customerName}</p>
            <p className="text-[12px] text-gray-400 font-medium mb-8">Siparişiniz mutfağa iletildi, kısa süre içinde hazırlanacak. Afiyet olsun! 🍽️</p>
            <button
              onClick={() => setStep(1)}
              className="w-full bg-[#63445d] text-white py-3 rounded-[18px] font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Menüye Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;