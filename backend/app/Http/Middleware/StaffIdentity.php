<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class StaffIdentity
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        // Public customer tracking: single order lookup by identifier does not expose global order data.
        if ($request->isMethod('GET') && $request->has('id')) {
            return $next($request);
        }

        abort_unless($request->header('X-Staff-Identity'), 401);
        return (new SignedIdentity)->handle($request, function ($request) use ($next, $roles) {
            $identity = $request->attributes->get('identity');
            abort_unless(($identity['purpose'] ?? '') === 'staff', 403);
            $account = \App\Models\StaffAccount::where('google_sub', $identity['sub'] ?? '')->first();
            abort_unless($account && $account->status === 'approved' && in_array($account->role, $roles, true), 403);
            $request->attributes->set('staff', $account);
            return $next($request);
        });
    }
}
