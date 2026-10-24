<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireLocalDevelopment
{
    public function handle(Request $request, Closure $next): Response
    {
        // Replace this guard with authenticated staff policies in the login phase.
        abort_unless(app()->environment('local', 'testing'), 503, 'Akses operasional menunggu integrasi autentikasi staf.');

        return $next($request);
    }
}
