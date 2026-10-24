<?php

namespace App\Enums;

enum OrderSource: string
{
    case DineIn = 'Dine-In';
    case Takeaway = 'Takeaway';
    case Kiosk = 'Kios Lobby';
    case Cashier = 'Kasir Fisik';

    public function channel(): string
    {
        return match ($this) {
            self::DineIn => 'dine_in',
            self::Takeaway => 'takeaway',
            self::Kiosk => 'kios',
            self::Cashier => 'pos',
        };
    }

    public function ticketPrefix(): string
    {
        return match ($this) {
            self::DineIn => 'D',
            self::Takeaway => 'T',
            self::Kiosk => 'K',
            self::Cashier => 'C',
        };
    }
}
