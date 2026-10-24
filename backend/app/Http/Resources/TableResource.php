<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status,
            'ticket' => $this->active_ticket,
            'time' => $this->occupied_at ? max(0, (int) $this->occupied_at->diffInMinutes(now())).' mnt' : null,
        ];
    }
}
