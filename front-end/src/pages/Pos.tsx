import { useNavigate } from 'react-router-dom';
import { RefreshCw, ReceiptText } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AlertBanner from '../components/ui/AlertBanner';
import Button from '../components/ui/Button';
import { usePosTerminal } from '../features/pos/hooks/usePosTerminal';
import PosProductGrid from '../features/pos/components/PosProductGrid';
import PosCartPanel from '../features/pos/components/PosCartPanel';
import ReceiptModal from '../features/pos/components/ReceiptModal';

export default function Pos() {
  const navigate = useNavigate();
  const pos = usePosTerminal();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terminal Kasir (Point of Sale)"
        subtitle="Pilih produk, atur kuantitas belanja, dan proses pembayaran pelanggan"
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              isLoading={pos.loading}
              onClick={pos.fetchProducts}
            >
              Segarkan Stok
            </Button>
            <Button
              variant="secondary"
              icon={ReceiptText}
              onClick={() => navigate('/transactions')}
            >
              Riwayat Transaksi
            </Button>
          </>
        }
      />

      {pos.error && <AlertBanner variant="error" message={pos.error} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <PosProductGrid
            products={pos.filteredProducts}
            categories={pos.categories}
            loading={pos.loading}
            searchQuery={pos.searchQuery}
            onSearchChange={pos.setSearchQuery}
            onBarcodeEnter={pos.handleBarcodeEnter}
            selectedCategory={pos.selectedCategory}
            onCategoryChange={pos.setSelectedCategory}
            cartQuantityMap={pos.cartQuantityMap}
            onAddProduct={pos.addToCart}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <PosCartPanel
            cart={pos.cart}
            totalItems={pos.totalItems}
            totalAmount={pos.totalAmount}
            paymentMethod={pos.paymentMethod}
            onPaymentMethodChange={pos.setPaymentMethod}
            amountPaidInput={pos.amountPaidInput}
            onAmountPaidChange={pos.setAmountPaidInput}
            parsedAmountPaid={pos.parsedAmountPaid}
            changeAmount={pos.changeAmount}
            isPaymentValid={pos.isPaymentValid}
            submitting={pos.submitting}
            onUpdateQty={pos.updateCartQuantity}
            onRemoveItem={pos.removeFromCart}
            onClearCart={pos.clearCart}
            onCheckout={pos.submitCheckout}
          />
        </div>
      </div>

      <ReceiptModal
        transaction={pos.completedReceipt}
        onClose={() => pos.setCompletedReceipt(null)}
        showSuccessBanner
      />
    </div>
  );
}