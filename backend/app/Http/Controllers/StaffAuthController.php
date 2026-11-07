<?php
namespace App\Http\Controllers;
use App\Models\StaffAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class StaffAuthController extends Controller {
 public function index() { return response()->json(StaffAccount::orderBy('id')->get()); }
 public function me(Request $request) {
  $identity = $request->attributes->get('identity');
  abort_unless(($identity['purpose'] ?? '') === 'staff', 403);
  return response()->json(StaffAccount::where('google_sub', $identity['sub'] ?? '')->firstOrFail());
 }
 public function update(Request $request) {
  $data = $request->validate(['id'=>'required|integer','status'=>'required|in:pending,approved,rejected,disabled','role'=>'nullable|in:admin,cashier,kitchen']);
  abort_if($data['status'] === 'approved' && empty($data['role']), 422);
  return DB::transaction(function () use ($data) {
   // Stable lock order serializes simultaneous admin removals.
   $accounts = StaffAccount::orderBy('id')->lockForUpdate()->get();
   $account = $accounts->firstWhere('id', $data['id']);
   abort_unless($account, 404);
   $removing = $data['status'] !== 'approved' || ($data['role'] ?? null) !== 'admin';
   abort_if($account->status === 'approved' && $account->role === 'admin' && $removing && $accounts->where('status','approved')->where('role','admin')->count() <= 1, 409, 'Cannot remove the last approved admin.');
   $account->update(['status'=>$data['status'], 'role'=>$data['role'] ?? null]);
   return response()->json($account);
  });
 }
 public function provision(Request $request) {
  abort_unless($request->attributes->get('identity')['purpose'] === 'provision', 403);
  $data = $request->validate(['sub'=>'required|string|max:255','email'=>'required|email|max:255','email_verified'=>'required|accepted','name'=>'required|string|max:255']);
  abort_unless($request->input('email_verified') === true, 422);
  $account = DB::transaction(function () use ($data) {
   $existing = StaffAccount::where('google_sub', $data['sub'])->lockForUpdate()->first();
   if ($existing) return $existing;
   abort_if(StaffAccount::where('email', $data['email'])->exists(), 409, 'Email already linked.');
   $bootstrap = $data['email'] === 'ikbalgsr46@gmail.com';
   return StaffAccount::create(['google_sub'=>$data['sub'], 'email'=>$data['email'], 'name'=>$data['name'], 'status'=>$bootstrap ? 'approved':'pending', 'role'=>$bootstrap ? 'admin':null]);
  });
  return response()->json($account, $account->wasRecentlyCreated ? 201:200);
 }
}
