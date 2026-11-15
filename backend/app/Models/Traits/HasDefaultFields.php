<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

trait HasDefaultFields
{
    public static function bootHasDefaultFields(): void
    {
        static::creating(function ($model) {
            if (empty($model->CompanyCode)) {
                $model->CompanyCode = config('app.company_code', 'ELON01');
            }

            // Status tinyint hanya di-set untuk tabel yang tidak memiliki domain status tersendiri
            if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                if (! isset($model->Status)) {
                    $model->Status = 1;
                }
            }

            if (! isset($model->IsDeleted)) {
                $model->IsDeleted = 0;
            }
            if (empty($model->CreatedBy)) {
                $model->CreatedBy = 'admin';
            }
            if (empty($model->CreatedDate)) {
                $model->CreatedDate = now();
            }
            if (empty($model->LastUpdatedDate)) {
                $model->LastUpdatedDate = now();
            }
            if (empty($model->LastUpdatedBy)) {
                $model->LastUpdatedBy = $model->CreatedBy;
            }
        });

        static::updating(function ($model) {
            $model->LastUpdatedDate = now();
            if (empty($model->LastUpdatedBy)) {
                $model->LastUpdatedBy = 'admin';
            }
        });

        // Sinkronisasi IsDeleted untuk model yang menggunakan SoftDeletes
        if (in_array(SoftDeletes::class, class_uses_recursive(static::class))) {
            static::deleted(function ($model) {
                if (method_exists($model, 'isForceDeleting') && ! $model->isForceDeleting()) {
                    $update = [
                        'IsDeleted' => 1,
                        'LastUpdatedDate' => now(),
                    ];
                    if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                        $update['Status'] = 0;
                    }

                    DB::table($model->getTable())
                        ->where($model->getKeyName(), $model->getKey())
                        ->update($update);
                }
            });

            static::restored(function ($model) {
                $update = [
                    'IsDeleted' => 0,
                    'LastUpdatedDate' => now(),
                ];
                if (! in_array($model->getTable(), ['restaurant_tables', 'orders', 'staff_accounts'])) {
                    $update['Status'] = 1;
                }

                DB::table($model->getTable())
                    ->where($model->getKeyName(), $model->getKey())
                    ->update($update);
            });
        }
    }
}
