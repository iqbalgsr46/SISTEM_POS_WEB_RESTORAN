<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Cooking = 'COOKING';
    case Ready = 'READY';
    case Completed = 'COMPLETED';
    case Cancelled = 'CANCELLED';

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled], true);
    }

    public function canTransitionTo(self $next): bool
    {
        if ($this === $next) {
            return true;
        }

        return match ($this) {
            self::Cooking => in_array($next, [self::Ready, self::Cancelled], true),
            self::Ready => in_array($next, [self::Completed, self::Cancelled], true),
            default => false,
        };
    }
}
