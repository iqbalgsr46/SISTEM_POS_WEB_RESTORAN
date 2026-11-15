<?php

namespace App\Models;

use App\Models\Traits\HasDefaultFields;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

// Model MenuItem: mewakili tabel 'menu_items' di database MySQL
class MenuItem extends Model
{
    // SoftDeletes: fitur hapus aman (data tidak hilang fisik dari database, melainkan ditandai waktu hapusnya di 'deleted_at')
    // HasDefaultFields: trait otomatis untuk mengisi 7 default fields audit (CompanyCode, Status, IsDeleted, CreatedBy, dll.)
    use SoftDeletes, HasDefaultFields;

    // Daftar kolom tabel yang diizinkan untuk diisi atau diubah (mass assignment)
    protected $fillable = [
        // 1. Kolom data produk menu
        'channel',         // Kanal penjualan: dine_in, takeaway, kios, pos
        'code',            // Kode unik menu per kanal
        'stock_id',        // Relasi ID ke tabel stocks (stok bersama di dapur)
        'name',            // Nama menu makanan/minuman
        'category_id',     // ID kategori (misal: mie, camilan, beverages)
        'category_title',  // Judul kategori tampilan
        'price',           // Harga menu dalam rupiah
        'station',         // Stasiun masak: kitchen (dapur) atau bar (minuman)
        'sort_order',      // Urutan urutan tampil di katalog
        'details',         // Data tambahan dalam bentuk JSON (gambar, deskripsi singkat, dll.)

        // 2. Kolom standar enterprise: 7 Default Audit Fields
        'CompanyCode',     // Kode perusahaan/cabang (contoh: ELON01)
        'Status',          // Status visibilitas menu (1 = Aktif/Tampil, 0 = Nonaktif)
        'IsDeleted',       // Penanda soft delete (0 = Ada, 1 = Sudah Dihapus)
        'CreatedBy',       // Username staf yang pertama kali membuat data
        'CreatedDate',     // Tanggal & waktu data dibuat
        'LastUpdatedBy',   // Username staf yang terakhir kali mengubah data
        'LastUpdatedDate', // Tanggal & waktu data terakhir kali diubah
    ];

    // Konversi tipe data otomatis dari database ke tipe data PHP
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'details' => 'array',
        ];
    }

    // Relasi: Setiap menu terhubung ke 1 data stok bahan baku di tabel stocks
    public function stock(): BelongsTo
    {
        return $this->belongsTo(Stock::class);
    }
}
