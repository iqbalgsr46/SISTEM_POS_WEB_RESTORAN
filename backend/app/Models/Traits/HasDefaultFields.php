<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

// Trait HasDefaultFields: Mengotomasi pengisian 7 default fields pada model Eloquent
// Trait ini bekerja otomatis menggunakan event lifecycle model Laravel (creating, updating, deleted, restored)
trait HasDefaultFields
{
    public static function bootHasDefaultFields(): void
    {
        // 1. EVENT CREATING: Berjalan otomatis saat data baru akan disimpan pertama kali (operasi CREATE / INSERT)
        static::creating(function ($model) {
            // Isi CompanyCode default jika belum diisi (contoh: ELON01)
            if (empty($model->CompanyCode)) {
                $model->CompanyCode = config('app.company_code', 'ELON01');
            }

            // Set Status = 1 (Aktif) untuk tabel master produk/menu
            if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                if (! isset($model->Status)) {
                    $model->Status = 1;
                }
            }

            // Set IsDeleted = 0 (Data aktif / belum dihapus)
            if (! isset($model->IsDeleted)) {
                $model->IsDeleted = 0;
            }

            // Set CreatedBy = 'admin' (pencatat user pembuat data)
            if (empty($model->CreatedBy)) {
                $model->CreatedBy = 'admin';
            }

            // Set CreatedDate = waktu detik ini saat data dibuat
            if (empty($model->CreatedDate)) {
                $model->CreatedDate = now();
            }

            // Set LastUpdatedDate & LastUpdatedBy awal sama dengan waktu pembuatan
            if (empty($model->LastUpdatedDate)) {
                $model->LastUpdatedDate = now();
            }
            if (empty($model->LastUpdatedBy)) {
                $model->LastUpdatedBy = $model->CreatedBy;
            }
        });

        // 2. EVENT UPDATING: Berjalan otomatis saat ada perubahan data yang disimpan (operasi UPDATE)
        static::updating(function ($model) {
            // Perbarui LastUpdatedDate ke waktu saat pengeditan terjadi
            $model->LastUpdatedDate = now();

            // Catat siapa yang terakhir mengedit (default: 'admin')
            if (empty($model->LastUpdatedBy)) {
                $model->LastUpdatedBy = 'admin';
            }
        });

        // 3. EVENT DELETED & RESTORED: Khusus untuk model yang menggunakan SoftDeletes (operasi DELETE & RESTORE)
        if (in_array(SoftDeletes::class, class_uses_recursive(static::class))) {
            // Saat data dihapus (Soft Delete):
            static::deleted(function ($model) {
                if (method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting()) {
                    $update = [
                        'IsDeleted' => 1,          // Tandai IsDeleted = 1 (sudah dihapus/arsip)
                        'LastUpdatedDate' => now(), // Catat waktu penghapusan
                    ];
                    if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                        $update['Status'] = 0;     // Ubah Status = 0 (nonaktif)
                    }

                    DB::table($model->getTable())
                        ->where($model->getKeyName(), $model->getKey())
                        ->update($update);
                }
            });

            // Saat data dipulihkan dari arsip (Restore):
            static::restored(function ($model) {
                $update = [
                    'IsDeleted' => 0,          // Kembalikan IsDeleted = 0 (aktif kembali)
                    'LastUpdatedDate' => now(), // Catat waktu pemulihan
                ];
                if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                    $update['Status'] = 1;     // Kembalikan Status = 1 (tampil kembali)
                }

                DB::table($model->getTable())
                    ->where($model->getKeyName(), $model->getKey())
                    ->update($update);
            });
        }
    }
}
