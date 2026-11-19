package com.poserp.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.poserp.models.dto.ExpirationAlertResponse;
import com.poserp.models.entities.Product;
import com.poserp.services.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
@Tag(name = "2. Products & Inventory", description = "Manajemen katalog produk, stok menipis, dan pelacakan kedaluwarsa")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(
        summary = "Ambil semua daftar produk [Role: Owner, Gudang, Kasir]",
        description = "Menampilkan seluruh katalog produk beserta stok, harga, kategori, dan satuannya."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Daftar produk berhasil diambil"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan")
    })
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Ambil detail produk berdasarkan ID [Role: Owner, Gudang, Kasir]",
        description = "Mengambil informasi lengkap satu produk berdasarkan ID uniknya."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Detail produk ditemukan"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "404", description = "Produk tidak ditemukan")
    })
    public ResponseEntity<Product> getProductById(
            @Parameter(description = "ID produk", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    @Operation(
        summary = "Tambah produk baru [Role: Owner, Gudang]",
        description = "Menyimpan data produk baru ke inventaris. Ditolak dengan 403 Forbidden jika diakses oleh Kasir."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Produk berhasil dibuat"),
        @ApiResponse(responseCode = "400", description = "Validasi input gagal"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "403", description = "Hak akses ditolak (bukan Owner/Gudang)")
    })
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        Product created = productService.create(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Perbarui data produk [Role: Owner, Gudang]",
        description = "Mengubah nama, harga, stok, tanggal kedaluwarsa, kategori, atau satuan produk."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Produk berhasil diperbarui"),
        @ApiResponse(responseCode = "400", description = "Validasi input gagal"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "403", description = "Hak akses ditolak (bukan Owner/Gudang)"),
        @ApiResponse(responseCode = "404", description = "Produk tidak ditemukan")
    })
    public ResponseEntity<Product> updateProduct(
            @Parameter(description = "ID produk yang akan diubah", example = "1") @PathVariable Long id,
            @Valid @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Hapus produk [Role: Owner, Gudang]",
        description = "Menghapus produk dari katalog inventaris berdasarkan ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Produk berhasil dihapus"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "403", description = "Hak akses ditolak (bukan Owner/Gudang)"),
        @ApiResponse(responseCode = "404", description = "Produk tidak ditemukan")
    })
    public ResponseEntity<Void> deleteProduct(
            @Parameter(description = "ID produk yang akan dihapus", example = "1") @PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @Operation(
        summary = "Cek produk dengan stok menipis [Role: Owner, Gudang]",
        description = "Mengambil daftar produk yang jumlah stoknya berada di bawah atau sama dengan batas minimum (threshold)."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Daftar produk stok menipis berhasil diambil"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "403", description = "Hak akses ditolak (bukan Owner/Gudang)")
    })
    public ResponseEntity<List<Product>> getLowStockProducts(
            @Parameter(description = "Batas minimum stok", example = "10")
            @RequestParam(defaultValue = "10") Double threshold) {
        List<Product> lowStockProducts = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(lowStockProducts);
    }

    @GetMapping("/expiring")
    @Operation(
        summary = "Cek produk mendekati kedaluwarsa [Role: Owner, Gudang]",
        description = "Melacak produk yang sudah kedaluwarsa maupun yang akan kedaluwarsa dalam rentang hari tertentu."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Laporan produk kedaluwarsa berhasil diambil"),
        @ApiResponse(responseCode = "401", description = "Token JWT tidak valid atau tidak disertakan"),
        @ApiResponse(responseCode = "403", description = "Hak akses ditolak (bukan Owner/Gudang)")
    })
    public ResponseEntity<ExpirationAlertResponse> getExpiringProducts(
            @Parameter(description = "Rentang hari ke depan untuk peringatan kedaluwarsa", example = "7")
            @RequestParam(defaultValue = "7") Integer days) {
        return ResponseEntity.ok(productService.getExpiringProducts(days));
    }
}